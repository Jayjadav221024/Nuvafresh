import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   ADMIN DATA VISUALISATION
   The measures every Shopify-style screen reports with — one stat tile,
   one trend line, one delta — so Home and Analytics quote the same
   number in the same shape and a merchant reads them as one product.
═══════════════════════════════════════════════════════════════════ */
export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const count = (n) => Number(n || 0).toLocaleString('en-IN');
export const percent = (n) => `${Number(n || 0).toFixed(1)}%`;

/* The palette lives here as roles, so light and dark swap in one place.
   Categorical slots are the validated order; slot 1 doubles as the
   single-series sequential hue. */
const LIGHT_TOKENS = {
  '--viz-series-1': '#2a78d6',
  '--viz-series-2': '#eb6834',
  '--viz-series-3': '#1baf7a',
  '--viz-series-4': '#eda100',
  '--viz-series-5': '#e87ba4',
  '--viz-series-6': '#008300',
  '--viz-grid': '#e1e1e1',
  '--viz-surface': '#ffffff'
};

const DARK_TOKENS = `
  .dark .viz-root {
    --viz-series-1: #3987e5;
    --viz-series-2: #d95926;
    --viz-series-3: #199e70;
    --viz-series-4: #c98500;
    --viz-series-5: #d55181;
    --viz-series-6: #008300;
    --viz-grid: #2e2e2e;
    --viz-surface: #1a1a1a;
  }
`;

export const VizRoot = ({ className = '', children }) => (
  <div className={`viz-root ${className}`} style={LIGHT_TOKENS}>
    <style>{DARK_TOKENS}</style>
    {children}
  </div>
);

export const EmptyState = ({ message = 'No data for this date range' }) => (
  <div className="flex-1 flex items-center justify-center py-8">
    <p className="text-xs text-neutral-500">{message}</p>
  </div>
);

export const Delta = ({ value, invert = false }) => {
  const n = Number(value) || 0;
  const good = invert ? n < 0 : n > 0;
  const Icon = n === 0 ? Minus : n > 0 ? ArrowUpRight : ArrowDownRight;
  const tone = n === 0
    ? 'text-neutral-500'
    : good
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-rose-700 dark:text-rose-400';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${tone}`}>
      <Icon className="h-3 w-3" />
      {n === 0 ? 'No change' : `${Math.abs(n)}%`}
    </span>
  );
};

/* A tile is selectable when the caller passes onSelect — that is how the
   Home chart follows the measure the merchant clicked. */
export const StatTile = ({
  label,
  value,
  delta,
  invert,
  caption = 'vs previous period',
  hint,
  selected,
  onSelect
}) => {
  const body = (
    <>
      <p className="text-[11px] font-medium text-neutral-500">{label}</p>
      <p className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">{value}</p>
      {delta !== undefined && delta !== null ? (
        <div className="flex items-center gap-1.5">
          <Delta value={delta} invert={invert} />
          <span className="text-[11px] text-neutral-500">{caption}</span>
        </div>
      ) : (
        hint && <p className="text-[11px] text-neutral-500">{hint}</p>
      )}
    </>
  );

  if (!onSelect) return <div className="px-4 py-3 space-y-1">{body}</div>;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      /* The selected measure is marked by a top rule as well as the tint,
         so the choice is not carried by colour alone. */
      className={`relative px-4 py-3 space-y-1 text-left transition-colors ${
        selected
          ? 'bg-[#f7f7f7] dark:bg-[#212121]'
          : 'hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e]'
      }`}
    >
      {selected && (
        <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: 'var(--viz-series-1)' }} />
      )}
      {body}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TREND
   One measure per chart — two measures of different scale get two charts,
   never two y-axes on one.
═══════════════════════════════════════════════════════════════════ */
export const TrendChart = ({ data, valueKey, format = count, height = 180 }) => {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(560);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, entry.contentRect.width));
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const padX = 8;
  const padTop = 12;
  const padBottom = 22;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const rawMax = Math.max(...values, 0);
  // Round the top gridline to a clean number so the ticks read well.
  const magnitude = rawMax > 0 ? Math.pow(10, Math.floor(Math.log10(rawMax))) : 1;
  const max = rawMax > 0 ? Math.ceil(rawMax / magnitude) * magnitude : 1;

  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const pointAt = (i) => ({
    x: padX + i * stepX,
    y: padTop + plotH - (values[i] / max) * plotH
  });

  const line = data.map((_, i) => {
    const p = pointAt(i);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  const area = data.length > 0
    ? `${line} L${(padX + (data.length - 1) * stepX).toFixed(1)},${padTop + plotH} L${padX},${padTop + plotH} Z`
    : '';

  const onMove = useCallback((e) => {
    if (data.length === 0 || stepX === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padX;
    const index = Math.max(0, Math.min(data.length - 1, Math.round(x / stepX)));
    setHover(index);
  }, [data.length, stepX]);

  if (rawMax === 0) return <EmptyState />;

  const last = data.length - 1;
  const lastPoint = pointAt(last);
  const hoverPoint = hover !== null ? pointAt(hover) : null;

  return (
    <div ref={wrapRef} className="relative flex-1">
      <svg
        width={width}
        height={height}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block overflow-visible"
        role="img"
        aria-label={`${valueKey} over time`}
      >
        {/* Gridlines: hairline, solid, recessive. */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padTop + plotH * t}
            y2={padTop + plotH * t}
            stroke="var(--viz-grid)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill="var(--viz-series-1)" opacity="0.1" />
        <path
          d={line}
          fill="none"
          stroke="var(--viz-series-1)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* End marker: ≥8px, with a 2px surface ring so it stays legible. */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4"
          fill="var(--viz-series-1)"
          stroke="var(--viz-surface)"
          strokeWidth="2"
        />

        {hoverPoint && (
          <>
            <line
              x1={hoverPoint.x}
              x2={hoverPoint.x}
              y1={padTop}
              y2={padTop + plotH}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r="4"
              fill="var(--viz-series-1)"
              stroke="var(--viz-surface)"
              strokeWidth="2"
            />
          </>
        )}

        {/* Only the ends are labelled — a date under every point is unreadable. */}
        <text x={padX} y={height - 6} className="fill-neutral-500" fontSize="10">
          {data[0]?.label}
        </text>
        <text x={width - padX} y={height - 6} textAnchor="end" className="fill-neutral-500" fontSize="10">
          {data[last]?.label}
        </text>
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] font-semibold whitespace-nowrap shadow-lg"
          style={{
            left: Math.min(Math.max(hoverPoint.x - 40, 0), width - 90),
            top: Math.max(hoverPoint.y - 34, 0)
          }}
        >
          {data[hover].label}: {format(values[hover])}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
        <span>0</span>
        <span>peak {format(max)}</span>
      </div>
    </div>
  );
};
