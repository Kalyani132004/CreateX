import React, { useCallback, useEffect, useRef, useState } from 'react';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

const DOMAINS = [
  'Web Development', 'Mobile Application', 'Data Science', 'AI / ML',
  'Cyber Security', 'IoT', 'Cloud Computing', 'Software Development',
];
const COURSES = ['MCA', 'BCA', 'BE', 'BTECH'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2025', '2023-2026'];
const TECH_OPTIONS = [
  'React', 'Django', 'Node.js', 'Python', 'Flutter', 'TensorFlow',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker',
];

const EMPTY_FILTERS = { q: '', domain: '', technology: '', course: '', batch: '', sort: 'relevant' };

function FilterFields({ values, onChange, idPrefix }) {
  return (
    <>
      <select
        className="cx-select" style={{ maxWidth: 170 }} aria-label="Domain"
        id={`${idPrefix}Domain`} value={values.domain} onChange={(e) => onChange('domain', e.target.value)}
      >
        <option value="">All Domains</option>
        {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select
        className="cx-select" style={{ maxWidth: 170 }} aria-label="Technology"
        id={`${idPrefix}Tech`} value={values.technology} onChange={(e) => onChange('technology', e.target.value)}
      >
        <option value="">All Technologies</option>
        {TECH_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select
        className="cx-select" style={{ maxWidth: 170 }} aria-label="Course"
        id={`${idPrefix}Course`} value={values.course} onChange={(e) => onChange('course', e.target.value)}
      >
        <option value="">All Courses</option>
        {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        className="cx-select" style={{ maxWidth: 170 }} aria-label="Batch"
        id={`${idPrefix}Batch`} value={values.batch} onChange={(e) => onChange('batch', e.target.value)}
      >
        <option value="">All Batches</option>
        {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
    </>
  );
}

export default function SearchProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isFaculty = user?.role === 'faculty';

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const debounceRef = useRef(null);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const runSearch = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const res = await projectService.list({
        q: activeFilters.q || undefined,
        domain: activeFilters.domain || undefined,
        technology: activeFilters.technology || undefined,
        course: activeFilters.course || undefined,
        batch: activeFilters.batch || undefined,
        sort: activeFilters.sort,
      });
      const data = res.data.results ?? res.data;
      setResults(data);
      setTotal(res.data.count ?? data.length);
    } catch (err) {
      toast(err.message || 'Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Debounced search-as-you-type on the query field; immediate on filter/sort change.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(filters), 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.domain, filters.technology, filters.course, filters.batch, filters.sort]);

  useEffect(() => {
    if (isFaculty) return;
    projectService.wishlist.list()
      .then((res) => {
        const wishlist = res.data.results ?? res.data;
        setWishlistIds(new Set(wishlist.map((w) => w.project?.id ?? w.id)));
      })
      .catch(() => {});
  }, [isFaculty]);

  async function toggleWishlist(projectId) {
    const isSaved = wishlistIds.has(projectId);
    try {
      if (isSaved) {
        await projectService.wishlist.remove(projectId);
        setWishlistIds((prev) => { const next = new Set(prev); next.delete(projectId); return next; });
        toast('Removed from wishlist.');
      } else {
        await projectService.wishlist.add(projectId);
        setWishlistIds((prev) => new Set(prev).add(projectId));
        toast('Saved to wishlist.');
      }
    } catch (err) {
      toast(err.message || 'Could not update your wishlist.', 'error');
    }
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">{isFaculty ? 'Search Projects' : 'Explore Projects'}</h1>
        <p className="cx-body mb-0">Discover what students across CreateX are building.</p>
      </div>

      <div className="cx-card p-3 p-lg-4 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <div className="cx-search-mini flex-grow-1" style={{ maxWidth: 'none', background: 'var(--c-bg-alt)' }} role="search">
            <i className="bi bi-search"></i>
            <input
              type="text" placeholder="Search projects, technologies, ideas..."
              value={filters.q} onChange={(e) => updateFilter('q', e.target.value)}
            />
          </div>
          <button className="cx-btn cx-btn-outline d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#filterDrawer">
            <i className="bi bi-sliders"></i>Filters
          </button>
          <button className="cx-btn cx-btn-primary" onClick={() => runSearch(filters)}>
            <i className="bi bi-search"></i>Search
          </button>
        </div>

        <div className="d-none d-lg-flex gap-2 flex-wrap mt-3">
          <FilterFields values={filters} onChange={updateFilter} idPrefix="desk" />
          <select
            className="cx-select" style={{ maxWidth: 170 }}
            value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="relevant">Most Relevant</option>
            <option value="innovation">Highest Innovation</option>
            <option value="recent">Most Recent</option>
          </select>
          <button className="cx-btn cx-btn-ghost" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>

      <div className="offcanvas offcanvas-bottom cx-offcanvas-sidebar" tabIndex="-1" id="filterDrawer" style={{ height: 'auto', maxHeight: '80vh', borderRadius: '20px 20px 0 0' }}>
        <div className="offcanvas-header">
          <h3 className="cx-h3 mb-0">Filters</h3>
          <button className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="cx-field" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FilterFields values={filters} onChange={updateFilter} idPrefix="mob" />
          </div>
          <button className="cx-btn cx-btn-primary cx-btn-block" data-bs-dismiss="offcanvas">Apply Filters</button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="cx-small">
          {loading ? 'Searching…' : `${total} project${total !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {loading ? (
        <SkeletonGrid count={6} cols="col-sm-6 col-xl-4" />
      ) : results.length ? (
        <div className="row g-3">
          {results.map((p) => (
            <div className="col-sm-6 col-xl-4" key={p.id}>
              <ProjectCard
                project={p}
                hideWishlist={isFaculty}
                inWishlist={wishlistIds.has(p.id)}
                onToggleWishlist={toggleWishlist}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="cx-empty">
          <div className="cx-empty-icon"><i className="bi bi-search"></i></div>
          <h3 className="cx-h3">No projects found</h3>
          <p className="cx-small mb-3">Try adjusting your filters or searching a different keyword.</p>
          <button className="cx-btn cx-btn-outline" onClick={clearFilters}>Clear all filters</button>
        </div>
      )}
    </>
  );
}
