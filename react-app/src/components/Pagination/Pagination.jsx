import React from 'react';

/**
 * Numbered pagination control. Pairs directly with the `usePagination` hook
 * — pass its return value straight through.
 *
 * @example
 * const pagination = usePagination({ totalItems: total, pageSize: 12 });
 *
 * useEffect(() => {
 *   projectService.list({ page: pagination.page, page_size: pagination.pageSize })
 *     .then((res) => setResults(res.data.results));
 * }, [pagination.page]);
 *
 * <Pagination {...pagination} />
 */
export default function Pagination({
  page,
  totalPages,
  pageNumbers,
  canPrev,
  canNext,
  setPage,
  nextPage,
  prevPage,
}) {
  // Nothing to paginate — render nothing rather than a single disabled row.
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="d-flex justify-content-center">
      <ul className="d-flex align-items-center gap-1 list-unstyled mb-0">
        <li>
          <button
            type="button"
            className="cx-btn cx-btn-ghost cx-btn-sm"
            onClick={prevPage}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
        </li>

        {pageNumbers.map((n, i) =>
          n === '…' ? (
            <li key={`ellipsis-${i}`} className="px-1">
              <span className="cx-caption" aria-hidden="true">…</span>
            </li>
          ) : (
            <li key={n}>
              <button
                type="button"
                className={`cx-btn cx-btn-sm ${n === page ? 'cx-btn-primary' : 'cx-btn-ghost'}`}
                style={{ minWidth: 34, padding: '6px 10px' }}
                onClick={() => setPage(n)}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
              >
                {n}
              </button>
            </li>
          )
        )}

        <li>
          <button
            type="button"
            className="cx-btn cx-btn-ghost cx-btn-sm"
            onClick={nextPage}
            disabled={!canNext}
            aria-label="Next page"
          >
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}
