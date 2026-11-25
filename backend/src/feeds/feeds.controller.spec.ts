import { FeedsController } from './feeds.controller';

const row = (over: Record<string, string> = {}) => ({
  id: 'SKU-010-1LTR',
  title: 'Phenyl - 1 Ltr',
  description: 'Floor cleaner',
  availability: 'in stock',
  condition: 'new',
  price: '250.00 PKR',
  link: 'http://localhost:3001/products/phenyl',
  image_link: 'https://api.test/uploads/p.jpg',
  brand: 'SM Nimco',
  additional_image_link: '',
  item_group_id: 'SKU-010',
  google_product_category: 'Cleaners',
  fb_product_category: 'Cleaners',
  product_type: 'Cleaners',
  sale_price: '',
  ...over,
});

describe('FeedsController (Meta + TikTok catalog feed)', () => {
  it('emits Google-format RSS keyed by SKU and drops rows without an image', async () => {
    const buildRows = jest
      .fn()
      .mockResolvedValue([row(), row({ id: 'NO-IMG', image_link: '' })]);
    process.env.FRONTEND_URL = 'https://smnimco.com/';
    const controller = new FeedsController({ buildRows } as never);
    const xml = await controller.getMetaCatalogXml();

    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain('<g:id>SKU-010-1LTR</g:id>');
    expect(xml).toContain('<g:price>250.00 PKR</g:price>');
    expect(xml).toContain('<g:item_group_id>SKU-010</g:item_group_id>');
    expect(xml).toContain(
      '<link>https://smnimco.com/products/phenyl</link>',
    );
    expect(xml).toContain('<g:brand>SM Nimco</g:brand>');
    expect(xml).not.toContain('NO-IMG');
  });

  it('omits brand for untagged products instead of defaulting to the store name', async () => {
    const buildRows = jest.fn().mockResolvedValue([row({ brand: '' })]);
    const xml = await new FeedsController({ buildRows } as never).getMetaCatalogXml();
    expect(xml).not.toContain('<g:brand>');
  });
});
