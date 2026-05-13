import { describe, expect, it } from 'vitest';
import { formatVariantAttributes } from '../format-variant-attributes';

describe('formatVariantAttributes', () => {
  it('shows human-readable optionValues and hides optionValueIds', () => {
    const lines = formatVariantAttributes({
      optionValues: { flavour: 'Strawberry', weight: '250g' },
      optionValueIds: {
        flavour: '30d60dcc-867c-4fbd-a208-4aef88480725',
        weight: '0f01dc86-2798-4ffb-9902-663a759b845e',
      },
    });

    expect(lines).toEqual(['Flavour: Strawberry', 'Weight: 250g']);
    expect(lines.some((line) => line.includes('optionValueIds'))).toBe(false);
    expect(lines.some((line) => line.includes('{'))).toBe(false);
  });

  it('returns empty when only internal ids are present', () => {
    expect(
      formatVariantAttributes({
        optionValueIds: { colour: 'uuid-here' },
      }),
    ).toEqual([]);
  });
});
