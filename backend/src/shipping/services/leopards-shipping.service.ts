import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrderShipping as PrismaOrderShipping, Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  customOrderItemUnitWeightKg,
  DEFAULT_SHIPPING_WEIGHT_KG,
  isCustomOrderItemMetadata,
} from '../utils/shipping-weight';
import { OrderShipping } from '../entities/shipping-zone.entity';
import { cleanLeopardsEnvValue } from '../../common/utils/leopards-env.util';

const DEFAULT_LEOPARDS_API_BASE_URL =
  'https://merchantapi.leopardscourier.com/api';

/** Public customer tracking page (CN appended as query). */
export const LEOPARDS_PUBLIC_TRACKING_BASE =
  'https://www.leopardscourier.com/tracking/';

/** Default service type code when booking (Overnight Air). */
const DEFAULT_SHIPMENT_TYPE = 'OVERNIGHT';

/**
 * Admin codes → Leopards bookPacket `shipment_type` values.
 * OVERNIGHT = Overnight Air, OVERLAND = Overland Surface/Cargo, DETAIN = Economy.
 */
const SHIPMENT_TYPE_TO_API: Record<string, string> = {
  OVERNIGHT: 'overnight',
  OVERLAND: 'overland',
  DETAIN: 'detain',
  overnight: 'overnight',
  overland: 'overland',
  detain: 'detain',
};

/**
 * Map admin/service shipment type to Leopards API `shipment_type`.
 * Defaults to overnight (Overnight Air) when missing/unknown.
 */
export function mapLeopardsShipmentType(
  raw?: string | null,
): 'overnight' | 'overland' | 'detain' {
  const key = String(raw ?? DEFAULT_SHIPMENT_TYPE).trim();
  if (!key) return 'overnight';

  const mapped =
    SHIPMENT_TYPE_TO_API[key] ?? SHIPMENT_TYPE_TO_API[key.toUpperCase()];
  if (mapped === 'overnight' || mapped === 'overland' || mapped === 'detain') {
    return mapped;
  }
  return 'overnight';
}

/**
 * Fallback Leopards city IDs for major Pakistan cities when getAllCities
 * is empty, unreachable, or returns an unexpected shape.
 * Keys must be lowercase canonical city names.
 */
export const LEOPARDS_STATIC_CITY_IDS: Readonly<Record<string, number>> = {
  karachi: 592,
  lahore: 836,
  islamabad: 516,
  rawalpindi: 1104,
  faisalabad: 392,
  multan: 888,
  peshawar: 1032,
  quetta: 1072,
  hyderabad: 500,
  sialkot: 1224,
  gujranwala: 448,
};

const PAKISTAN_PROVINCE_SUFFIXES = [
  'sindh',
  'sind',
  'punjab',
  'kpk',
  'khyber pakhtunkhwa',
  'khyberpakhtunkhwa',
  'balochistan',
  'baluchistan',
  'gilgit baltistan',
  'gilgit-baltistan',
  'azad kashmir',
  'ajk',
  'pakistan',
  'pk',
];

/** True when a comma/dash segment is only a postal/ZIP code. */
function isPostalCodeSegment(segment: string): boolean {
  return /^\d{4,6}$/.test(segment.trim());
}

/** True when a segment is only a province/country label. */
function isProvinceSegment(segment: string): boolean {
  const s = segment.trim().toLowerCase();
  return PAKISTAN_PROVINCE_SUFFIXES.includes(s);
}

/**
 * Normalize a shipping city string for Leopards lookup (ESSA-style):
 * - Split "Karachi, sindh, 75740" → take city segment only
 * - Strip postal codes and province/country labels
 * - Trim + lowercase for case-insensitive matching
 */
export function normalizeLeopardsCityName(raw?: string | null): string {
  let value = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_/\\|]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (!value) return '';

  // Prefer the first meaningful comma/dash segment (city before province/postal).
  // Hyphen must be escaped/first in the class so it is not treated as a range.
  const segments = value
    .split(/[,\-–—]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const citySegment =
    segments.find(
      (part) => !isPostalCodeSegment(part) && !isProvinceSegment(part),
    ) ?? segments[0] ??
    value;

  value = citySegment;

  // Remove embedded postal codes: "karachi 75740" → "karachi"
  value = value.replace(/\b\d{4,6}\b/g, ' ').replace(/\s+/g, ' ').trim();

  for (const suffix of PAKISTAN_PROVINCE_SUFFIXES) {
    if (value.endsWith(` ${suffix}`)) {
      value = value.slice(0, -(suffix.length + 1)).trim();
    }
  }

  // Drop trailing "city" / "town" noise: "karachi city" → "karachi"
  value = value.replace(/\b(city|town|tehsil|district)\b/g, ' ').trim();
  value = value.replace(/\s+/g, ' ');

  return value;
}

/** Resolve a city name against the static major-city dictionary. */
export function resolveStaticLeopardsCityId(
  cityName: string,
): number | null {
  const normalized = normalizeLeopardsCityName(cityName);
  if (!normalized) return null;

  const direct = LEOPARDS_STATIC_CITY_IDS[normalized];
  if (direct != null) return direct;

  // Alias / contains match (e.g. "north karachi" → karachi)
  for (const [name, id] of Object.entries(LEOPARDS_STATIC_CITY_IDS)) {
    if (
      normalized === name ||
      normalized.startsWith(`${name} `) ||
      normalized.endsWith(` ${name}`) ||
      normalized.includes(` ${name} `)
    ) {
      return id;
    }
  }

  return null;
}

export type LeopardsApiShipmentType = ReturnType<
  typeof mapLeopardsShipmentType
>;

export type LeopardsBookPacketPayload = {
  api_key: string;
  api_password: string;
  booked_packet_weight: string;
  booked_packet_vol_weight_w: string;
  booked_packet_vol_weight_h: string;
  booked_packet_vol_weight_l: string;
  booked_packet_no_piece: string;
  booked_packet_collect_amount: string;
  booked_packet_order_id: string;
  origin_city: string;
  destination_city: string;
  shipment_name_eng: string;
  shipment_email: string;
  shipment_phone: string;
  shipment_address: string;
  consignment_name_eng: string;
  consignment_email: string;
  consignment_phone: string;
  consignment_phone_two: string;
  consignment_phone_three: string;
  consignment_address: string;
  special_instructions: string;
  /** Leopards Merchant API service type (overnight | overland | detain). */
  shipment_type: LeopardsApiShipmentType;
};

export type LeopardsBookPacketResponse = {
  status: number | string;
  error?: number | string;
  track_number?: string;
  slip_link?: string;
  [key: string]: unknown;
};

export type LeopardsTrackPacketResponse = {
  status: number | string;
  error?: number | string;
  packet_list?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type LeopardsCity = {
  id: number;
  name: string;
};

export type BookLeopardsOrderResult = {
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string | null;
  courierCode: string;
  courierName: string;
  shipmentType: LeopardsApiShipmentType;
  shipping: OrderShipping;
  apiResponse: LeopardsBookPacketResponse;
};

export type BookLeopardsOptions = {
  /** Admin code OVERNIGHT | OVERLAND | DETAIN, or API overnight | overland | detain. */
  serviceType?: string | null;
  shipmentType?: string | null;
  specialInstructions?: string | null;
};

export type BulkBookLeopardsResultItem = {
  orderId: string;
  orderNumber?: string;
  status: 'booked' | 'skipped' | 'failed';
  cnNumber?: string;
  trackingUrl?: string;
  error?: string;
};

export type BulkBookLeopardsResult = {
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results: BulkBookLeopardsResultItem[];
};

type AddressSnapshot = {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

@Injectable()
export class LeopardsShippingService {
  private readonly logger = new Logger(LeopardsShippingService.name);
  private cityCache: { fetchedAt: number; cities: LeopardsCity[] } | null =
    null;
  private readonly cityCacheTtlMs = 24 * 60 * 60 * 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /** Credentials and defaults from process.env (never hardcoded secrets). */
  getConfig() {
    const apiKey = cleanLeopardsEnvValue(process.env.LEOPARDS_API_KEY) || '';
    const apiPassword =
      cleanLeopardsEnvValue(process.env.LEOPARDS_API_PASSWORD) || '';
    const baseUrl = (
      cleanLeopardsEnvValue(process.env.LEOPARDS_API_URL) ||
      cleanLeopardsEnvValue(process.env.LEOPARDS_API_BASE_URL) ||
      cleanLeopardsEnvValue(process.env.LEOPARDS_BASE_URL) ||
      DEFAULT_LEOPARDS_API_BASE_URL
    ).replace(/\/+$/, '');
    const originCityId = (
      process.env.LEOPARDS_ORIGIN_CITY_ID?.trim() || '592'
    ).trim();
    const shipperName = process.env.LEOPARDS_SHIPPER_NAME?.trim() || 'self';
    const shipperEmail = process.env.LEOPARDS_SHIPPER_EMAIL?.trim() || 'self';
    const shipperPhone = process.env.LEOPARDS_SHIPPER_PHONE?.trim() || 'self';
    const shipperAddress =
      process.env.LEOPARDS_SHIPPER_ADDRESS?.trim() || 'self';
    const trackingBase =
      process.env.LEOPARDS_TRACKING_URL_BASE?.trim() ||
      LEOPARDS_PUBLIC_TRACKING_BASE;

    return {
      apiKey,
      apiPassword,
      baseUrl,
      originCityId,
      shipperName,
      shipperEmail,
      shipperPhone,
      shipperAddress,
      trackingBase,
    };
  }

  assertConfigured(): void {
    const { apiKey, apiPassword } = this.getConfig();
    if (!apiKey || !apiPassword) {
      throw new ServiceUnavailableException(
        'Leopards Courier is not configured. Set LEOPARDS_API_KEY and LEOPARDS_API_PASSWORD.',
      );
    }
  }

  buildTrackingUrl(trackNumber: string): string {
    const { trackingBase } = this.getConfig();
    const base = trackingBase.replace(/\/+$/, '');
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}cn=${encodeURIComponent(trackNumber)}`;
  }

  /** Merchant API JSON endpoint: `{baseUrl}/{action}/format/json/` */
  buildLeopardsApiUrl(action: string): string {
    const { baseUrl } = this.getConfig();
    const normalizedAction = action.replace(/^\/+|\/+$/g, '');
    return `${baseUrl.replace(/\/+$/, '')}/${normalizedAction}/format/json/`;
  }

  private formatLeopardsApiError(error: unknown, fallback: string): string {
    if (error == null || error === '') return fallback;
    if (typeof error === 'string' || typeof error === 'number') {
      return String(error);
    }
    try {
      return JSON.stringify(error);
    } catch {
      return fallback;
    }
  }

  private extractLeopardsErrorMessage(
    body: LeopardsBookPacketResponse | null | undefined,
  ): string {
    if (!body || typeof body !== 'object') {
      return 'Empty response from Leopards bookPacket';
    }

    const record = body as Record<string, unknown>;
    const candidates = [
      body.error,
      record.error_msg,
      record.message,
      record.errorMessage,
    ];

    for (const candidate of candidates) {
      const message = this.formatLeopardsApiError(candidate, '');
      if (message) return message;
    }

    return 'Leopards bookPacket failed';
  }

  private safeJson(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  /**
   * Build the Merchant API bookPacket JSON body (weight in grams).
   * Exported for unit tests that assert payload shape.
   */
  buildBookPacketPayload(input: {
    weightKg: number;
    pieces: number;
    collectAmount: number;
    orderReferenceId: string;
    destinationCityId: string | number;
    consigneeName: string;
    consigneePhone: string;
    consigneeEmail?: string;
    consigneeAddress: string;
    specialInstructions?: string;
    serviceType?: string | null;
    shipmentType?: string | null;
    volWeight?: { w?: number; h?: number; l?: number };
  }): LeopardsBookPacketPayload {
    this.assertConfigured();
    const config = this.getConfig();
    const weightGrams = Math.max(
      1,
      Math.round(Math.max(0, input.weightKg) * 1000),
    );
    const pieces = Math.max(1, Math.floor(input.pieces) || 1);
    const collectAmount = Math.max(0, Math.round(input.collectAmount));
    const shipmentType = mapLeopardsShipmentType(
      input.serviceType ?? input.shipmentType,
    );

    return {
      api_key: config.apiKey,
      api_password: config.apiPassword,
      booked_packet_weight: String(weightGrams),
      booked_packet_vol_weight_w: String(input.volWeight?.w ?? 10),
      booked_packet_vol_weight_h: String(input.volWeight?.h ?? 10),
      booked_packet_vol_weight_l: String(input.volWeight?.l ?? 10),
      booked_packet_no_piece: String(pieces),
      booked_packet_collect_amount: String(collectAmount),
      booked_packet_order_id: String(input.orderReferenceId),
      origin_city: config.originCityId,
      destination_city: String(input.destinationCityId),
      shipment_name_eng: config.shipperName,
      shipment_email: config.shipperEmail,
      shipment_phone: config.shipperPhone,
      shipment_address: config.shipperAddress,
      consignment_name_eng: input.consigneeName,
      consignment_email: input.consigneeEmail?.trim() || '',
      consignment_phone: input.consigneePhone,
      consignment_phone_two: '',
      consignment_phone_three: '',
      consignment_address: input.consigneeAddress,
      special_instructions: input.specialInstructions?.trim() || 'n/a',
      shipment_type: shipmentType,
    };
  }

  /**
   * Parse Merchant API bookPacket response; throws on failure.
   */
  parseBookPacketResponse(
    body: LeopardsBookPacketResponse | null | undefined,
  ): { trackNumber: string; slipLink: string | null } {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Empty response from Leopards bookPacket');
    }

    const statusOk =
      body.status === 1 || body.status === '1' || Number(body.status) === 1;

    const trackNumber =
      typeof body.track_number === 'string'
        ? body.track_number.trim()
        : body.track_number != null
          ? String(body.track_number).trim()
          : '';

    if (!statusOk || !trackNumber) {
      const errMsg = this.extractLeopardsErrorMessage(body);
      this.logger.error(
        `Leopards bookPacket rejected: ${errMsg} response=${this.safeJson(body)}`,
      );
      throw new BadRequestException(errMsg);
    }

    const slipLink =
      typeof body.slip_link === 'string' && body.slip_link.trim()
        ? body.slip_link.trim()
        : null;

    return { trackNumber, slipLink };
  }

  async bookPacket(
    payload: LeopardsBookPacketPayload,
  ): Promise<LeopardsBookPacketResponse> {
    const { apiKey, apiPassword } = this.getConfig();
    const url = this.buildLeopardsApiUrl('bookPacket');
    const body: LeopardsBookPacketPayload = {
      ...payload,
      api_key: apiKey,
      api_password: apiPassword,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<LeopardsBookPacketResponse>(url, body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30_000,
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const responseBody = axiosError.response?.data;
      if (responseBody != null) {
        this.logger.error(
          `Leopards bookPacket HTTP ${axiosError.response?.status ?? 'error'} response=${this.safeJson(responseBody)}`,
        );
      } else {
        this.logger.error('Leopards bookPacket HTTP error', error);
      }
      throw new ServiceUnavailableException(
        'Failed to reach Leopards Courier bookPacket API',
      );
    }
  }

  async trackBookedPacket(
    trackNumbers: string | string[],
  ): Promise<LeopardsTrackPacketResponse> {
    this.assertConfigured();
    const { apiKey, apiPassword } = this.getConfig();
    const numbers = Array.isArray(trackNumbers)
      ? trackNumbers.join(',')
      : trackNumbers;
    const url = this.buildLeopardsApiUrl('trackBookedPacket');

    try {
      const response = await firstValueFrom(
        this.httpService.post<LeopardsTrackPacketResponse>(
          url,
          {
            api_key: apiKey,
            api_password: apiPassword,
            track_numbers: numbers,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30_000,
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Leopards trackBookedPacket HTTP error', error);
      throw new ServiceUnavailableException(
        'Failed to reach Leopards Courier trackBookedPacket API',
      );
    }
  }

  /**
   * Fetch Leopards city list. Returns [] (does not throw) when the API fails
   * or the payload shape is unexpected — callers fall back to static IDs.
   */
  async getAllCities(forceRefresh = false): Promise<LeopardsCity[]> {
    this.assertConfigured();
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cityCache &&
      now - this.cityCache.fetchedAt < this.cityCacheTtlMs
    ) {
      return this.cityCache.cities;
    }

    const { apiKey, apiPassword } = this.getConfig();
    const url = this.buildLeopardsApiUrl('getAllCities');

    try {
      const response = await firstValueFrom(
        this.httpService.post<Record<string, unknown>>(
          url,
          { api_key: apiKey, api_password: apiPassword },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30_000,
          },
        ),
      );

      const cities = this.parseCityListResponse(response.data);
      this.cityCache = { fetchedAt: now, cities };
      if (cities.length === 0) {
        this.logger.warn(
          'Leopards getAllCities returned no parseable cities; static fallback will be used when needed',
        );
      }
      return cities;
    } catch (error) {
      this.logger.error(
        'Leopards getAllCities HTTP error; static city fallback will be used',
        error,
      );
      this.cityCache = { fetchedAt: now, cities: [] };
      return [];
    }
  }

  /** Extract city rows from various Merchant API response shapes. */
  parseCityListResponse(data: unknown): LeopardsCity[] {
    if (!data || typeof data !== 'object') return [];

    const root = data as Record<string, unknown>;
    const candidates: unknown[] = [
      root.city_list,
      root.cityList,
      root.cities,
      root.data,
    ];

    let list: unknown[] = [];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        list = candidate;
        break;
      }
      if (
        candidate &&
        typeof candidate === 'object' &&
        !Array.isArray(candidate)
      ) {
        const nested = candidate as Record<string, unknown>;
        const nestedList =
          nested.city_list ?? nested.cityList ?? nested.cities;
        if (Array.isArray(nestedList)) {
          list = nestedList;
          break;
        }
      }
    }

    const cities: LeopardsCity[] = [];
    for (const row of list) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const record = row as Record<string, unknown>;
      const idRaw =
        record.id ??
        record.city_id ??
        record.cityId ??
        record.cityID ??
        record.value;
      const nameRaw =
        record.name ??
        record.city_name ??
        record.cityName ??
        record.label ??
        record.title;
      const id = Number(idRaw);
      const name = typeof nameRaw === 'string' ? nameRaw.trim() : '';
      if (Number.isFinite(id) && id > 0 && name) {
        cities.push({ id, name });
      }
    }
    return cities;
  }

  /**
   * Resolve destination city to a numeric Leopards city ID.
   * Matching is case-insensitive / trimmed; strips "City, Province" suffixes.
   * Falls back to {@link LEOPARDS_STATIC_CITY_IDS} when API list is empty.
   */
  async resolveDestinationCityId(cityName: string): Promise<number> {
    const raw = String(cityName ?? '').trim();
    if (!raw) {
      throw new BadRequestException(
        'Shipping city is required for Leopards booking',
      );
    }

    // Allow numeric IDs stored directly in the city field.
    if (/^\d+$/.test(raw)) {
      return Number(raw);
    }

    const needle = normalizeLeopardsCityName(raw);
    if (!needle) {
      throw new BadRequestException(
        'Shipping city is required for Leopards booking',
      );
    }

    let cities: LeopardsCity[] = [];
    try {
      cities = await this.getAllCities();
    } catch (error) {
      this.logger.warn(
        `Leopards city list unavailable while resolving "${raw}"; using static fallback`,
        error,
      );
      cities = [];
    }

    const fromApi = this.matchCityInList(cities, needle);
    if (fromApi != null) {
      this.logger.log(
        `Leopards destination_city mapped "${raw}" → ${fromApi} (API list)`,
      );
      return fromApi;
    }

    const fromStatic = resolveStaticLeopardsCityId(needle);
    if (fromStatic != null) {
      this.logger.log(
        `Leopards destination_city mapped "${raw}" → ${fromStatic} (static fallback)`,
      );
      return fromStatic;
    }

    throw new BadRequestException(
      `Destination city "${cityName}" is not mapped in Leopards city list`,
    );
  }

  private matchCityInList(
    cities: LeopardsCity[],
    needle: string,
  ): number | null {
    if (!cities.length || !needle) return null;

    const normalizedCities = cities.map((c) => ({
      id: c.id,
      raw: c.name,
      name: normalizeLeopardsCityName(c.name),
    }));

    const exact = normalizedCities.find((c) => c.name === needle);
    if (exact) return exact.id;

    const startsWith = normalizedCities.find(
      (c) =>
        c.name.startsWith(needle) ||
        needle.startsWith(c.name) ||
        c.raw.toLowerCase().trim().startsWith(needle),
    );
    if (startsWith) return startsWith.id;

    const contains = normalizedCities.find(
      (c) =>
        c.name.includes(needle) ||
        needle.includes(c.name) ||
        c.raw.toLowerCase().includes(needle),
    );
    if (contains) return contains.id;

    return null;
  }

  /**
   * Book an order with Leopards and persist CN on OrderShipping.
   */
  async bookOrder(
    orderId: string,
    options: BookLeopardsOptions = {},
  ): Promise<BookLeopardsOrderResult> {
    this.assertConfigured();

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shipping: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const allowedStatuses = new Set(['pending', 'processing']);
    if (!allowedStatuses.has(order.status)) {
      throw new BadRequestException(
        `Only pending or processing orders can be booked with Leopards (current: ${order.status})`,
      );
    }

    if (order.shipping?.trackingNumber) {
      throw new BadRequestException(
        `Order already has tracking number ${order.shipping.trackingNumber}`,
      );
    }

    const apiShipmentType = mapLeopardsShipmentType(
      options.serviceType ?? options.shipmentType,
    );

    const shippingAddress = this.parseAddress(order.shippingAddress);
    const billingAddress = this.parseAddress(order.billingAddress);

    const consigneeName =
      [shippingAddress.firstName, shippingAddress.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      order.customerName?.trim() ||
      'Customer';

    const consigneePhone =
      shippingAddress.phone?.trim() || billingAddress.phone?.trim() || '';
    if (!consigneePhone) {
      throw new BadRequestException(
        'Consignee phone is required to book with Leopards',
      );
    }

    const cityName = shippingAddress.city?.trim() || '';
    const destinationCityId = await this.resolveDestinationCityId(cityName);

    const addressParts = [
      shippingAddress.addressLine1,
      shippingAddress.addressLine2,
      shippingAddress.company,
    ]
      .map((p) => p?.trim())
      .filter(Boolean);
    const consigneeAddress = addressParts.join(', ') || cityName;
    if (!consigneeAddress.trim()) {
      throw new BadRequestException(
        'Consignee address is required to book with Leopards',
      );
    }

    const weightKg = this.calculateOrderWeightKg(order.items);
    const pieces = order.items.reduce(
      (sum, item) => sum + Math.max(0, item.quantity || 0),
      0,
    );

    const isCod = this.isCodOrder(order);
    const collectAmount = isCod
      ? Math.round(Number(order.grandTotal.toString()))
      : 0;

    const specialInstructions =
      options.specialInstructions?.trim() || order.notes || undefined;

    const payload = this.buildBookPacketPayload({
      weightKg,
      pieces: pieces || 1,
      collectAmount,
      orderReferenceId: order.orderNumber,
      destinationCityId,
      consigneeName,
      consigneePhone,
      consigneeEmail: order.customerEmail || undefined,
      consigneeAddress,
      specialInstructions,
      serviceType: apiShipmentType,
    });

    const apiResponse = await this.bookPacket(payload);
    const { trackNumber, slipLink } = this.parseBookPacketResponse(apiResponse);
    const trackingUrl = this.buildTrackingUrl(trackNumber);

    const shippingMethodId = await this.resolveLeopardsShippingMethodId();
    const courierCode = 'leopards';
    const courierName = 'Leopards Courier';

    const existingMeta =
      order.shipping?.metadata &&
      typeof order.shipping.metadata === 'object' &&
      !Array.isArray(order.shipping.metadata)
        ? (order.shipping.metadata as Record<string, unknown>)
        : {};

    const metadata: Prisma.InputJsonValue = {
      ...existingMeta,
      leopards: {
        track_number: trackNumber,
        slip_link: slipLink,
        destination_city_id: destinationCityId,
        shipment_type: apiShipmentType,
        booked_at: new Date().toISOString(),
        api_status: apiResponse.status,
      },
    };

    let orderShipping: PrismaOrderShipping;
    if (order.shipping) {
      orderShipping = await this.prisma.orderShipping.update({
        where: { orderId },
        data: {
          trackingNumber: trackNumber,
          trackingUrl,
          courierCode,
          courierName,
          status: 'shipped',
          shippedAt: order.shipping.shippedAt ?? new Date(),
          metadata,
        },
      });
    } else {
      orderShipping = await this.prisma.orderShipping.create({
        data: {
          orderId,
          shippingMethodId,
          cost: order.shippingTotal,
          currency: order.currency,
          status: 'shipped',
          trackingNumber: trackNumber,
          trackingUrl,
          courierCode,
          courierName,
          shippedAt: new Date(),
          shippingAddress: order.shippingAddress as Prisma.InputJsonValue,
          metadata,
        },
      });
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'shipped',
        metadata: {
          ...this.asRecord(order.metadata),
          courierName,
          courierCode,
          trackingNumber: trackNumber,
          trackingUrl,
          leopardsShipmentType: apiShipmentType,
        },
      },
    });

    this.logger.log(
      `Leopards booked order ${order.orderNumber}: CN ${trackNumber} (${apiShipmentType})`,
    );

    return {
      trackingNumber: trackNumber,
      trackingUrl,
      labelUrl: slipLink,
      courierCode,
      courierName,
      shipmentType: apiShipmentType,
      shipping: this.mapToOrderShippingEntity(orderShipping),
      apiResponse,
    };
  }

  /**
   * Book many orders sequentially. Skips already-booked; continues on errors.
   */
  async bulkBookOrders(
    orderIds: string[],
    options: BookLeopardsOptions = {},
  ): Promise<BulkBookLeopardsResult> {
    const uniqueIds = [
      ...new Set(orderIds.map((id) => id.trim()).filter(Boolean)),
    ];
    if (uniqueIds.length === 0) {
      throw new BadRequestException('At least one order ID is required.');
    }

    const results: BulkBookLeopardsResultItem[] = [];

    for (const orderId of uniqueIds) {
      try {
        const existing = await this.prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            shipping: { select: { trackingNumber: true } },
          },
        });

        if (!existing) {
          results.push({
            orderId,
            status: 'failed',
            error: 'Order not found',
          });
          continue;
        }

        const existingCn = existing.shipping?.trackingNumber?.trim();
        if (existingCn) {
          results.push({
            orderId,
            orderNumber: existing.orderNumber,
            status: 'skipped',
            cnNumber: existingCn,
            error: 'Already booked with Leopards',
          });
          continue;
        }

        const booked = await this.bookOrder(orderId, options);
        results.push({
          orderId,
          orderNumber: existing.orderNumber,
          status: 'booked',
          cnNumber: booked.trackingNumber,
          trackingUrl: booked.trackingUrl,
        });
      } catch (error) {
        let message = 'Booking failed';
        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException ||
          error instanceof ServiceUnavailableException
        ) {
          const res = error.getResponse();
          if (typeof res === 'string') {
            message = res;
          } else if (res && typeof res === 'object' && 'message' in res) {
            const m = (res as { message: unknown }).message;
            if (typeof m === 'string') message = m;
            else if (Array.isArray(m)) message = m.join(', ');
          } else if (error.message) {
            message = error.message;
          }
        } else if (error instanceof Error) {
          message = error.message;
        }

        let orderNumber: string | undefined;
        try {
          const row = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { orderNumber: true },
          });
          orderNumber = row?.orderNumber;
        } catch {
          // ignore lookup failure
        }

        results.push({
          orderId,
          orderNumber,
          status: 'failed',
          error: message,
        });
      }
    }

    return {
      successCount: results.filter((r) => r.status === 'booked').length,
      failedCount: results.filter((r) => r.status === 'failed').length,
      skippedCount: results.filter((r) => r.status === 'skipped').length,
      results,
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return { ...(value as Record<string, unknown>) };
    }
    return {};
  }

  private isCodOrder(order: {
    paymentStatus: string | null;
    metadata: unknown;
  }): boolean {
    const meta = this.asRecord(order.metadata);
    if (meta.paymentMethod === 'cod') return true;
    if (meta.paymentMethod === 'bank_transfer') return false;
    // Unpaid / pending COD-style collection when not prepaid.
    return order.paymentStatus !== 'paid';
  }

  private calculateOrderWeightKg(
    items: Array<{ quantity: number; metadata: unknown }>,
  ): number {
    let total = 0;
    for (const item of items) {
      const qty = Math.max(0, item.quantity || 0);
      const customKg = customOrderItemUnitWeightKg(item.metadata);
      const meta = this.asRecord(item.metadata);
      const fromMeta =
        typeof meta.weightKg === 'number'
          ? meta.weightKg
          : typeof meta.weightKg === 'string'
            ? Number(meta.weightKg)
            : NaN;
      let unit = DEFAULT_SHIPPING_WEIGHT_KG;
      if (customKg != null && Number.isFinite(customKg)) {
        unit = customKg;
      } else if (Number.isFinite(fromMeta) && fromMeta >= 0) {
        unit = fromMeta;
      } else if (isCustomOrderItemMetadata(item.metadata) && customKg != null) {
        unit = customKg;
      }
      total += unit * qty;
    }
    return total > 0 ? total : DEFAULT_SHIPPING_WEIGHT_KG;
  }

  private parseAddress(value: unknown): AddressSnapshot {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as AddressSnapshot;
  }

  private async resolveLeopardsShippingMethodId(): Promise<string> {
    const existing = await this.prisma.shippingMethod.findFirst({
      where: {
        OR: [
          { code: 'leopards' },
          { code: { equals: 'leopard', mode: 'insensitive' } },
        ],
      },
      orderBy: { isActive: 'desc' },
    });
    if (existing) return existing.id;

    const zone = await this.prisma.shippingZone.findFirst({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });
    if (!zone) {
      throw new BadRequestException(
        'No active shipping zone found. Create a shipping zone before booking with Leopards.',
      );
    }

    const created = await this.prisma.shippingMethod.create({
      data: {
        zoneId: zone.id,
        code: 'leopards',
        name: 'Leopards Courier',
        type: 'courier_api',
        config: {},
        courierConfig: { provider: 'leopards' },
        isActive: true,
        priority: 0,
        metadata: { system: true, provider: 'leopards' },
      },
    });
    this.logger.log(
      `Auto-created Leopards shipping method ${created.id} under zone ${zone.id}`,
    );
    return created.id;
  }

  private mapToOrderShippingEntity(shipping: {
    id: string;
    orderId: string;
    shippingMethodId: string;
    cost: Prisma.Decimal | number | string;
    currency: string;
    status: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    courierCode: string | null;
    courierName: string | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    shippingAddress: unknown;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): OrderShipping {
    return {
      id: shipping.id,
      orderId: shipping.orderId,
      shippingMethodId: shipping.shippingMethodId,
      cost: parseFloat(shipping.cost.toString()),
      currency: shipping.currency,
      status: shipping.status as OrderShipping['status'],
      trackingNumber: shipping.trackingNumber,
      trackingUrl: shipping.trackingUrl,
      courierCode: shipping.courierCode,
      courierName: shipping.courierName,
      shippedAt: shipping.shippedAt,
      deliveredAt: shipping.deliveredAt,
      cancelledAt: shipping.cancelledAt,
      shippingAddress: shipping.shippingAddress as Record<string, any>,
      metadata: (shipping.metadata || {}) as Record<string, any>,
      createdAt: shipping.createdAt,
      updatedAt: shipping.updatedAt,
    };
  }
}
