import React, { useMemo, useState } from 'react';

/**
 * Chip-based multi-select. Value is a Set<string> so toggling is O(1) and
 * order doesn't matter for callers — convert with `[...value]` when you
 * need an array (e.g. building FormData).
 *
 * Shows an inline filter box automatically once `options` is long enough
 * that scanning it as a flat chip grid gets unwieldy (`searchThreshold`,
 * default 10). Selected chips stay pinned in their own row above the
 * filterable list so a pick is never hidden behind an active filter.
 *
 * @example
 * const [techs, setTechs] = useState(new Set());
 * <TechMultiSelect
 *   label="Technologies Used" required
 *   options={TECH_OPTIONS}
 *   value={techs}
 *   onChange={setTechs}
 * />
 */
export default function TechMultiSelect({
  label,
  hint,
  options,
  value,
  onChange,
  required = false,
  searchThreshold = 10,
  searchPlaceholder = 'Filter technologies...',
}) {
  const [query, setQuery] = useState('');
  const showSearch = options.length > searchThreshold;

  const selected = useMemo(() => options.filter((o) => value.has(o)), [options, value]);
  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !value.has(o) && (!q || o.toLowerCase().includes(q)));
  }, [options, value, query]);

  function toggle(option) {
    const next = new Set(value);
    next.has(option) ? next.delete(option) : next.add(option);
    onChange(next);
  }

  function Chip({ option, active }) {
    return (
      <span
        key={option}
        className={`cx-chip ${active ? 'active' : ''}`}
        role="button" tabIndex={0}
        aria-pressed={active}
        onClick={() => toggle(option)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(option); } }}
      >
        {active && <i className="bi bi-check-lg" style={{ fontSize: '0.75rem' }} aria-hidden="true"></i>}
        {option}
      </span>
    );
  }

  return (
    <div>
      {label && (
        <label className="cx-label d-block mb-2">
          {label} {required && <span className="req">*</span>}
        </label>
      )}

      {selected.length > 0 && (
        <div className="tech-multiselect mb-2">
          {selected.map((o) => <Chip key={o} option={o} active />)}
        </div>
      )}

      {showSearch && (
        <input
          type="text"
          className="cx-input mb-2"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={searchPlaceholder}
        />
      )}

      <div className="tech-multiselect">
        {available.length ? (
          available.map((o) => <Chip key={o} option={o} active={false} />)
        ) : (
          <span className="cx-caption">No matching technologies.</span>
        )}
      </div>

      <div className="cx-hint">
        {hint ?? `Selected: ${selected.length} technolog${selected.length === 1 ? 'y' : 'ies'}`}
      </div>
    </div>
  );
}
