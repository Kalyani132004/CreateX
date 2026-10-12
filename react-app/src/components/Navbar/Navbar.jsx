// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Avatar } from '../Badge/Badge';

// export default function Navbar({ role, user, onLogout }) {
//   return (
//     <header className="cx-topbar">
//       <button
//         className="cx-btn cx-btn-ghost d-lg-none" style={{ padding: 8 }}
//         data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-label="Open menu"
//       >
//         <i className="bi bi-list" style={{ fontSize: '1.3rem' }} aria-hidden="true"></i>
//       </button>

//       <div className="cx-search-mini d-none d-sm-flex" role="search">
//         <i className="bi bi-search" aria-hidden="true"></i>
//         <input type="text" placeholder="Search projects, technologies, ideas..." aria-label="Search projects" />
//       </div>

//       <div className="ms-auto d-flex align-items-center gap-3">
//         <button className="cx-btn cx-btn-ghost d-sm-none" style={{ padding: 8 }} aria-label="Search">
//           <i className="bi bi-search" aria-hidden="true"></i>
//         </button>
//         <button className="cx-btn cx-btn-ghost position-relative" style={{ padding: 8 }} aria-label="Notifications">
//           <i className="bi bi-bell" style={{ fontSize: '1.1rem' }} aria-hidden="true"></i>
//           <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, background: 'var(--c-accent)', borderRadius: '50%' }} />
//         </button>

//         <div className="dropdown">
//           <button className="btn d-flex align-items-center gap-2 border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-expanded="false">
//             <Avatar name={user?.name || ''} size={34} />
//             <span className="d-none d-md-inline cx-small" style={{ color: 'var(--c-ink)', fontWeight: 600 }}>
//               {user?.name?.split(' ')[0]}
//             </span>
//             <i className="bi bi-chevron-down d-none d-md-inline" style={{ fontSize: '0.7rem', color: 'var(--c-muted)' }} aria-hidden="true"></i>
//           </button>
//           <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: 'var(--r-sm)', borderColor: 'var(--c-border-soft)' }}>
//             <li><Link className="dropdown-item cx-small" to={`/${role}/profile`}><i className="bi bi-person me-2"></i>Profile</Link></li>
//             <li><hr className="dropdown-divider" /></li>
//             <li><button className="dropdown-item cx-small" onClick={onLogout}><i className="bi bi-box-arrow-right me-2"></i>Sign out</button></li>
//           </ul>
//         </div>
//       </div>
//     </header>
//   );
// }
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../Badge/Badge';
import '../../styles/Navbar.css';

/**
 * Props (the first three are unchanged):
 *   role, user, onLogout
 *   onSearch(query)         optional - if omitted, navigates to `${searchPath}?q=...`
 *   searchPath              optional - defaults to `/${role}/projects`   (ASSUMPTION)
 *   unreadCount             optional - the bell shows a badge only when > 0
 *   onNotificationsClick    optional - wire this to your notifications panel/route
 */
export default function Navbar({
  role,
  user,
  onLogout,
  onSearch,
  searchPath,
  unreadCount = 0,
  onNotificationsClick,
}) {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const desktopInputRef = useRef(null);

  const currentRole = role || user?.role || '';
  const profilePath = `/${currentRole}/profile`;
  const fullName = user?.name || '';
  const firstName = fullName.split(' ')[0];

  /* "/" focuses the search box, like most dashboards (ignored while typing). */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      if (desktopInputRef.current && desktopInputRef.current.offsetParent !== null) {
        e.preventDefault();
        desktopInputRef.current.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (onSearch) onSearch(q);
    else navigate(`${searchPath || `/${currentRole}/projects`}?q=${encodeURIComponent(q)}`);

    setMobileSearchOpen(false);
  }

  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  const searchField = (id, inputRef, autoFocus = false) => (
    <form className="cx-search-mini nb-search" role="search" onSubmit={submitSearch}>
      <i className="bi bi-search" aria-hidden="true" />
      <input
        id={id}
        ref={inputRef}
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setQuery('');
            setMobileSearchOpen(false);
            e.currentTarget.blur();
          }
        }}
        placeholder="Search projects, technologies, ideas..."
        aria-label="Search projects"
        autoComplete="off"
      />
      {!autoFocus && <kbd className="nb-kbd" aria-hidden="true">/</kbd>}
    </form>
  );

  return (
    <header className="cx-topbar nb">
      <button
        type="button"
        className="cx-btn cx-btn-ghost nb-icon-btn d-lg-none"
        data-bs-toggle="offcanvas"
        data-bs-target="#mobileSidebar"
        aria-label="Open menu"
      >
        <i className="bi bi-list nb-icon-lg" aria-hidden="true" />
      </button>

      <div className="d-none d-sm-flex nb-search-wrap">{searchField('nb-search-desktop', desktopInputRef)}</div>

      <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
        <button
          type="button"
          className="cx-btn cx-btn-ghost nb-icon-btn d-sm-none"
          aria-label={mobileSearchOpen ? 'Close search' : 'Search'}
          aria-expanded={mobileSearchOpen}
          onClick={() => setMobileSearchOpen((open) => !open)}
        >
          <i className={`bi ${mobileSearchOpen ? 'bi-x-lg' : 'bi-search'}`} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="cx-btn cx-btn-ghost nb-icon-btn position-relative"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          onClick={onNotificationsClick}
        >
          <i className="bi bi-bell nb-icon-md" aria-hidden="true" />
          {unreadCount > 0 && <span className="nb-badge" aria-hidden="true">{badgeText}</span>}
        </button>

        <div className="dropdown">
          <button
            type="button"
            className="nb-user"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-haspopup="true"
            aria-label="Account menu"
          >
            <Avatar name={fullName} image={user?.profile_photo} size={34} />
            {firstName && <span className="d-none d-md-inline nb-user-name">{firstName}</span>}
            <i className="bi bi-chevron-down d-none d-md-inline nb-chevron" aria-hidden="true" />
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-sm nb-menu">
            {(fullName || user?.email) && (
              <li className="nb-menu-head">
                {fullName && <strong>{fullName}</strong>}
                {user?.email && <small>{user.email}</small>}
                {currentRole && <span className="cx-badge">{currentRole}</span>}
              </li>
            )}
            {(fullName || user?.email) && <li><hr className="dropdown-divider" /></li>}
            <li>
              <Link className="dropdown-item cx-small" to={profilePath}>
                <i className="bi bi-person me-2" aria-hidden="true" />Profile
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button type="button" className="dropdown-item cx-small" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="nb-mobile-search d-sm-none">{searchField('nb-search-mobile', null, true)}</div>
      )}
    </header>
  );
}
