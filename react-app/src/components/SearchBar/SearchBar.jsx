import React from 'react';

/**
 * Search input with a search button and an optional mobile "Filters" trigger
 * that opens a Bootstrap offcanvas by id. Used on project discovery pages;
 * pair with <FilterPanel> for the actual filter fields.
 *
 * @example
 * <SearchBar
 *   value={query} onChange={setQuery} onSearch={runSearch}
 *   placeholder="Search projects, technologies, ideas..."
 *   filterTarget="filterDrawer"
 * />
 */
export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  filterTarget, // id (no '#') of an offcanvas to open on mobile; omit to hide the button
  autoFocus = false,
}) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') onSearch?.(value);
  }

  return (
    <div className="d-flex gap-2 flex-wrap">
      <div className="cx-search-mini flex-grow-1" style={{ maxWidth: 'none', background: 'var(--c-bg-alt)' }} role="search">
        <i className="bi bi-search" aria-hidden="true"></i>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          aria-label={placeholder}
        />
      </div>

      {filterTarget && (
        <button
          type="button" className="cx-btn cx-btn-outline d-lg-none"
          data-bs-toggle="offcanvas" data-bs-target={`#${filterTarget}`}
          aria-label="Open filters"
        >
          <i className="bi bi-sliders"></i>Filters
        </button>
      )}

      <button type="button" className="cx-btn cx-btn-primary" onClick={() => onSearch?.(value)}>
        <i className="bi bi-search"></i>Search
      </button>
    </div>
  );
}
