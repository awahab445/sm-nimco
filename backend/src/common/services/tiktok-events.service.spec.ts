import { createHash } from 'crypto';
import { of } from 'rxjs';
import { TikTokEventsService, toTikTokPhone } from './tiktok-events.service';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');

describe('TikTokEventsService', () => {
  const post = jest.fn();
  const getAdminSettings = jest.fn();
  const service = new TikTokEventsService(
    { post } as never,
    { getAdminSettings } as never,
  );

  beforeEach(() => {
    post.mockReset().mockReturnValue(of({ data: { code: 0, message: 'OK' } }));
    getAdminSettings.mockReset().mockResolvedValue({
      tiktokPixelEnabled: true,
      tiktokPixelId: 'C4A1B2C3D4E5F6G7H8I9',
    });
    process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN = 'tok';
    delete process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE;
  });

  afterAll(() => {
    delete process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;
  });

  it('normalizes local PK phones to E.164', () => {
    expect(toTikTokPhone('0300-1234567')).toBe('+923001234567');
    expect(toTikTokPhone('+92 300 1234567')).toBe('+923001234567');
    expect(toTikTokPhone('')).toBeNull();
  });

  it('sends Purchase as CompletePayment with hashed PII, SKUs only, shared event_id', async () => {
    const res = await service.sendEvent(
      'Purchase',
      'purchase_ORD-1',
      {
        email: ' Ali@Example.com ',
        phone: '03001234567',
        external_id: 'cust-1',
        client_ip_address: '1.2.3.4',
        client_user_agent: 'UA',
        ttp: 'ttp-cookie',
        ttclid: 'click-1',
        event_source_url: 'https://shop.test/checkout',
      },
      {
        contents: [
          { id: 'SKU-1', quantity: 2, item_price: 100 },
          { id: 'fdf241e4-b0d0-456e-8da6-eef5c1124666', quantity: 1 },
        ],
        value: 200,
        currency: 'pkr',
        order_id: 'ORD-1',
      },
    );
    expect(res.success).toBe(true);
    const [url, body, opts] = post.mock.calls[0] as [
      string,
      {
        event_source_id: string;
        data: Array<Record<string, unknown>>;
      },
      { headers: Record<string, string> },
    ];
    expect(url).toContain('/open_api/v1.3/event/track/');
    expect(opts.headers['Access-Token']).toBe('tok');
    expect(body.event_source_id).toBe('C4A1B2C3D4E5F6G7H8I9');
    const event = body.data[0];
    expect(event.event).toBe('CompletePayment');
    expect(event.event_id).toBe('purchase_ORD-1');
    expect(event.user).toEqual({
      email: sha('ali@example.com'),
      phone: sha('+923001234567'),
      external_id: sha('cust-1'),
      ip: '1.2.3.4',
      user_agent: 'UA',
      ttp: 'ttp-cookie',
      ttclid: 'click-1',
    });
    expect(event.page).toEqual({ url: 'https://shop.test/checkout' });
    expect(event.properties).toEqual({
      currency: 'PKR',
      content_type: 'product',
      contents: [
        {
          content_id: 'SKU-1',
          content_type: 'product',
          quantity: 2,
          price: 100,
        },
      ],
      value: 200,
      order_id: 'ORD-1',
    });
  });

  it('skips PageView (browser ttq.page has no event_id to dedupe)', async () => {
    const res = await service.sendEvent('PageView', 'pv_1', {});
    expect(res.skipped).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });

  it('skips without token or when pixel disabled', async () => {
    delete process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;
    expect((await service.sendEvent('AddToCart', 'atc_1', {})).skipped).toBe(
      true,
    );
    process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN = 'tok';
    getAdminSettings.mockResolvedValue({
      tiktokPixelEnabled: false,
      tiktokPixelId: 'X',
    });
    expect((await service.sendEvent('AddToCart', 'atc_1', {})).skipped).toBe(
      true,
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('treats non-zero TikTok code as failure', async () => {
    post.mockReturnValue(of({ data: { code: 40001, message: 'bad token' } }));
    const res = await service.sendEvent('AddToCart', 'atc_1', {});
    expect(res).toEqual({ success: false, error: 'bad token' });
  });
});
