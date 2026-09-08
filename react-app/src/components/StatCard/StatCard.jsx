import React from 'react';

export default function StatCard({ icon, value, label, delta, direction = 'up' }) {
  return (
    <div className="cx-card cx-stat">
      <div className="cx-stat-icon"><i className={`bi ${icon}`} aria-hidden="true"></i></div>
      <div className="cx-stat-value">{value}</div>
      <div className="cx-stat-label">{label}</div>
      {delta && (
        <div className={`cx-stat-delta ${direction}`}>
          <i className={`bi bi-arrow-${direction === 'up' ? 'up' : 'down'}-short`} aria-hidden="true"></i>
          {delta}
        </div>
      )}
    </div>
  );
}
