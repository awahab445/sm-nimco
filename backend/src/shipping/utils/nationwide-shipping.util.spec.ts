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
    it('charges 300 for billable weight <= 3 kg', () => {
      expect(calculateEconomyShippingCost(0.5)).toBe(300);
      expect(calculateEconomyShippingCost(1)).toBe(300);
      expect(calculateEconomyShippingCost(2)).toBe(300);
      expect(calculateEconomyShippingCost(2.1)).toBe(300); // ceil → 3
      expect(calculateEconomyShippingCost(3)).toBe(300);
    });

    it('adds 70 PKR per kg above 3', () => {
      // billable 4 → 300 + 1*70 = 370
      expect(calculateEconomyShippingCost(3.1)).toBe(370);
      expect(calculateEconomyShippingCost(4)).toBe(370);
      // billable 5 → 300 + 2*70 = 440
      expect(calculateEconomyShippingCost(5)).toBe(440);
      // billable 10 → 300 + 7*70 = 790
      expect(calculateEconomyShippingCost(10)).toBe(790);
    });
  });

  describe('calculateKarachiShippingCost', () => {
    it('charges 200 for billable weight <= 2 kg', () => {
      expect(calculateKarachiShippingCost(0.5)).toBe(200);
      expect(calculateKarachiShippingCost(1)).toBe(200);
      expect(calculateKarachiShippingCost(2)).toBe(200);
      expect(calculateKarachiShippingCost(1.1)).toBe(200); // ceil → 2
    });

    it('charges 250 for billable weight > 2 and <= 3 kg', () => {
      expect(calculateKarachiShippingCost(2.1)).toBe(250); // ceil → 3
      expect(calculateKarachiShippingCost(3)).toBe(250);
    });

    it('charges 300 for billable weight >= 4 kg', () => {
      expect(calculateKarachiShippingCost(3.1)).toBe(300); // ceil → 4
      expect(calculateKarachiShippingCost(4)).toBe(300);
      expect(calculateKarachiShippingCost(8)).toBe(300);
      expect(calculateKarachiShippingCost(12)).toBe(300);
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

    it('applies mid and high weight tiers', () => {
      expect(buildKarachiShippingOption(2.5, 'PKR').cost).toBe(250);
      expect(buildKarachiShippingOption(4, 'PKR').cost).toBe(300);
    });
  });

  describe('calculateOverlandShippingCost', () => {
    it('charges 300 for billable weight <= 3 kg', () => {
      expect(calculateOverlandShippingCost(0.5)).toBe(300);
      expect(calculateOverlandShippingCost(1)).toBe(300);
      expect(calculateOverlandShippingCost(2)).toBe(300);
      expect(calculateOverlandShippingCost(3)).toBe(300);
      expect(calculateOverlandShippingCost(2.1)).toBe(300); // ceil → 3
    });

    it('adds 70 PKR per kg above 3', () => {
      // billable 4 → 300 + 1*70 = 370
      expect(calculateOverlandShippingCost(3.1)).toBe(370);
      expect(calculateOverlandShippingCost(4)).toBe(370);
      // billable 5 → 300 + 2*70 = 440
      expect(calculateOverlandShippingCost(5)).toBe(440);
      // billable 6 → 300 + 3*70 = 510
      expect(calculateOverlandShippingCost(6)).toBe(510);
    });
  });

  describe('calculateNationwideShippingCost with DEFAULT_ZONE_CONFIG rules', () => {
    it('matches outstation formula via economy rules', () => {
      const economy = DEFAULT_ZONE_CONFIG.economy_shipping;
      expect(calculateNationwideShippingCost(1, economy)).toBe(300);
      expect(calculateNationwideShippingCost(2, economy)).toBe(300);
      expect(calculateNationwideShippingCost(3, economy)).toBe(300);
      expect(calculateNationwideShippingCost(4, economy)).toBe(370);
      expect(calculateNationwideShippingCost(5, economy)).toBe(440);
    });

    it('matches outstation formula via overland rules', () => {
      const overland = DEFAULT_ZONE_CONFIG.overland_shipping;
      expect(calculateNationwideShippingCost(3, overland)).toBe(300);
      expect(calculateNationwideShippingCost(4, overland)).toBe(370);
      expect(calculateNationwideShippingCost(5, overland)).toBe(440);
    });
  });
});
