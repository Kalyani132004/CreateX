import React, { useEffect, useState } from 'react';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

export default function FacultyProjects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await projectService.list({ sort: 'recent' });
        const data = res.data.results ?? res.data;
        if (!cancelled) {
          setProjects(data);
          setTotal(res.data.count ?? data.length);
        }
      } catch (err) {
        if (!cancelled) toast(err.message || 'Could not load projects right now.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [toast]);

  return (
    <>
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">All Projects</h1>
        <p className="cx-body mb-0">
          {loading ? 'Loading…' : `${total} project${total !== 1 ? 's' : ''} across all courses and batches`}
        </p>
      </div>

      {loading ? (
        <SkeletonGrid count={6} cols="col-sm-6 col-xl-4" />
      ) : projects.length ? (
        <div className="row g-3">
          {projects.map((p) => (
            <div className="col-sm-6 col-xl-4" key={p.id}>
              <ProjectCard project={p} hideWishlist />
            </div>
          ))}
        </div>
      ) : (
        <div className="cx-empty">
          <div className="cx-empty-icon"><i className="bi bi-folder2-open"></i></div>
          <h3 className="cx-h3">No projects submitted yet</h3>
          <p className="cx-small mb-0">Student submissions will appear here as they come in.</p>
        </div>
      )}
    </>
  );
}
