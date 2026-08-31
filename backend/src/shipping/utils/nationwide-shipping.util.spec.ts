import {
  buildKarachiShippingOption,
  calculateEconomyShippingCost,
  calculateKarachiShippingCost,
  calculateNationwideShippingCost,
  calculateOverlandShippingCost,
  resolveBillableWeightKg,
} from './nationwide-shipping.util';
import { DEFAULT_ZONE_CONFIG } from '../config/default-zone-config';

describe('nationwide-shipping.util', () => {
  describe('resolveBillableWeightKg', () => {
    it('ceilings fractional weight with minimum 1 kg', () => {
      expect(resolveBillableWeightKg(0)).toBe(1);
      expect(resolveBillableWeightKg(0.1)).toBe(1);
      expect(resolveBillableWeightKg(1)).toBe(1);
      expect(resolveBillableWeightKg(1.01)).toBe(2);
      expect(resolveBillableWeightKg(2.4)).toBe(3);
    });
  });

  describe('calculateEconomyShippingCost', () => {
    it('charges 275 for billable weight <= 3 kg', () => {
      expect(calculateEconomyShippingCost(0.5)).toBe(275);
      expect(calculateEconomyShippingCost(1)).toBe(275);
      expect(calculateEconomyShippingCost(2.1)).toBe(275); // ceil → 3
      expect(calculateEconomyShippingCost(3)).toBe(275);
    });

    it('adds 76 PKR per kg above 3', () => {
      // billable 4 → 275 + 1*76 = 351
      expect(calculateEconomyShippingCost(3.1)).toBe(351);
      expect(calculateEconomyShippingCost(4)).toBe(351);
      // billable 5 → 275 + 2*76 = 427
      expect(calculateEconomyShippingCost(5)).toBe(427);
      // billable 10 → 275 + 7*76 = 807
      expect(calculateEconomyShippingCost(10)).toBe(807);
    });
  });

  describe('calculateKarachiShippingCost', () => {
    it('charges 200 for billable weight <= 7 kg', () => {
      expect(calculateKarachiShippingCost(0.5)).toBe(200);
      expect(calculateKarachiShippingCost(1)).toBe(200);
      expect(calculateKarachiShippingCost(7)).toBe(200);
      expect(calculateKarachiShippingCost(6.1)).toBe(200); // ceil → 7
    });

    it('charges 250 for billable weight > 7 kg', () => {
      expect(calculateKarachiShippingCost(7.1)).toBe(250);
      expect(calculateKarachiShippingCost(8)).toBe(250);
      expect(calculateKarachiShippingCost(12)).toBe(250);
    });
  });

  describe('buildKarachiShippingOption', () => {
    it('returns only Standard Delivery for Karachi', () => {
      const option = buildKarachiShippingOption(2, 'PKR');
      expect(option.methodCode).toBe('standard_karachi');
      expect(option.methodName).toBe('Standard Delivery');
      expect(option.cost).toBe(200);
      expect(option.description).toContain('1 to 2 Days');
    });
  });

  describe('calculateOverlandShippingCost', () => {
    it('charges flat 342 for billable weight <= 5 kg', () => {
      expect(calculateOverlandShippingCost(0.5)).toBe(342);
      expect(calculateOverlandShippingCost(1)).toBe(342);
      expect(calculateOverlandShippingCost(5)).toBe(342);
      expect(calculateOverlandShippingCost(4.1)).toBe(342); // ceil → 5
    });

    it('multiplies full billable weight by 70 with NO base when > 5 kg', () => {
      // billable 6 → 6 * 70 = 420 (NOT 342 + anything)
      expect(calculateOverlandShippingCost(5.1)).toBe(420);
      expect(calculateOverlandShippingCost(6)).toBe(420);
      // billable 10 → 700
      expect(calculateOverlandShippingCost(10)).toBe(700);
      // Ensure base 342 is never added
      expect(calculateOverlandShippingCost(6)).not.toBe(342 + 6 * 70);
      expect(calculateOverlandShippingCost(6)).not.toBe(342 + 70);
    });
  });

  describe('calculateNationwideShippingCost with DEFAULT_ZONE_CONFIG rules', () => {
    it('matches economy formula via rules', () => {
      const economy = DEFAULT_ZONE_CONFIG.economy_shipping;
      expect(calculateNationwideShippingCost(2, economy)).toBe(275);
      expect(calculateNationwideShippingCost(4, economy)).toBe(351);
    });

    it('matches overland formula via rules (no base above 5kg)', () => {
      const overland = DEFAULT_ZONE_CONFIG.overland_shipping;
      expect(calculateNationwideShippingCost(3, overland)).toBe(342);
      expect(calculateNationwideShippingCost(6, overland)).toBe(420);
      expect(calculateNationwideShippingCost(10, overland)).toBe(700);
    });
  });
});
