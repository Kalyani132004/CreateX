import { useEffect, useState } from 'react';

/**
 * Tracks whether a CSS media query currently matches, updating on resize.
 * Use for JS-level breakpoint logic (e.g. deciding whether to render a
 * table or a card list) — CSS/Bootstrap classes should still handle pure
 * layout switches; reach for this only when a component needs to know
 * the breakpoint to change its behavior, not just its styling.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * return isMobile ? <CardList /> : <Table />;
 */
export function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false;
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = () => setMatches(mql.matches);

    handleChange(); // sync in case the query string itself changed
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// Convenience presets matching the design system's breakpoints (design-system.css / Bootstrap 5 defaults).
export const BREAKPOINTS = {
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1400px)',
};

export default useMediaQuery;
