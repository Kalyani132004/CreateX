import { useEffect, useMemo, useState } from 'react';

/**
 * Manages page state for a paginated list — works whether pagination happens
 * server-side (pass `totalItems` from the API's count) or client-side
 * (pass the full array's length). Doesn't fetch anything itself; pair it
 * with a service call that takes `page`/`pageSize`, e.g.:
 *
 * @example
 * const pagination = usePagination({ totalItems: total, pageSize: 12 });
 * useEffect(() => {
 *   projectService.list({ page: pagination.page, page_size: pagination.pageSize })
 *     .then((res) => setResults(res.data.results));
 * }, [pagination.page]);
 *
 * @example // client-side slicing of an already-fetched array
 * const pagination = usePagination({ totalItems: allProjects.length, pageSize: 9 });
 * const visible = allProjects.slice(pagination.startIndex, pagination.endIndex);
 */
export function usePagination({ totalItems = 0, pageSize = 10, initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp back onto a valid page if the result set shrinks (e.g. after a filter change or a delete).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function goToPage(n) {
    setPage(Math.min(Math.max(1, n), totalPages));
  }
  function nextPage() {
    if (canNext) setPage((p) => p + 1);
  }
  function prevPage() {
    if (canPrev) setPage((p) => p - 1);
  }
  function reset() {
    setPage(1);
  }

  // A compact page-number list for rendering, e.g. [1, 2, 3, '…', 10].
  const pageNumbers = useMemo(() => {
    const delta = 1; // neighbors shown on each side of the current page
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '…') {
        range.push('…');
      }
    }
    return range;
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    canPrev,
    canNext,
    pageNumbers,
    setPage: goToPage,
    nextPage,
    prevPage,
    reset,
  };
}

export default usePagination;
