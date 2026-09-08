import React, { useEffect, useRef, useState } from 'react';

function scoreColor(v) {
  if (v >= 75) return 'var(--c-success)';
  if (v >= 50) return 'var(--c-warning)';
  return 'var(--c-danger)';
}

/** Circular animated score ring. Pass `size`/`stroke` to resize. */
export function ScoreRing({ value, size = 88, stroke = 8, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  const col = color || scoreColor(value);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(c - (value / 100) * c));
    return () => cancelAnimationFrame(id);
  }, [value, c]);

  return (
    <span className="cx-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="cx-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="cx-ring-fill"
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          stroke={col} strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <span className="cx-ring-label">
        <span className="cx-ring-value">{value}%</span>
      </span>
    </span>
  );
}

/** Score card: ring + label + caption, used on the Innovation Assistant page. */
export default function ScoreCard({ label, value, caption }) {
  return (
    <div className="cx-card p-4 text-center h-100 d-flex flex-column align-items-center justify-content-center">
      <ScoreRing value={value} size={92} stroke={8} />
      <div className="cx-label mt-3 mb-1">{label}</div>
      {caption && <div className="cx-caption">{caption}</div>}
    </div>
  );
}
