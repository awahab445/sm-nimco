import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import {
  LeopardsShippingService,
  mapLeopardsShipmentType,
  normalizeLeopardsCityName,
  resolveStaticLeopardsCityId,
} from './leopards-shipping.service';
import { PrismaService } from '../../catalog/services/prisma.service';

describe('LeopardsShippingService', () => {
  const previousEnv: Record<string, string | undefined> = {};

  const setEnv = (key: string, value: string | undefined) => {
    if (!(key in previousEnv)) {
      previousEnv[key] = process.env[key];
    }
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  };

  const restoreEnv = () => {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  let service: LeopardsShippingService;
  let httpService: { post: jest.Mock };
  let prisma: {
    order: { findUnique: jest.Mock; update: jest.Mock };
    orderShipping: { create: jest.Mock; update: jest.Mock };
    shippingMethod: { findFirst: jest.Mock; create: jest.Mock };
    shippingZone: { findFirst: jest.Mock };
  };

  beforeEach(() => {
    setEnv('LEOPARDS_API_KEY', 'test-api-key');
    setEnv('LEOPARDS_API_PASSWORD', 'test-api-password');
    setEnv('LEOPARDS_ORIGIN_CITY_ID', '592');
    setEnv('LEOPARDS_API_URL', undefined);
    setEnv('LEOPARDS_BASE_URL', undefined);
    setEnv(
      'LEOPARDS_API_BASE_URL',
      'https://merchantapi.leopardscourier.com/api',
    );
    setEnv('LEOPARDS_SHIPPER_ID', '2792661');
    setEnv('LEOPARDS_SHIPPER_NAME', 'SM Nimco & Sweets');
    setEnv('LEOPARDS_SHIPPER_EMAIL', 'info@smnimco.com');
    setEnv('LEOPARDS_SHIPPER_PHONE', '03442394143');
    setEnv(
      'LEOPARDS_SHIPPER_ADDRESS',
      'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI',
    );

    httpService = {
      post: jest.fn(),
    };
    prisma = {
      order: { findUnique: jest.fn(), update: jest.fn() },
      orderShipping: { create: jest.fn(), update: jest.fn() },
      shippingMethod: { findFirst: jest.fn(), create: jest.fn() },
      shippingZone: { findFirst: jest.fn() },
    };

    service = new LeopardsShippingService(
      httpService as unknown as HttpService,
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    restoreEnv();
    jest.clearAllMocks();
  });

  describe('getConfig / assertConfigured', () => {
    it('loads credentials dynamically from process.env', () => {
      const config = service.getConfig();
      expect(config.apiKey).toBe('test-api-key');
      expect(config.apiPassword).toBe('test-api-password');
      expect(config.originCityId).toBe('592');
      expect(config.baseUrl).toBe(
        'https://merchantapi.leopardscourier.com/api',
      );
    });

    it('throws when credentials are missing', () => {
      setEnv('LEOPARDS_API_KEY', undefined);
      setEnv('LEOPARDS_API_PASSWORD', undefined);
      expect(() => service.assertConfigured()).toThrow(
        ServiceUnavailableException,
      );
    });

    it('prefers LEOPARDS_API_URL over LEOPARDS_API_BASE_URL', () => {
      setEnv(
        'LEOPARDS_API_URL',
        'https://merchantapistaging.leopardscourier.com/api/',
      );
      setEnv(
        'LEOPARDS_API_BASE_URL',
        'https://merchantapi.leopardscourier.com/api',
      );

      const config = service.getConfig();
      expect(config.baseUrl).toBe(
        'https://merchantapistaging.leopardscourier.com/api',
      );
    });
  });

  describe('mapLeopardsShipmentType', () => {
    it('maps admin codes and defaults to overnight', () => {
      expect(mapLeopardsShipmentType('OVERNIGHT')).toBe('overnight');
      expect(mapLeopardsShipmentType('OVERLAND')).toBe('overland');
      expect(mapLeopardsShipmentType('DETAIN')).toBe('detain');
      expect(mapLeopardsShipmentType('Economy')).toBe('overnight');
      expect(mapLeopardsShipmentType(undefined)).toBe('overnight');
    });
  });

  describe('normalizeLeopardsCityName / static city IDs', () => {
    it('extracts city before province/postal and normalizes case', () => {
      expect(normalizeLeopardsCityName('Karachi')).toBe('karachi');
      expect(normalizeLeopardsCityName('  KARACHI  ')).toBe('karachi');
      expect(normalizeLeopardsCityName('karachi')).toBe('karachi');
      expect(normalizeLeopardsCityName('karachi ')).toBe('karachi');
      expect(normalizeLeopardsCityName('Karachi, sindh')).toBe('karachi');
      expect(normalizeLeopardsCityName('Karachi, Sindh')).toBe('karachi');
      expect(normalizeLeopardsCityName('Karachi, sindh, 75740')).toBe(
        'karachi',
      );
      expect(normalizeLeopardsCityName('Karachi, Sindh, 75740')).toBe(
        'karachi',
      );
      expect(normalizeLeopardsCityName('Lahore - Punjab')).toBe('lahore');
      expect(normalizeLeopardsCityName('Karachi City')).toBe('karachi');
      expect(normalizeLeopardsCityName('75740, Karachi, sindh')).toBe(
        'karachi',
      );
    });

    it('resolves major cities via static dictionary', () => {
      expect(resolveStaticLeopardsCityId('Karachi')).toBe(592);
      expect(resolveStaticLeopardsCityId('karachi')).toBe(592);
      expect(resolveStaticLeopardsCityId('KARACHI')).toBe(592);
      expect(resolveStaticLeopardsCityId('Karachi, sindh')).toBe(592);
      expect(resolveStaticLeopardsCityId('Karachi, sindh, 75740')).toBe(592);
      expect(resolveStaticLeopardsCityId('karachi ')).toBe(592);
      expect(resolveStaticLeopardsCityId('Lahore')).toBe(836);
      expect(resolveStaticLeopardsCityId('Islamabad')).toBe(516);
      expect(resolveStaticLeopardsCityId('Rawalpindi')).toBe(1104);
      expect(resolveStaticLeopardsCityId('Faisalabad')).toBe(392);
      expect(resolveStaticLeopardsCityId('Multan')).toBe(888);
      expect(resolveStaticLeopardsCityId('Peshawar')).toBe(1032);
      expect(resolveStaticLeopardsCityId('Quetta')).toBe(1072);
      expect(resolveStaticLeopardsCityId('Hyderabad')).toBe(500);
      expect(resolveStaticLeopardsCityId('Unknownville')).toBeNull();
    });
  });

  describe('resolveDestinationCityId', () => {
    it.each([
      ['Karachi', 592],
      ['karachi', 592],
      ['KARACHI', 592],
      ['karachi ', 592],
      ['Karachi, sindh', 592],
      ['Karachi, Sindh', 592],
      ['Karachi, sindh, 75740', 592],
      ['  Karachi City  ', 592],
    ])('maps "%s" → %s (static fallback when API empty)', async (input, id) => {
      httpService.post.mockReturnValue(
        of({ data: { status: 1, city_list: [] } }),
      );

      await expect(service.resolveDestinationCityId(input)).resolves.toBe(id);
    });

    it('prefers API list match when present', async () => {
      httpService.post.mockReturnValue(
        of({
          data: {
            status: 1,
            city_list: [{ id: 999, name: 'Karachi' }],
          },
        }),
      );

      await expect(service.resolveDestinationCityId('karachi')).resolves.toBe(
        999,
      );
    });

    it('falls back to static IDs when getAllCities HTTP fails', async () => {
      httpService.post.mockImplementation(() => {
        throw new Error('network down');
      });

      await expect(
        service.resolveDestinationCityId('Karachi, sindh'),
      ).resolves.toBe(592);
    });

    it('accepts numeric city ids as-is', async () => {
      await expect(service.resolveDestinationCityId('592')).resolves.toBe(592);
      expect(httpService.post).not.toHaveBeenCalled();
    });
  });

  describe('buildBookPacketPayload', () => {
    it('builds Merchant API payload with grams, origin city, shipment_type, and consignee fields', () => {
      const payload = service.buildBookPacketPayload({
        weightKg: 2.5,
        pieces: 3,
        collectAmount: 4500.6,
        orderReferenceId: 'ORD-1001',
        destinationCityId: 789,
        consigneeName: 'Ali Khan',
        consigneePhone: '03001234567',
        consigneeEmail: 'ali@example.com',
        consigneeAddress: 'House 1, Street 2, Lahore',
        specialInstructions: 'Handle with care',
        serviceType: 'OVERLAND',
      });

      expect(payload).toMatchObject({
        api_key: 'test-api-key',
        api_password: 'test-api-password',
        booked_packet_weight: '2500',
        booked_packet_no_piece: '3',
        booked_packet_collect_amount: '4501',
        booked_packet_order_id: 'ORD-1001',
        origin_city: '592',
        destination_city: '789',
        shipment_name_eng: 'SM Nimco & Sweets',
        shipment_email: 'info@smnimco.com',
        shipment_phone: '03442394143',
        shipment_address:
          'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI',
        shipper_name: 'SM Nimco & Sweets',
        shipper_email: 'info@smnimco.com',
        shipper_phone: '03442394143',
        shipper_address:
          'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI',
        return_address:
          'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI',
        shipper_id: '2792661',
        shipment_id: '2792661',
        consignment_name_eng: 'Ali Khan',
        consignment_email: 'ali@example.com',
        consignment_phone: '03001234567',
        consignment_address: 'House 1, Street 2, Lahore',
        special_instructions: 'Handle with care',
        shipment_type: 'overland',
      });
      expect(payload.booked_packet_vol_weight_w).toBe('10');
      expect(payload.booked_packet_vol_weight_h).toBe('10');
      expect(payload.booked_packet_vol_weight_l).toBe('10');
      // Never send placeholder merchant phones on the shipper side.
      expect(payload.shipper_phone).not.toBe('03001234567');
      expect(payload.shipment_phone).not.toBe('self');
    });

    it('falls back to SM Nimco shipper defaults when env shipper fields are empty', () => {
      setEnv('LEOPARDS_SHIPPER_NAME', undefined);
      setEnv('LEOPARDS_SHIPPER_EMAIL', undefined);
      setEnv('LEOPARDS_SHIPPER_PHONE', undefined);
      setEnv('LEOPARDS_SHIPPER_ADDRESS', undefined);
      setEnv('LEOPARDS_SHIPPER_ID', undefined);

      const payload = service.buildBookPacketPayload({
        weightKg: 1,
        pieces: 1,
        collectAmount: 100,
        orderReferenceId: 'ORD-DEF',
        destinationCityId: 789,
        consigneeName: 'Test',
        consigneePhone: '03001111111',
        consigneeAddress: 'Addr',
      });

      expect(payload.shipper_name).toBe('SM Nimco & Sweets');
      expect(payload.shipper_phone).toBe('03442394143');
      expect(payload.shipper_email).toBe('info@smnimco.com');
      expect(payload.shipper_address).toBe(
        'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI',
      );
      expect(payload.return_address).toBe(payload.shipper_address);
      expect(payload.shipper_id).toBe('2792661');
      expect(payload.shipment_phone).toBe('03442394143');
    });

    it('converts fractional kg below 1g floor to at least 1 gram', () => {
      const payload = service.buildBookPacketPayload({
        weightKg: 0,
        pieces: 1,
        collectAmount: 0,
        orderReferenceId: 'ORD-1',
        destinationCityId: 1,
        consigneeName: 'Test',
        consigneePhone: '03000000000',
        consigneeAddress: 'Addr',
      });
      expect(payload.booked_packet_weight).toBe('1');
    });
  });

  describe('parseBookPacketResponse', () => {
    it('extracts track_number and slip_link on success', () => {
      const parsed = service.parseBookPacketResponse({
        status: 1,
        track_number: 'LE123456789',
        slip_link: 'https://example.com/slip.pdf',
      });
      expect(parsed).toEqual({
        trackNumber: 'LE123456789',
        slipLink: 'https://example.com/slip.pdf',
      });
    });

    it('throws when status is not success or track_number missing', () => {
      expect(() =>
        service.parseBookPacketResponse({
          status: 0,
          error: 'Invalid destination city',
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        service.parseBookPacketResponse({
          status: 1,
        }),
      ).toThrow(BadRequestException);
    });

    it('surfaces Invalid API Key from Leopards error field', () => {
      expect(() =>
        service.parseBookPacketResponse({
          status: 0,
          error: 'Invalid API Key',
        }),
      ).toThrow('Invalid API Key');
    });
  });

  describe('buildTrackingUrl', () => {
    it('appends cn query param to tracking base', () => {
      expect(service.buildTrackingUrl('LE999')).toBe(
        'https://www.leopardscourier.com/tracking?cn=LE999',
      );
    });
  });

  describe('bookPacket / trackBookedPacket', () => {
    it('POSTs bookPacket payload to Merchant API and returns body', async () => {
      const apiBody = { status: 1, track_number: 'LE111' };
      httpService.post.mockReturnValue(of({ data: apiBody }));

      const payload = service.buildBookPacketPayload({
        weightKg: 1,
        pieces: 1,
        collectAmount: 100,
        orderReferenceId: 'ORD-2',
        destinationCityId: 592,
        consigneeName: 'A',
        consigneePhone: '03001111111',
        consigneeAddress: 'Karachi',
      });

      const result = await service.bookPacket(payload);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://merchantapi.leopardscourier.com/api/bookPacket/format/json/',
        payload,
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual(apiBody);
    });

    it('injects api_key and api_password from process.env at request time', async () => {
      httpService.post.mockReturnValue(
        of({ data: { status: 1, track_number: 'LE222' } }),
      );

      const payload = service.buildBookPacketPayload({
        weightKg: 1,
        pieces: 1,
        collectAmount: 100,
        orderReferenceId: 'ORD-3',
        destinationCityId: 592,
        consigneeName: 'A',
        consigneePhone: '03001111111',
        consigneeAddress: 'Karachi',
      });
      payload.api_key = 'stale-key';
      payload.api_password = 'stale-password';

      await service.bookPacket(payload);

      expect(httpService.post.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          api_key: 'test-api-key',
          api_password: 'test-api-password',
        }),
      );
    });

    it('POSTs trackBookedPacket with track_numbers', async () => {
      const apiBody = { status: 1, packet_list: [] };
      httpService.post.mockReturnValue(of({ data: apiBody }));

      const result = await service.trackBookedPacket('LE111');

      expect(httpService.post).toHaveBeenCalledWith(
        'https://merchantapi.leopardscourier.com/api/trackBookedPacket/format/json/',
        {
          api_key: 'test-api-key',
          api_password: 'test-api-password',
          track_numbers: 'LE111',
        },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual(apiBody);
    });

    it('trackShipment normalizes packet_list into modal payload', async () => {
      httpService.post.mockReturnValue(
        of({
          data: {
            status: 1,
            packet_list: [
              {
                track_number: 'LE999',
                booked_packet_status: 'In Transit',
                destination_city_name: 'Lahore',
                consignment_name_eng: 'Ali Khan',
                'Tracking Detail': [
                  {
                    Status: 'Dispatched',
                    Location: 'Karachi Hub',
                    Activity_Date: '2026-03-01',
                    Activity_Time: '10:00',
                  },
                  {
                    Status: 'In Transit',
                    Location: 'Lahore Hub',
                    Activity_datetime: '2026-03-02 14:30',
                  },
                ],
              },
            ],
          },
        }),
      );

      const result = await service.trackShipment('LE999');

      expect(result.success).toBe(true);
      expect(result.cnNumber).toBe('LE999');
      expect(result.currentStatus).toBe('In Transit');
      expect(result.destination).toBe('Lahore');
      expect(result.consigneeName).toBe('Ali Khan');
      expect(result.events).toHaveLength(2);
      expect(result.events[0].status).toBe('Dispatched');
      expect(result.events[0].location).toBe('Karachi Hub');
      expect(result.trackedAt).toBeTruthy();
    });

    it('trackShipment soft-falls back when packet_list is empty', async () => {
      httpService.post.mockReturnValue(
        of({ data: { status: 1, packet_list: [] } }),
      );

      const result = await service.trackShipment('LE-EMPTY');

      expect(result.success).toBe(false);
      expect(result.cnNumber).toBe('LE-EMPTY');
      expect(result.currentStatus).toBe('BOOKED');
      expect(result.events).toEqual([]);
      expect(result.message).toMatch(/not yet scanned/i);
    });
  });

  describe('bookOrder', () => {
    it('books order, persists CN on OrderShipping, and updates order metadata', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-500',
        status: 'pending',
        paymentStatus: 'pending',
        customerEmail: 'buyer@example.com',
        customerName: 'Buyer Name',
        notes: 'Leave at door',
        grandTotal: { toString: () => '2500' },
        shippingTotal: 300,
        currency: 'PKR',
        shippingAddress: {
          firstName: 'Buyer',
          lastName: 'Name',
          addressLine1: 'Street 5',
          city: 'Lahore',
          phone: '03211234567',
        },
        billingAddress: {},
        metadata: { paymentMethod: 'cod' },
        items: [
          { quantity: 2, metadata: { weightKg: 1 } },
          { quantity: 1, metadata: { weightKg: 0.5 } },
        ],
        shipping: null,
      });

      httpService.post
        .mockReturnValueOnce(
          of({
            data: {
              status: 1,
              city_list: [{ id: 789, name: 'Lahore' }],
            },
          }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              status: 1,
              track_number: 'LE555666777',
              slip_link: 'https://example.com/label.pdf',
            },
          }),
        );

      prisma.shippingMethod.findFirst.mockResolvedValue({
        id: 'method-leopards',
      });
      prisma.orderShipping.create.mockResolvedValue({
        id: 'ship-1',
        orderId: 'order-1',
        shippingMethodId: 'method-leopards',
        cost: 300,
        currency: 'PKR',
        status: 'shipped',
        trackingNumber: 'LE555666777',
        trackingUrl: 'https://www.leopardscourier.com/tracking/?cn=LE555666777',
        courierCode: 'leopards',
        courierName: 'Leopards Courier',
        shippedAt: new Date('2026-01-01T00:00:00Z'),
        deliveredAt: null,
        cancelledAt: null,
        shippingAddress: {},
        metadata: {},
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      });
      prisma.order.update.mockResolvedValue({});

      const result = await service.bookOrder('order-1');

      expect(result.trackingNumber).toBe('LE555666777');
      expect(result.courierName).toBe('Leopards Courier');
      expect(result.labelUrl).toBe('https://example.com/label.pdf');

      const bookCall = httpService.post.mock.calls[1] as unknown as [
        string,
        Record<string, string>,
      ];
      expect(bookCall[0]).toContain('bookPacket/format/json');
      expect(bookCall[1]).toMatchObject({
        booked_packet_weight: '2500',
        booked_packet_no_piece: '3',
        booked_packet_collect_amount: '2500',
        booked_packet_order_id: 'ORD-500',
        origin_city: '592',
        destination_city: '789',
        shipper_phone: '03442394143',
        shipper_name: 'SM Nimco & Sweets',
        return_address:
          'H. NO118, SEC B-3, SAEEDABAD, BALDIA TOWN, KARACHI',
        shipper_id: '2792661',
        consignment_name_eng: 'Buyer Name',
        consignment_phone: '03211234567',
        shipment_type: 'overnight',
      });

      expect(prisma.orderShipping.create).toHaveBeenCalled();
      const createCalls = prisma.orderShipping.create.mock.calls as Array<
        [
          {
            data: {
              trackingNumber: string;
              courierCode: string;
              courierName: string;
            };
          },
        ]
      >;
      expect(createCalls[0][0].data.trackingNumber).toBe('LE555666777');
      expect(createCalls[0][0].data.courierCode).toBe('leopards');
      expect(createCalls[0][0].data.courierName).toBe('Leopards Courier');

      expect(prisma.order.update).toHaveBeenCalled();
      const updateCalls = prisma.order.update.mock.calls as Array<
        [
          {
            where: { id: string };
            data: {
              fulfillmentStatus: string;
              metadata: {
                trackingNumber: string;
                courierName: string;
              };
            };
          },
        ]
      >;
      expect(updateCalls[0][0].where.id).toBe('order-1');
      expect(updateCalls[0][0].data.fulfillmentStatus).toBe('shipped');
      expect(updateCalls[0][0].data.metadata.trackingNumber).toBe(
        'LE555666777',
      );
      expect(updateCalls[0][0].data.metadata.courierName).toBe(
        'Leopards Courier',
      );
    });

    it('rejects non-pending/processing orders', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-2',
        status: 'completed',
        shipping: null,
        items: [],
      });

      await expect(service.bookOrder('order-2')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('bulkBookOrders', () => {
    it('returns per-order booked/skipped/failed results', async () => {
      const orderB = {
        id: 'b',
        orderNumber: 'ORD-B',
        status: 'pending',
        paymentStatus: 'pending',
        customerEmail: 'b@example.com',
        customerName: 'B',
        notes: null,
        grandTotal: { toString: () => '100' },
        shippingTotal: 50,
        currency: 'PKR',
        shippingAddress: {
          firstName: 'B',
          lastName: 'User',
          addressLine1: 'St',
          city: 'Lahore',
          phone: '03001112222',
        },
        billingAddress: {},
        metadata: { paymentMethod: 'cod' },
        items: [{ quantity: 1, metadata: { weightKg: 1 } }],
        shipping: null,
      };

      prisma.order.findUnique
        // bulk pre-check for a (already booked)
        .mockResolvedValueOnce({
          id: 'a',
          orderNumber: 'ORD-A',
          shipping: { trackingNumber: 'LE-EXISTING' },
        })
        // bulk pre-check for b
        .mockResolvedValueOnce({
          id: 'b',
          orderNumber: 'ORD-B',
          shipping: null,
        })
        // bookOrder(b) load
        .mockResolvedValueOnce(orderB)
        // bulk pre-check for missing
        .mockResolvedValueOnce(null);

      httpService.post
        .mockReturnValueOnce(
          of({
            data: { status: 1, city_list: [{ id: 789, name: 'Lahore' }] },
          }),
        )
        .mockReturnValueOnce(
          of({
            data: { status: 1, track_number: 'LE-NEW' },
          }),
        );

      prisma.shippingMethod.findFirst.mockResolvedValue({ id: 'm1' });
      prisma.orderShipping.create.mockResolvedValue({
        id: 'ship-b',
        orderId: 'b',
        shippingMethodId: 'm1',
        cost: 50,
        currency: 'PKR',
        status: 'shipped',
        trackingNumber: 'LE-NEW',
        trackingUrl: 'https://www.leopardscourier.com/tracking?cn=LE-NEW',
        courierCode: 'leopards',
        courierName: 'Leopards Courier',
        shippedAt: new Date(),
        deliveredAt: null,
        cancelledAt: null,
        shippingAddress: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.order.update.mockResolvedValue({});

      const summary = await service.bulkBookOrders(['a', 'b', 'missing'], {
        serviceType: 'DETAIN',
      });

      expect(summary.successCount).toBe(1);
      expect(summary.skippedCount).toBe(1);
      expect(summary.failedCount).toBe(1);
      expect(summary.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            orderId: 'a',
            status: 'skipped',
            cnNumber: 'LE-EXISTING',
          }),
          expect.objectContaining({
            orderId: 'b',
            status: 'booked',
            cnNumber: 'LE-NEW',
          }),
          expect.objectContaining({
            orderId: 'missing',
            status: 'failed',
          }),
        ]),
      );

      const bookCalls = httpService.post.mock.calls as Array<
        [string, Record<string, string>]
      >;
      const bookCall = bookCalls.find((call) => call[0].includes('bookPacket'));
      expect(bookCall?.[1].shipment_type).toBe('detain');
    });
  });
});
