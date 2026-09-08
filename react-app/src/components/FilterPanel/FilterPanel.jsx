import React from 'react';

/**
 * Renders a set of filter <select>s from a config array. Used twice per
 * page — once inline for desktop, once inside a mobile offcanvas — so it
 * takes an `idPrefix` to keep element ids unique across both renders.
 *
 * @param {{ key: string, label: string, options: string[] }[]} fields
 *   e.g. [{ key: 'domain', label: 'Domain', options: DOMAINS }]
 * @param {object} values   current filter values, keyed by field.key
 * @param {(key: string, value: string) => void} onChange
 */
function FilterFields({ fields, values, onChange, idPrefix, stacked = false }) {
  return (
    <>
      {fields.map(({ key, label, options }) => (
        <select
          key={key}
          id={`${idPrefix}-${key}`}
          className="cx-select"
          style={stacked ? undefined : { maxWidth: 170 }}
          aria-label={label}
          value={values[key] ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
        >
          <option value="">All {label}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
    </>
  );
}

/**
 * Full filter panel: a desktop inline row (chips row, hidden below `lg`)
 * plus a mobile bottom-sheet offcanvas exposing the same fields.
 * Render once per page — it handles both breakpoints internally.
 *
 * @example
 * <FilterPanel
 *   fields={[
 *     { key: 'domain', label: 'Domains', options: DOMAINS },
 *     { key: 'technology', label: 'Technologies', options: TECH_OPTIONS },
 *     { key: 'course', label: 'Courses', options: COURSES },
 *     { key: 'batch', label: 'Batches', options: BATCHES },
 *   ]}
 *   values={filters}
 *   onChange={updateFilter}
 *   sortValue={filters.sort}
 *   sortOptions={[
 *     { value: 'relevant', label: 'Most Relevant' },
 *     { value: 'innovation', label: 'Highest Innovation' },
 *   ]}
 *   onSortChange={(v) => updateFilter('sort', v)}
 *   onClear={clearFilters}
 *   drawerId="filterDrawer"
 * />
 */
export default function FilterPanel({
  fields,
  values,
  onChange,
  sortValue,
  sortOptions,
  onSortChange,
  onClear,
  drawerId = 'filterDrawer',
}) {
  return (
    <>
      {/* Desktop — inline row, hidden below `lg` */}
      <div className="d-none d-lg-flex gap-2 flex-wrap mt-3">
        <FilterFields fields={fields} values={values} onChange={onChange} idPrefix="desk" />

        {sortOptions && (
          <select
            className="cx-select" style={{ maxWidth: 170 }} aria-label="Sort by"
            value={sortValue} onChange={(e) => onSortChange?.(e.target.value)}
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}

        {onClear && (
          <button type="button" className="cx-btn cx-btn-ghost" onClick={onClear}>Clear filters</button>
        )}
      </div>

      {/* Mobile — bottom-sheet offcanvas, triggered by a <SearchBar filterTarget={drawerId} /> elsewhere on the page */}
      <div
        className="offcanvas offcanvas-bottom cx-offcanvas-sidebar"
        tabIndex="-1" id={drawerId}
        style={{ height: 'auto', maxHeight: '80vh', borderRadius: '20px 20px 0 0' }}
      >
        <div className="offcanvas-header">
          <h3 className="cx-h3 mb-0">Filters</h3>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FilterFields fields={fields} values={values} onChange={onChange} idPrefix="mob" stacked />
            {sortOptions && (
              <select
                className="cx-select" aria-label="Sort by"
                value={sortValue} onChange={(e) => onSortChange?.(e.target.value)}
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>
          <div className="d-flex gap-2 mt-3">
            {onClear && (
              <button type="button" className="cx-btn cx-btn-outline" onClick={onClear} data-bs-dismiss="offcanvas">
                Clear
              </button>
            )}
            <button type="button" className="cx-btn cx-btn-primary cx-btn-block" data-bs-dismiss="offcanvas">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
