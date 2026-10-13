import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../catalog/services/prisma.service';
import {
  cleanLeopardsEnvValue,
  DEFAULT_LEOPARDS_SHIPPER_NAME,
} from '../../common/utils/leopards-env.util';
import { LeopardsShippingService } from './leopards-shipping.service';
import {
  GenerateLeopardsLoadsheetDto,
  ListLeopardsBookedOrdersQueryDto,
  LoadsheetOrderStatusFilter,
} from '../dto/leopards-loadsheet.dto';

const DEFAULT_COMPANY_NAME = DEFAULT_LEOPARDS_SHIPPER_NAME;
const DEFAULT_ACCOUNT_NUMBER = '000000';
const DEFAULT_PACKET_WEIGHT_GRAMS = 1;
const DEFAULT_PIECES = 1;

type AddressSnapshot = {
  firstName?: string;
  lastName?: string;
  city?: string;
  phone?: string;
};

type OrderWithShipping = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  shippingAddress: unknown;
  currency: string;
  grandTotal: Prisma.Decimal | number | string;
  courierLoadSheetId: string | null;
  metadata: unknown;
  updatedAt: Date;
  shipping: {
    id: string;
    status: string;
    metadata: unknown;
    trackingNumber: string | null;
  } | null;
};

export type LoadsheetBookedOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  destinationCity: string;
  cnNumber: string;
  serviceType: string;
  shipperName: string;
  pieces: number;
  weightGrams: number;
  codAmount: number;
  currency: string;
  loadSheetId: string | null;
  bookedAt: string | null;
  updatedAt: string;
};

export type GenerateLoadsheetResponse = {
  id: string;
  loadSheetId: string;
  pdfUrl: string | null;
  html: string | null;
  printUrl: string | null;
  officialUrl: string | null;
  hasStoredPdf: boolean;
  companyName: string;
  accountNumber: string;
  cnNumbers: string[];
  orderIds: string[];
  packets: LoadsheetBookedOrderRow[];
  totals: {
    packetCount: number;
    totalPieces: number;
    totalCod: number;
    currency: string;
  };
  generatedAt: string;
};

export type LoadsheetHistoryRow = {
  id: string;
  loadSheetId: string;
  packetCount: number;
  totalCod: number;
  currency: string;
  trackingNumbers: string[];
  hasStoredPdf: boolean;
  officialUrl: string | null;
  createdAt: string;
};

@Injectable()
export class LeopardsLoadsheetService {
  private readonly logger = new Logger(LeopardsLoadsheetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leopardsShipping: LeopardsShippingService,
  ) {}

  /**
   * List Leopards-booked orders for the loadsheet UI.
   */
  async listBookedOrders(
    query: ListLeopardsBookedOrdersQueryDto = {},
  ): Promise<{ data: LoadsheetBookedOrderRow[]; meta: { total: number } }> {
    const status: LoadsheetOrderStatusFilter =
      query.status ?? 'pending_loadsheet';
    const { gte, lt } = this.resolveDateRange(query.dateFrom, query.dateTo);

    const where: Prisma.OrderWhereInput = {
      AND: [
        {
          shipping: {
            AND: [
              { trackingNumber: { not: null } },
              { NOT: { trackingNumber: '' } },
            ],
          },
        },
        ...(status === 'pending_loadsheet'
          ? [
              {
                OR: [
                  { courierLoadSheetId: null },
                  { courierLoadSheetId: '' },
                ],
              } satisfies Prisma.OrderWhereInput,
            ]
          : []),
        ...(status === 'on_loadsheet'
          ? [
              { courierLoadSheetId: { not: null } },
              { NOT: { courierLoadSheetId: '' } },
            ]
          : []),
        ...(gte || lt
          ? [
              {
                updatedAt: {
                  ...(gte ? { gte } : {}),
                  ...(lt ? { lt } : {}),
                },
              } satisfies Prisma.OrderWhereInput,
            ]
          : []),
      ],
    };

    const orders = (await this.prisma.order.findMany({
      where,
      include: { shipping: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })) as OrderWithShipping[];

    const codByOrderId = await this.resolveCodAmountsBatch(orders);
    const data = orders.map((order) =>
      this.toBookedOrderRow(order, codByOrderId.get(order.id) ?? 0),
    );

    return { data, meta: { total: data.length } };
  }

  /**
   * Call Leopards generateLoadsheet, persist history row + load sheet id on orders.
   */
  async generateLoadsheet(
    dto: GenerateLeopardsLoadsheetDto,
  ): Promise<GenerateLoadsheetResponse> {
    const cnFromBody = (dto.cnNumbers ?? [])
      .map((cn) => cn.trim())
      .filter(Boolean);
    const orderIds = (dto.orderIds ?? [])
      .map((id) => id.trim())
      .filter(Boolean);

    if (cnFromBody.length === 0 && orderIds.length === 0) {
      throw new BadRequestException(
        'Select at least one order or provide cnNumbers to generate a loadsheet.',
      );
    }

    const orders = (await this.prisma.order.findMany({
      where: {
        OR: [
          ...(orderIds.length ? [{ id: { in: orderIds } }] : []),
          ...(cnFromBody.length
            ? [{ shipping: { trackingNumber: { in: cnFromBody } } }]
            : []),
        ],
      },
      include: { shipping: true },
    })) as OrderWithShipping[];

    if (orders.length === 0) {
      throw new NotFoundException(
        'No booked Leopards orders found for the given orderIds / cnNumbers.',
      );
    }

    const missingCn = orders.filter(
      (o) => !o.shipping?.trackingNumber?.trim(),
    );
    if (missingCn.length > 0) {
      throw new BadRequestException(
        `Orders missing Leopards CN: ${missingCn.map((o) => o.orderNumber).join(', ')}`,
      );
    }

    const cnNumbers = [
      ...new Set(
        orders
          .map((o) => o.shipping!.trackingNumber!.trim())
          .filter(Boolean),
      ),
    ];

    this.logger.log(
      `Generating Leopards loadsheet for ${cnNumbers.length} CN(s) across ${orders.length} order(s)`,
    );

    const result = await this.leopardsShipping.generateLoadsheet(cnNumbers, {
      name: dto.courierName?.trim() || undefined,
      code: dto.courierCode?.trim() || undefined,
    });

    const generatedAt = new Date().toISOString();
    const loadSheetId = result.loadSheetId;
    const officialUrl = result.printUrl || result.pdfUrl || null;
    const companyName =
      cleanLeopardsEnvValue(process.env.LEOPARDS_COMPANY_NAME) ||
      DEFAULT_COMPANY_NAME;
    const accountNumber =
      cleanLeopardsEnvValue(process.env.LEOPARDS_ACCOUNT_NUMBER) ||
      DEFAULT_ACCOUNT_NUMBER;

    const codByOrderId = await this.resolveCodAmountsBatch(orders);
    const packets = orders.map((order) =>
      this.toBookedOrderRow(
        order,
        codByOrderId.get(order.id) ?? 0,
        loadSheetId,
      ),
    );
    const currency = packets[0]?.currency ?? 'PKR';
    const totalCod = packets.reduce((sum, p) => sum + p.codAmount, 0);
    const totalPieces = packets.reduce((sum, p) => sum + p.pieces, 0);
    const orderIdList = orders.map((o) => o.id);

    const pdfData = await this.tryDownloadPdfBuffer(officialUrl);
    const pdfBytes = pdfData ? Uint8Array.from(pdfData) : undefined;

    const persisted = await this.prisma.$transaction(async (tx) => {
      const loadsheetRow = await tx.leopardLoadsheet.create({
        data: {
          referenceNumber: loadSheetId,
          trackingNumbers: cnNumbers,
          orderIds: orderIdList,
          pdfData: pdfBytes,
          hasStoredPdf: Boolean(pdfBytes),
          pdfUrl: result.pdfUrl ?? null,
          printUrl: result.printUrl ?? null,
          html: result.html ?? null,
          packetSnapshot: {
            packets,
            totals: {
              packetCount: packets.length,
              totalPieces,
              totalCod,
              currency,
            },
            generatedAt,
          } as Prisma.InputJsonValue,
          companyName,
          accountNumber,
          packetCount: packets.length,
          metadata: {
            provider: 'leopards',
            hasStoredPdf: Boolean(pdfBytes),
          } as Prisma.InputJsonValue,
        },
      });

      for (const order of orders) {
        const existingOrderMeta = this.asRecord(order.metadata);
        const existingLeopards = this.asRecord(existingOrderMeta.leopards);

        await tx.order.update({
          where: { id: order.id },
          data: {
            courierLoadSheetId: loadSheetId,
            metadata: {
              ...existingOrderMeta,
              leopards: {
                ...existingLeopards,
                loadSheetId,
                load_sheet_id: loadSheetId,
                loadSheetRecordId: loadsheetRow.id,
                loadSheetPdfUrl: result.pdfUrl ?? null,
                loadSheetPrintUrl: result.printUrl ?? null,
                loadSheetGeneratedAt: generatedAt,
                shippingStatus: 'LOADSHEET',
                provider: 'leopards',
              },
            } as Prisma.InputJsonValue,
          },
        });

        if (order.shipping) {
          const existingShipMeta = this.asRecord(order.shipping.metadata);
          const existingShipLeopards = this.asRecord(existingShipMeta.leopards);
          await tx.orderShipping.update({
            where: { id: order.shipping.id },
            data: {
              status:
                order.shipping.status === 'delivered' ||
                order.shipping.status === 'cancelled'
                  ? order.shipping.status
                  : 'shipped',
              metadata: {
                ...existingShipMeta,
                provider: 'leopards',
                loadSheetId,
                leopards: {
                  ...existingShipLeopards,
                  loadSheetId,
                  load_sheet_id: loadSheetId,
                  loadSheetRecordId: loadsheetRow.id,
                  loadSheetGeneratedAt: generatedAt,
                  shippingStatus: 'LOADSHEET',
                  provider: 'leopards',
                },
              } as Prisma.InputJsonValue,
            },
          });
        }
      }

      return loadsheetRow;
    });

    this.logger.log(
      `Leopards loadsheet ${loadSheetId} persisted id=${persisted.id} on ${orders.length} order(s) hasPdf=${Boolean(pdfBytes)}`,
    );

    return {
      id: persisted.id,
      loadSheetId,
      pdfUrl: result.pdfUrl ?? null,
      html: result.html ?? null,
      printUrl: result.printUrl ?? null,
      officialUrl,
      hasStoredPdf: Boolean(pdfBytes),
      companyName,
      accountNumber,
      cnNumbers,
      orderIds: orderIdList,
      packets,
      totals: {
        packetCount: packets.length,
        totalPieces,
        totalCod,
        currency,
      },
      generatedAt,
    };
  }

  async listLoadsheets(limit = 100): Promise<{
    data: LoadsheetHistoryRow[];
    meta: { total: number };
  }> {
    const take = Math.min(Math.max(limit, 1), 500);
    const [rows, total] = await Promise.all([
      this.prisma.leopardLoadsheet.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        select: {
          id: true,
          referenceNumber: true,
          trackingNumbers: true,
          packetCount: true,
          hasStoredPdf: true,
          pdfUrl: true,
          printUrl: true,
          packetSnapshot: true,
          createdAt: true,
        },
      }),
      this.prisma.leopardLoadsheet.count(),
    ]);

    const data: LoadsheetHistoryRow[] = rows.map((row) => {
      const trackingNumbers = this.jsonStringArray(row.trackingNumbers);
      const officialUrl = row.printUrl || row.pdfUrl || null;
      const snapshot = this.asRecord(row.packetSnapshot);
      const totals = this.asRecord(snapshot.totals);
      const totalCod =
        typeof totals.totalCod === 'number' ? totals.totalCod : 0;
      const currency =
        (typeof totals.currency === 'string' && totals.currency) || 'PKR';
      return {
        id: row.id,
        loadSheetId: row.referenceNumber,
        packetCount: row.packetCount,
        totalCod,
        currency,
        trackingNumbers,
        hasStoredPdf: row.hasStoredPdf,
        officialUrl,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return { data, meta: { total } };
  }

  async getLoadsheetManifest(id: string): Promise<GenerateLoadsheetResponse> {
    const row = await this.prisma.leopardLoadsheet.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Loadsheet ${id} not found`);
    }

    const snapshot = this.asRecord(row.packetSnapshot);
    const packets = Array.isArray(snapshot.packets)
      ? (snapshot.packets as LoadsheetBookedOrderRow[])
      : [];
    const totalsRecord = this.asRecord(snapshot.totals);
    const trackingNumbers = this.jsonStringArray(row.trackingNumbers);
    const orderIds = this.jsonStringArray(row.orderIds);
    const officialUrl = row.printUrl || row.pdfUrl || null;
    const generatedAt =
      (typeof snapshot.generatedAt === 'string' && snapshot.generatedAt) ||
      row.createdAt.toISOString();

    const packetCount =
      typeof totalsRecord.packetCount === 'number'
        ? totalsRecord.packetCount
        : row.packetCount;
    const totalPieces =
      typeof totalsRecord.totalPieces === 'number'
        ? totalsRecord.totalPieces
        : packets.reduce((sum, p) => sum + (Number(p.pieces) || 0), 0);
    const totalCod =
      typeof totalsRecord.totalCod === 'number'
        ? totalsRecord.totalCod
        : packets.reduce((sum, p) => sum + (Number(p.codAmount) || 0), 0);
    const currency =
      (typeof totalsRecord.currency === 'string' && totalsRecord.currency) ||
      packets[0]?.currency ||
      'PKR';

    return {
      id: row.id,
      loadSheetId: row.referenceNumber,
      pdfUrl: row.pdfUrl ?? null,
      html: row.html ?? null,
      printUrl: row.printUrl ?? null,
      officialUrl,
      hasStoredPdf: row.hasStoredPdf,
      companyName: row.companyName || DEFAULT_COMPANY_NAME,
      accountNumber: row.accountNumber || DEFAULT_ACCOUNT_NUMBER,
      cnNumbers: trackingNumbers,
      orderIds,
      packets,
      totals: {
        packetCount,
        totalPieces,
        totalCod,
        currency,
      },
      generatedAt,
    };
  }

  async reprintLoadsheetPdf(id: string): Promise<Buffer> {
    const row = await this.prisma.leopardLoadsheet.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Loadsheet ${id} not found`);
    }

    if (row.pdfData && row.pdfData.length > 4) {
      const buf = Buffer.from(row.pdfData);
      if (buf.subarray(0, 4).toString('utf8') === '%PDF') {
        return buf;
      }
    }

    const url = row.printUrl || row.pdfUrl;
    if (url) {
      const downloaded = await this.tryDownloadPdfBuffer(url);
      if (downloaded) {
        const pdfBytes = Uint8Array.from(downloaded);
        await this.prisma.leopardLoadsheet
          .update({
            where: { id: row.id },
            data: { pdfData: pdfBytes, hasStoredPdf: true },
          })
          .catch((err: unknown) => {
            this.logger.warn(
              `Failed to cache loadsheet PDF for ${id}: ${err instanceof Error ? err.message : String(err)}`,
            );
          });
        return downloaded;
      }
    }

    throw new NotFoundException(
      `No PDF available for loadsheet ${row.referenceNumber}. Use the print report reprint instead.`,
    );
  }

  private async tryDownloadPdfBuffer(
    url: string | null,
  ): Promise<Buffer | null> {
    if (!url?.trim().startsWith('http')) return null;
    try {
      return await this.leopardsShipping.fetchPdfFromUrl(url.trim());
    } catch (err: unknown) {
      this.logger.warn(
        `Could not download loadsheet PDF from URL: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private jsonStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'number' || typeof item === 'boolean') {
          return String(item);
        }
        return '';
      })
      .filter(Boolean);
  }

  private toBookedOrderRow(
    order: OrderWithShipping,
    codAmount: number,
    overrideLoadSheetId?: string | null,
  ): LoadsheetBookedOrderRow {
    const shippingAddress = this.parseAddress(order.shippingAddress);
    const meta = this.asRecord(order.metadata);
    const leopards = this.asRecord(meta.leopards);
    const shipMeta = this.asRecord(order.shipping?.metadata);
    const shipLeopards = this.asRecord(shipMeta.leopards);

    const customerName =
      order.customerName?.trim() ||
      [shippingAddress.firstName, shippingAddress.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      '—';

    const destinationCity =
      (typeof shipLeopards.destination_city_name === 'string' &&
        shipLeopards.destination_city_name) ||
      (typeof leopards.destinationCityName === 'string' &&
        leopards.destinationCityName) ||
      shippingAddress.city?.trim() ||
      (typeof shipLeopards.destination_city_id === 'string'
        ? String(shipLeopards.destination_city_id)
        : '') ||
      '—';

    const serviceType =
      [
        shipLeopards.shipment_type,
        meta.leopardsShipmentType,
        leopards.shipmentType,
        shipMeta.shipmentType,
      ]
        .find((v): v is string => typeof v === 'string' && v.trim().length > 0)
        ?.trim()
        .toUpperCase() || 'OVERNIGHT';

    const bookedAt =
      (typeof shipLeopards.booked_at === 'string' && shipLeopards.booked_at) ||
      (typeof leopards.bookedAt === 'string' && leopards.bookedAt) ||
      null;

    const shipperName =
      [
        leopards.shipperName,
        meta.shipperName,
        cleanLeopardsEnvValue(process.env.LEOPARDS_COMPANY_NAME),
        DEFAULT_COMPANY_NAME,
      ]
        .find((v): v is string => typeof v === 'string' && v.trim().length > 0)
        ?.trim() || DEFAULT_COMPANY_NAME;

    const piecesRaw = Number(
      leopards.pieces ?? shipMeta.pieces ?? meta.pieces ?? DEFAULT_PIECES,
    );
    const pieces =
      Number.isFinite(piecesRaw) && piecesRaw > 0
        ? Math.round(piecesRaw)
        : DEFAULT_PIECES;

    const weightRaw = Number(
      leopards.weightGrams ??
        shipMeta.weightGrams ??
        meta.weightGrams ??
        DEFAULT_PACKET_WEIGHT_GRAMS,
    );
    const weightGrams =
      Number.isFinite(weightRaw) && weightRaw > 0
        ? weightRaw
        : DEFAULT_PACKET_WEIGHT_GRAMS;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName,
      destinationCity,
      cnNumber: order.shipping?.trackingNumber?.trim() || '',
      serviceType,
      shipperName,
      pieces,
      weightGrams,
      codAmount,
      currency: order.currency || 'PKR',
      loadSheetId:
        overrideLoadSheetId !== undefined
          ? overrideLoadSheetId
          : order.courierLoadSheetId,
      bookedAt,
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private async resolveCodAmountsBatch(
    orders: Array<{
      id: string;
      grandTotal: Prisma.Decimal | number | string;
    }>,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (orders.length === 0) return result;

    const orderIds = orders.map((o) => o.id);
    const payments = await this.prisma.payment.findMany({
      where: { orderId: { in: orderIds } },
      include: { paymentMethod: true },
      orderBy: { createdAt: 'desc' },
    });

    const latestByOrder = new Map<string, (typeof payments)[number]>();
    for (const payment of payments) {
      if (!latestByOrder.has(payment.orderId)) {
        latestByOrder.set(payment.orderId, payment);
      }
    }

    for (const order of orders) {
      const payment = latestByOrder.get(order.id);
      const methodName = payment?.paymentMethod.name?.trim() || '';
      const methodCode = payment?.paymentMethod.code ?? '';
      const isCod =
        /cod|cash[\s_-]*on[\s_-]*delivery/i.test(
          `${methodCode} ${methodName}`,
        ) || !payment;

      if (!isCod) {
        result.set(order.id, 0);
        continue;
      }

      const amount = Number(order.grandTotal);
      result.set(order.id, Number.isFinite(amount) && amount > 0 ? amount : 0);
    }

    return result;
  }

  private resolveDateRange(
    dateFrom?: string,
    dateTo?: string,
  ): { gte?: Date; lt?: Date } {
    const gte = dateFrom ? this.startOfUtcDay(dateFrom) : undefined;
    const lt = dateTo ? this.endOfUtcDayExclusive(dateTo) : undefined;
    return { gte, lt };
  }

  private startOfUtcDay(isoDate: string): Date {
    const d = new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`Invalid dateFrom: ${isoDate}`);
    }
    return d;
  }

  private endOfUtcDayExclusive(isoDate: string): Date {
    const d = this.startOfUtcDay(isoDate);
    d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }

  private parseAddress(value: unknown): AddressSnapshot {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as AddressSnapshot;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }
}
