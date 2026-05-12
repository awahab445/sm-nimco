'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CURRENCY } from '@/lib/config';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: DEFAULT_CURRENCY, maximumFractionDigits: 0 }).format(n);
}

/** Allow typing empty / partial numbers in Min/Max fields; commit on blur. */
const PARTIAL_NUM = /^\d*\.?\d*$/;

type Props = {
  boundsMin: number;
  boundsMax: number;
  valueMin?: number;
  valueMax?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
};

export function PlpDualRangePrice({ boundsMin, boundsMax, valueMin, valueMax, onChange }: Props) {
  const loB = Math.min(boundsMin, boundsMax);
  const hiB = Math.max(boundsMin, boundsMax, loB + 1);

  const [lo, setLo] = useState(valueMin ?? loB);
  const [hi, setHi] = useState(valueMax ?? hiB);
  const [minInput, setMinInput] = useState(() => String(Math.round(valueMin ?? loB)));
  const [maxInput, setMaxInput] = useState(() => String(Math.round(valueMax ?? hiB)));

  useEffect(() => {
    const nextLo = valueMin ?? loB;
    const nextHi = valueMax ?? hiB;
    setLo(nextLo);
    setHi(nextHi);
    setMinInput(String(Math.round(nextLo)));
    setMaxInput(String(Math.round(nextHi)));
  }, [valueMin, valueMax, loB, hiB]);

  const commit = (a: number, b: number) => {
    const mn = Math.round(Math.min(a, b));
    const mx = Math.round(Math.max(a, b));
    const fullRange = mn <= loB && mx >= hiB;
    onChange(fullRange ? undefined : mn, fullRange ? undefined : mx);
  };

  const commitMinField = () => {
    const raw = minInput.trim();
    const parsed = raw === '' || raw === '.' ? NaN : parseFloat(raw);
    const v = Number.isFinite(parsed) ? Math.min(Math.max(parsed, loB), hiB) : loB;
    const nextLo = Math.min(v, hi);
    setLo(nextLo);
    setMinInput(String(Math.round(nextLo)));
    commit(nextLo, hi);
  };

  const commitMaxField = () => {
    const raw = maxInput.trim();
    const parsed = raw === '' || raw === '.' ? NaN : parseFloat(raw);
    const v = Number.isFinite(parsed) ? Math.min(Math.max(parsed, loB), hiB) : hiB;
    const nextHi = Math.max(v, lo);
    setHi(nextHi);
    setMaxInput(String(Math.round(nextHi)));
    commit(lo, nextHi);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {fmt(lo)} – {fmt(hi)}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted-foreground">
          Min
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={minInput}
            onChange={(e) => {
              const t = e.target.value;
              if (t === '' || PARTIAL_NUM.test(t)) setMinInput(t);
            }}
            onBlur={commitMinField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Max
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={maxInput}
            onChange={(e) => {
              const t = e.target.value;
              if (t === '' || PARTIAL_NUM.test(t)) setMaxInput(t);
            }}
            onBlur={commitMaxField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground"
          />
        </label>
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-muted-foreground">
          Low
          <input
            type="range"
            min={loB}
            max={hiB}
            step={1}
            value={Math.min(Math.max(lo, loB), hiB)}
            onChange={(e) => {
              const v = Number(e.target.value);
              const nextLo = Math.min(v, hi);
              setLo(nextLo);
              setMinInput(String(Math.round(nextLo)));
              commit(nextLo, hi);
            }}
            className="mt-1 w-full accent-primary"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          High
          <input
            type="range"
            min={loB}
            max={hiB}
            step={1}
            value={Math.min(Math.max(hi, loB), hiB)}
            onChange={(e) => {
              const v = Number(e.target.value);
              const nextHi = Math.max(v, lo);
              setHi(nextHi);
              setMaxInput(String(Math.round(nextHi)));
              commit(lo, nextHi);
            }}
            className="mt-1 w-full accent-primary"
          />
        </label>
      </div>
    </div>
  );
}
