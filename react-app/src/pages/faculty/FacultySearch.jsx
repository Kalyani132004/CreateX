import React, { useEffect, useState } from 'react';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

const domains = [
  'Web Development', 'Mobile Application', 'Data Science', 'AI / ML',
  'Cyber Security', 'IoT', 'Cloud Computing', 'Software Development',
];
const technologies = [
  'React', 'Django', 'Node.js', 'Python', 'Flutter', 'TensorFlow',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker',
];
const courses = ['MCA', 'BCA', 'BE', 'BTECH'];
const batches = ['2021-2025', '2022-2026', '2023-2025', '2023-2026'];

export default function FacultySearch() {
  const { toast } = useToast();

  // text typed in the box, and the text that is actually searched
  const [searchText, setSearchText] = useState('');
  const [q, setQ] = useState('');

  const [domain, setDomain] = useState('');
  const [technology, setTechnology] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [sort, setSort] = useState('relevant');

  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function getProjects() {
    setLoading(true);
    try {
      // only send the filters that are selected
      const params = { sort: sort };
      if (q) params.q = q;
      if (domain) params.domain = domain;
      if (technology) params.technology = technology;
      if (course) params.course = course;
      if (batch) params.batch = batch;

      const res = await projectService.list(params);
      const data = res.data.results ?? res.data;
      setProjects(data);
      setTotal(res.data.count ?? data.length);
    } catch (err) {
      toast(err.message || 'Could not load projects', 'error');
    } finally {
      setLoading(false);
    }
  }

  // runs on first load and every time a filter or the search text changes
  useEffect(() => {
    getProjects();
  }, [q, domain, technology, course, batch, sort]);

  function handleSearch() {
    setQ(searchText);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function clearFilters() {
    setSearchText('');
    setQ('');
    setDomain('');
    setTechnology('');
    setCourse('');
    setBatch('');
    setSort('relevant');
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">Search Projects</h1>
        <p className="cx-body mb-0">Discover what students across CreateX are building.</p>
      </div>

      <div className="cx-card p-3 p-lg-4 mb-4">
        {/* search box */}
        <div className="d-flex gap-2 flex-wrap">
          <div className="cx-search-mini flex-grow-1" style={{ maxWidth: 'none' }}>
            <i className="bi bi-search"></i>
            <input
                type="text"
                placeholder="Search projects, technologies, ideas..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
                />
          </div>
          <button className="cx-btn cx-btn-primary" onClick={handleSearch}>
            <i className="bi bi-search"></i>Search
          </button>
        </div>

        {/* filters */}
        <div className="d-flex gap-2 flex-wrap mt-3">
          <select className="cx-select" style={{ maxWidth: 170 }} value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select className="cx-select" style={{ maxWidth: 170 }} value={technology} onChange={(e) => setTechnology(e.target.value)}>
            <option value="">All Technologies</option>
            {technologies.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select className="cx-select" style={{ maxWidth: 170 }} value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select className="cx-select" style={{ maxWidth: 170 }} value={batch} onChange={(e) => setBatch(e.target.value)}>
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select className="cx-select" style={{ maxWidth: 170 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevant">Most Relevant</option>
            <option value="innovation">Highest Innovation</option>
            <option value="recent">Most Recent</option>
          </select>

          <button className="cx-btn cx-btn-ghost" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </div>

      {/* result count */}
      <p className="cx-small mb-3">
        {loading ? 'Searching...' : total + ' project' + (total !== 1 ? 's' : '') + ' found'}
      </p>

      {/* results */}
      {loading ? (
        <SkeletonGrid count={6} cols="col-sm-6 col-xl-4" />
      ) : projects.length > 0 ? (
        <div className="row g-3">
          {projects.map((p) => (
            <div className="col-sm-6 col-xl-4" key={p.id}>
              <ProjectCard project={p} hideWishlist />
            </div>
          ))}
        </div>
      ) : (
        <div className="cx-empty">
          <div className="cx-empty-icon"><i className="bi bi-search"></i></div>
          <h3 className="cx-h3">No projects found</h3>
          <p className="cx-small mb-3">Try changing your filters or searching a different keyword.</p>
          <button className="cx-btn cx-btn-outline" onClick={clearFilters}>Clear all filters</button>
        </div>
      )}
    </>
  );
}