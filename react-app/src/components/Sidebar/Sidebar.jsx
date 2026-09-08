import React from 'react';
import { NavLink } from 'react-router-dom';
import { Avatar } from '../Badge/Badge';

export const STUDENT_NAV = [
  { to: '/student/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
  { to: '/student/projects', icon: 'bi-folder2-open', label: 'My Projects' },
  { to: '/student/projects/add', icon: 'bi-plus-circle', label: 'Add Project' },
  { to: '/student/search', icon: 'bi-search', label: 'Search Projects' },
  { to: '/student/wishlist', icon: 'bi-heart', label: 'Wishlist' },
  { to: '/student/assistant', icon: 'bi-stars', label: 'Innovation Assistant' },
  { to: '/student/feedback', icon: 'bi-chat-square-text', label: 'Faculty Feedback' },
  { to: '/student/profile', icon: 'bi-person-circle', label: 'Profile' },
];

export const FACULTY_NAV = [
  { to: '/faculty/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
  { to: '/faculty/projects', icon: 'bi-folder2-open', label: 'Projects' },
  { to: '/faculty/search', icon: 'bi-search', label: 'Search Projects' },
  { to: '/faculty/students', icon: 'bi-people', label: 'Students' },
  { to: '/faculty/profile', icon: 'bi-person-circle', label: 'Profile' },
];

function NavItems({ items }) {
  return (
    <nav className="cx-nav">
      {items.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className={`bi ${n.icon}`} aria-hidden="true"></i>{n.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Persistent desktop sidebar. Hidden below `lg`; use MobileSidebar for small screens. */
export function Sidebar({ role, user }) {
  const items = role === 'faculty' ? FACULTY_NAV : STUDENT_NAV;
  return (
    <aside className="cx-sidebar d-none d-lg-flex">
      <div className="cx-brand"><span className="cx-brand-mark">X</span><span className="cx-brand-name">CreateX</span></div>
      <NavItems items={items} />
      <div className="cx-sidebar-footer">
        <NavLink to={`/${role}/profile`} className="text-decoration-none d-flex align-items-center gap-2 px-2 py-2">
          <Avatar name={user?.name || ''} size={34} />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="cx-small text-truncate" style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{user?.name}</div>
            <div className="cx-caption text-truncate">{role === 'student' ? user?.uid : 'Faculty'}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

/** Bootstrap Offcanvas drawer — the sidebar's mobile equivalent, per the brief's responsive spec. */
export function MobileSidebar({ role }) {
  const items = role === 'faculty' ? FACULTY_NAV : STUDENT_NAV;
  return (
    <div className="offcanvas offcanvas-start cx-offcanvas-sidebar" tabIndex="-1" id="mobileSidebar">
      <div className="offcanvas-header">
        <div className="cx-brand" style={{ padding: 0 }}>
          <span className="cx-brand-mark">X</span><span className="cx-brand-name">CreateX</span>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
      </div>
      <div className="offcanvas-body">
        <NavItems items={items} />
      </div>
    </div>
  );
}
