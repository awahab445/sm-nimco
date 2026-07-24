export function formatCurrency(amount: number, currency: string): string {
  const code = (currency || 'PKR').toUpperCase();
  const n = Number.isFinite(amount) ? amount : 0;

  if (code === 'PKR') {
    return `Rs. ${n.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    })}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export function decimalToNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    return parseFloat((value as { toString: () => string }).toString()) || 0;
  }
  return 0;
}
