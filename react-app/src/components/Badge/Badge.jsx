import React from 'react';

const VARIANTS = {
  default: '',
  primary: 'cx-badge-primary',
  accent: 'cx-badge-accent',
  success: 'cx-badge-success',
  warning: 'cx-badge-warning',
  danger: 'cx-badge-danger',
  info: 'cx-badge-info',
  gradient: 'cx-badge-gradient',
};

export function Badge({ variant = 'default', icon, children }) {
  return (
    <span className={`cx-badge ${VARIANTS[variant] || ''}`}>
      {icon && <i className={`bi ${icon}`} aria-hidden="true"></i>}
      {children}
    </span>
  );
}

const AVATAR_PALETTE = ['#33437A', '#6E62E5', '#2E7DAF', '#1E8E5A', '#B7791F', '#8E5AA8'];
function colorFor(seed = '') {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ name, src, size = 36 }) {
  const color = colorFor(name);
  if (src) {
    return (
      <img
        src={src} alt={name} width={size} height={size}
        className="cx-avatar" style={{ objectFit: 'cover' }}
      />
    );
  }
  return (
    <span
      className="cx-avatar"
      style={{ width: size, height: size, background: `${color}22`, color, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

export function Rating({ value = 0, onChange, readOnly = false, max = 5 }) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;
  return (
    <span className={`cx-rating ${readOnly ? 'readonly' : ''}`} role={readOnly ? undefined : 'radiogroup'} aria-label="Rating">
      {Array.from({ length: max }, (_, i) => {
        const v = i + 1;
        return (
          <i
            key={v}
            className={`bi ${v <= active ? 'bi-star-fill filled' : 'bi-star'}`}
            role={readOnly ? undefined : 'radio'}
            aria-checked={!readOnly ? v === value : undefined}
            tabIndex={readOnly ? -1 : 0}
            onClick={() => !readOnly && onChange?.(v)}
            onMouseEnter={() => !readOnly && setHover(v)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onKeyDown={(e) => { if (!readOnly && (e.key === 'Enter' || e.key === ' ')) onChange?.(v); }}
          />
        );
      })}
    </span>
  );
}
