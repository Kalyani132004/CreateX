import React from 'react';

/**
 * Frosted-glass surface. Use sparingly — navbar, hero sections, AI widgets,
 * modals, floating controls. Not for ordinary content cards (use Card).
 */
export default function GlassCard({ as: Tag = 'div', className = '', hero = false, children, ...rest }) {
  return (
    <Tag className={`${hero ? 'cx-hero' : 'cx-glass'} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
