import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../Badge/Badge';

export default function Navbar({ role, user, onLogout }) {
  return (
    <header className="cx-topbar">
      <button
        className="cx-btn cx-btn-ghost d-lg-none" style={{ padding: 8 }}
        data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-label="Open menu"
      >
        <i className="bi bi-list" style={{ fontSize: '1.3rem' }} aria-hidden="true"></i>
      </button>

      <div className="cx-search-mini d-none d-sm-flex" role="search">
        <i className="bi bi-search" aria-hidden="true"></i>
        <input type="text" placeholder="Search projects, technologies, ideas..." aria-label="Search projects" />
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <button className="cx-btn cx-btn-ghost d-sm-none" style={{ padding: 8 }} aria-label="Search">
          <i className="bi bi-search" aria-hidden="true"></i>
        </button>
        <button className="cx-btn cx-btn-ghost position-relative" style={{ padding: 8 }} aria-label="Notifications">
          <i className="bi bi-bell" style={{ fontSize: '1.1rem' }} aria-hidden="true"></i>
          <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, background: 'var(--c-accent)', borderRadius: '50%' }} />
        </button>

        <div className="dropdown">
          <button className="btn d-flex align-items-center gap-2 border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-expanded="false">
            <Avatar name={user?.name || ''} size={34} />
            <span className="d-none d-md-inline cx-small" style={{ color: 'var(--c-ink)', fontWeight: 600 }}>
              {user?.name?.split(' ')[0]}
            </span>
            <i className="bi bi-chevron-down d-none d-md-inline" style={{ fontSize: '0.7rem', color: 'var(--c-muted)' }} aria-hidden="true"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: 'var(--r-sm)', borderColor: 'var(--c-border-soft)' }}>
            <li><Link className="dropdown-item cx-small" to={`/${role}/profile`}><i className="bi bi-person me-2"></i>Profile</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item cx-small" onClick={onLogout}><i className="bi bi-box-arrow-right me-2"></i>Sign out</button></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
