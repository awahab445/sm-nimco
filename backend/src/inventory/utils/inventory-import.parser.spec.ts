import { BadRequestException } from '@nestjs/common';
import { parseInventoryImportFile } from './inventory-import.parser';

describe('parseInventoryImportFile', () => {
  it('parses CSV rows with variant_id and quantity_delta', () => {
    const csv = `variant_id,quantity_delta,reason
abc-123,10,Received
def-456,-2,
`;
    const rows = parseInventoryImportFile(Buffer.from(csv, 'utf-8'), 'import.csv', 'text/csv');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      variantId: 'abc-123',
      quantityDelta: 10,
      reason: 'Received',
      rowNumber: 2,
    });
    expect(rows[1]).toMatchObject({
      variantId: 'def-456',
      quantityDelta: -2,
      rowNumber: 3,
    });
  });

  it('skips rows with zero delta and throws when no valid rows remain', () => {
    const csv = `variant_id,quantity_delta\nabc-123,0\n`;
    expect(() => parseInventoryImportFile(Buffer.from(csv, 'utf-8'), 'import.csv')).toThrow(
      BadRequestException,
    );
  });

  it('rejects unsupported file types', () => {
    expect(() =>
      parseInventoryImportFile(Buffer.from('data'), 'notes.txt', 'text/plain'),
    ).toThrow(BadRequestException);
  });
});
