import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

export default function MyProjects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await projectService.myProjects();
        if (!cancelled) setProjects(res.data.results ?? res.data);
      } catch (err) {
        if (!cancelled) toast(err.message || 'Could not load your projects right now.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [toast]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="cx-h1 mb-1">My Projects</h1>
          <p className="cx-body mb-0">
            {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''} submitted`}
          </p>
        </div>
        <Link to="/student/projects/add" className="cx-btn cx-btn-primary">
          <i className="bi bi-plus-lg"></i>Add Project
        </Link>
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
          <h3 className="cx-h3">You haven't submitted any projects yet</h3>
          <p className="cx-small mb-3">Share your work with the CreateX community and get an instant Innovation Score.</p>
          <Link to="/student/projects/add" className="cx-btn cx-btn-primary">Add Your First Project</Link>
        </div>
      )}
    </>
  );
}
