'use client';

import { useState } from 'react';
import { formatPriceWhole } from '@/lib/currency';

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
  const syncedLo = valueMin ?? loB;
  const syncedHi = valueMax ?? hiB;

  const [lo, setLo] = useState(syncedLo);
  const [hi, setHi] = useState(syncedHi);
  const [minInput, setMinInput] = useState(() => String(Math.round(syncedLo)));
  const [maxInput, setMaxInput] = useState(() => String(Math.round(syncedHi)));
  const [prevSynced, setPrevSynced] = useState({ lo: syncedLo, hi: syncedHi });

  // Adjust local draft when controlled bounds/values change (render-time sync).
  if (prevSynced.lo !== syncedLo || prevSynced.hi !== syncedHi) {
    setPrevSynced({ lo: syncedLo, hi: syncedHi });
    setLo(syncedLo);
    setHi(syncedHi);
    setMinInput(String(Math.round(syncedLo)));
    setMaxInput(String(Math.round(syncedHi)));
  }

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
        {formatPriceWhole(lo)} – {formatPriceWhole(hi)}
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
            className="mt-1 w-full border border-border/70 bg-transparent px-2.5 py-2 text-sm text-foreground focus:border-foreground/40 focus:outline-none"
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
            className="mt-1 w-full border border-border/70 bg-transparent px-2.5 py-2 text-sm text-foreground focus:border-foreground/40 focus:outline-none"
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
            className="mt-1 w-full accent-foreground"
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
            className="mt-1 w-full accent-foreground"
          />
        </label>
      </div>
    </div>
  );
}
