import {
  applyShippingGst,
  calculateDualTierBaseShipping,
  calculateKarachiShippingFee,
  calculateShippingFee,
  calculateWeightBasedShippingFee,
  isKarachiCity,
  qualifiesForFreeDelivery,
  resolveShippingSlab,
  roundShippingFee,
  toBillableKg,
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

const OUTSTATION_CONFIG = {
  baseCost: 300,
  costPerKg: 70,
  baseCostKgLimit: 3,
};

describe('weight-based shipping (outstation)', () => {
  it('rounds weight UP to the nearest integer kilogram', () => {
    expect(toBillableKg(3.2)).toBe(4);
    expect(toBillableKg(5.1)).toBe(6);
    expect(toBillableKg(3)).toBe(3);
    expect(toBillableKg(0.1)).toBe(1);
  });

  it('outstation: 1kg, 2kg, 3kg = PKR 300', () => {
    expect(
      calculateWeightBasedShippingFee(1, OUTSTATION_CONFIG, 'economy_shipping'),
    ).toBe(300);
    expect(
      calculateWeightBasedShippingFee(2, OUTSTATION_CONFIG, 'economy_shipping'),
    ).toBe(300);
    expect(
      calculateWeightBasedShippingFee(3, OUTSTATION_CONFIG, 'economy_shipping'),
    ).toBe(300);
    expect(
      calculateWeightBasedShippingFee(
        2.4,
        OUTSTATION_CONFIG,
        'economy_shipping',
      ),
    ).toBe(300); // ceil → 3
  });

  it('outstation: 4kg = PKR 370', () => {
    expect(
      calculateWeightBasedShippingFee(4, OUTSTATION_CONFIG, 'economy_shipping'),
    ).toBe(370);
    expect(
      calculateWeightBasedShippingFee(
        3.2,
        OUTSTATION_CONFIG,
        'economy_shipping',
      ),
    ).toBe(370); // ceil → 4 → 300 + 1*70
  });

  it('outstation: 5kg = PKR 440', () => {
    expect(
      calculateWeightBasedShippingFee(5, OUTSTATION_CONFIG, 'economy_shipping'),
    ).toBe(440);
    expect(
      calculateWeightBasedShippingFee(
        5,
        OUTSTATION_CONFIG,
        'overland_shipping',
      ),
    ).toBe(440);
  });

  it('outstation: 5.1kg bills 6kg → 300 + 3*70 = 510', () => {
    expect(
      calculateWeightBasedShippingFee(
        5.1,
        OUTSTATION_CONFIG,
        'economy_shipping',
      ),
    ).toBe(510);
  });
});

describe('qualifiesForFreeDelivery', () => {
  it('grants free delivery when subtotal meets the threshold, regardless of weight', () => {
    expect(
      qualifiesForFreeDelivery({
        subtotal: 4000,
        freeDeliveryThreshold: 4000,
      }),
    ).toBe(true);
    expect(
      qualifiesForFreeDelivery({
        subtotal: 10000,
        freeDeliveryThreshold: 4000,
      }),
    ).toBe(true);
  });

  it('does not grant free delivery when subtotal is below threshold', () => {
    expect(
      qualifiesForFreeDelivery({
        subtotal: 3999,
        freeDeliveryThreshold: 4000,
      }),
    ).toBe(false);
  });
});

describe('Karachi local delivery', () => {
  it('matches Karachi case-insensitively and ignores other cities', () => {
    expect(isKarachiCity('Karachi')).toBe(true);
    expect(isKarachiCity('karachi')).toBe(true);
    expect(isKarachiCity(' KARACHI ')).toBe(true);
    expect(isKarachiCity('Lahore')).toBe(false);
    expect(isKarachiCity('North Karachi')).toBe(false);
  });

  it('charges Rs. 200 at or below 2 billable kg', () => {
    expect(calculateKarachiShippingFee(1)).toBe(200);
    expect(calculateKarachiShippingFee(1.1)).toBe(200); // ceil → 2
    expect(calculateKarachiShippingFee(2)).toBe(200);
  });

  it('charges Rs. 250 for billable weight > 2 and <= 3 kg', () => {
    expect(calculateKarachiShippingFee(2.1)).toBe(250); // ceil → 3
    expect(calculateKarachiShippingFee(3)).toBe(250);
  });

  it('charges Rs. 300 for billable weight >= 4 kg', () => {
    expect(calculateKarachiShippingFee(3.1)).toBe(300); // ceil → 4
    expect(calculateKarachiShippingFee(4)).toBe(300);
    expect(calculateKarachiShippingFee(12)).toBe(300);
  });
});

describe('calculateShippingFee (manual orders)', () => {
  it('uses Karachi slabs for Karachi city', () => {
    expect(calculateShippingFee('Karachi', 1)).toBe(200);
    expect(calculateShippingFee('Karachi', 2.5)).toBe(250);
    expect(calculateShippingFee('Karachi', 5)).toBe(300);
  });

  it('uses outstation 300 + 70/kg above 3kg for other cities', () => {
    expect(calculateShippingFee('Lahore', 2)).toBe(300);
    expect(calculateShippingFee('Outstation', 3)).toBe(300);
    expect(calculateShippingFee('Lahore', 4)).toBe(370);
    expect(calculateShippingFee('Islamabad', 5)).toBe(440);
  });
});
