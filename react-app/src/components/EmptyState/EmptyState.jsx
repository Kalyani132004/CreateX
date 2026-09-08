import React from 'react';

export function EmptyState({ icon = 'bi-inbox', title, description, action }) {
  return (
    <div className="cx-empty">
      <div className="cx-empty-icon"><i className={`bi ${icon}`} aria-hidden="true"></i></div>
      <h3 className="cx-h3">{title}</h3>
      {description && <p className="cx-small mb-3">{description}</p>}
      {action}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="cx-card" style={{ padding: 20 }}>
      <div className="cx-skel" style={{ height: 14, width: '60%', marginBottom: 10 }} />
      <div className="cx-skel" style={{ height: 10, width: '90%', marginBottom: 6 }} />
      <div className="cx-skel" style={{ height: 10, width: '80%', marginBottom: 16 }} />
      <div className="cx-skel" style={{ height: 32, width: '100%' }} />
    </div>
  );
}

export function SkeletonGrid({ count = 3, cols = 'col-md-4' }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }, (_, i) => (
        <div className={cols} key={i}><CardSkeleton /></div>
      ))}
    </div>
  );
}
