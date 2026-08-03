import {
  effectiveAvailableStock,
  hasEnoughStock,
  toStockQty,
} from './inventory-stock';

describe('inventory-stock helpers', () => {
  it('coerces string quantities to integers', () => {
    expect(toStockQty('62')).toBe(62);
    expect(toStockQty('100')).toBe(100);
    expect(toStockQty(62.9)).toBe(62);
  });

  it('allows bulk qty when own reservation is credited (62 vs 100 on-hand)', () => {
    // On-hand 100, this cart already reserved 50 → available=50
    const available = 50;
    const ownReserved = 50;
    const requested = 62;

    expect(hasEnoughStock(available, requested, ownReserved)).toBe(true);
    expect(effectiveAvailableStock(available, ownReserved)).toBe(100);
  });

  it('fails when others hold enough that requested exceeds remaining sellable', () => {
    // On-hand 100, others reserved 40, own cart reserved 10 → available=50
    expect(hasEnoughStock(50, 62, 10)).toBe(false);
    expect(effectiveAvailableStock(50, 10)).toBe(60);
  });

  it('does not treat string lexical compare as authoritative', () => {
    // Without Number(), "62" > "100" is true in JS — helpers must still pass.
    expect(hasEnoughStock('100', '62', 0)).toBe(true);
    expect(hasEnoughStock('50', '62', '50')).toBe(true);
  });

  it('fresh add with no own reservation uses raw available', () => {
    expect(hasEnoughStock(100, 62, 0)).toBe(true);
    expect(hasEnoughStock(50, 62, 0)).toBe(false);
  });
});
