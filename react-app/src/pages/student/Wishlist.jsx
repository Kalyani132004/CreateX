import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

export default function Wishlist() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // project objects
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await projectService.wishlist.list();
        const data = res.data.results ?? res.data;
        // Wishlist entries may wrap the project (e.g. { id, project: {...} }) or be the project itself.
        const projects = data.map((entry) => entry.project ?? entry);
        if (!cancelled) setItems(projects);
      } catch (err) {
        if (!cancelled) toast(err.message || 'Could not load your wishlist right now.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function removeFromWishlist(projectId) {
    const prev = items;
    setItems((current) => current.filter((p) => p.id !== projectId)); // optimistic
    try {
      await projectService.wishlist.remove(projectId);
      toast('Removed from wishlist.');
    } catch (err) {
      setItems(prev); // revert on failure
      toast(err.message || 'Could not remove this project.', 'error');
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">Wishlist</h1>
        <p className="cx-body mb-0">Projects you've saved to revisit later.</p>
      </div>

      {loading ? (
        <SkeletonGrid count={6} cols="col-sm-6 col-xl-4" />
      ) : items.length ? (
        <div className="row g-3">
          {items.map((p) => (
            <div className="col-sm-6 col-xl-4" key={p.id}>
              <ProjectCard
                project={p}
                inWishlist
                onToggleWishlist={removeFromWishlist}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="cx-empty">
          <div className="cx-empty-icon"><i className="bi bi-heart"></i></div>
          <h3 className="cx-h3">Your wishlist is empty</h3>
          <p className="cx-small mb-3">Save projects you find inspiring while exploring CreateX.</p>
          <Link to="/student/search" className="cx-btn cx-btn-primary">Explore Projects</Link>
        </div>
      )}
    </>
  );
}
