import {
  applyShippingGst,
  calculateDualTierBaseShipping,
  resolveShippingSlab,
  roundShippingFee,
} from './shipping-fee';

/** Zone A example rates from the shipping slab spec. */
const ZONE_A = {
  rateLessThan10kg: 50,
  rateGreaterOrEqual10kg: 35,
};

const GST_PCT = 18;

function finalFee(weightKg: number): number {
  const base = calculateDualTierBaseShipping(weightKg, ZONE_A);
  return roundShippingFee(applyShippingGst(base, GST_PCT));
}

describe('shipping-fee 4-tier slabs (Zone A)', () => {
  it('2.0 kg → bill 3kg @ 50 = 150 + 18% GST = 177', () => {
    const slab = resolveShippingSlab(2, ZONE_A);
    expect(slab).toMatchObject({
      slab: 1,
      billingWeightKg: 3,
      ratePerKg: 50,
      baseShipping: 150,
    });
    expect(finalFee(2)).toBe(177);
  });

  it('4.0 kg → bill 5kg @ 50 = 250 + 18% GST = 295', () => {
    const slab = resolveShippingSlab(4, ZONE_A);
    expect(slab).toMatchObject({
      slab: 2,
      billingWeightKg: 5,
      ratePerKg: 50,
      baseShipping: 250,
    });
    expect(finalFee(4)).toBe(295);
  });

  it('6.0 kg → bill 6kg @ 50 = 300 + 18% GST = 354', () => {
    const slab = resolveShippingSlab(6, ZONE_A);
    expect(slab).toMatchObject({
      slab: 3,
      billingWeightKg: 6,
      ratePerKg: 50,
      baseShipping: 300,
    });
    expect(finalFee(6)).toBe(354);
  });

  it('10.0 kg → bill 10kg @ 35 = 350 + 18% GST = 413', () => {
    const slab = resolveShippingSlab(10, ZONE_A);
    expect(slab).toMatchObject({
      slab: 4,
      billingWeightKg: 10,
      ratePerKg: 35,
      baseShipping: 350,
    });
    expect(finalFee(10)).toBe(413);
  });

  it('12.0 kg → bill 12kg @ 35 = 420 + 18% GST = 495.6', () => {
    const slab = resolveShippingSlab(12, ZONE_A);
    expect(slab).toMatchObject({
      slab: 4,
      billingWeightKg: 12,
      ratePerKg: 35,
      baseShipping: 420,
    });
    expect(finalFee(12)).toBe(495.6);
  });

  it('boundary: 3kg uses min slab, just over 3kg uses 5kg flat', () => {
    expect(resolveShippingSlab(3, ZONE_A).billingWeightKg).toBe(3);
    expect(resolveShippingSlab(3.01, ZONE_A).billingWeightKg).toBe(5);
  });

  it('boundary: 5kg uses flat slab, just over 5kg bills actual', () => {
    expect(resolveShippingSlab(5, ZONE_A).billingWeightKg).toBe(5);
    expect(resolveShippingSlab(5.01, ZONE_A).billingWeightKg).toBe(5.01);
    expect(resolveShippingSlab(5.01, ZONE_A).slab).toBe(3);
  });

  it('boundary: just under 10kg uses <10 rate; 10kg uses bulk rate', () => {
    expect(resolveShippingSlab(9.99, ZONE_A).ratePerKg).toBe(50);
    expect(resolveShippingSlab(10, ZONE_A).ratePerKg).toBe(35);
  });
});
