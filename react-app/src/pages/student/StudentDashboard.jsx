import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard/StatCard';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { ScoreRing } from '../../components/ScoreCard/ScoreCard';
import { SkeletonGrid, CardSkeleton } from '../../components/EmptyState/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [myProjects, setMyProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [mineRes, recentRes, wishlistRes] = await Promise.all([
          projectService.myProjects(),
          projectService.list({ sort: 'recent', limit: 4 }),
          projectService.wishlist.list(),
        ]);
        if (cancelled) return;

        const mine = mineRes.data.results ?? mineRes.data;
        const recent = recentRes.data.results ?? recentRes.data;
        const wishlist = wishlistRes.data.results ?? wishlistRes.data;

        setMyProjects(mine);
        setRecentProjects(recent);
        setWishlistCount(wishlist.length);
        setWishlistIds(new Set(wishlist.map((w) => w.project?.id ?? w.id)));

        if (mine[0]) {
          try {
            const fbRes = await projectService.feedback.listForProject(mine[0].id);
            const fb = (fbRes.data.results ?? fbRes.data)[0];
            if (!cancelled && fb) setLatestFeedback(fb);
          } catch {
            /* no feedback yet — leave latestFeedback null */
          }
        }
      } catch (err) {
        if (!cancelled) toast(err.message || 'Could not load your dashboard right now.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function toggleWishlist(projectId) {
    const isSaved = wishlistIds.has(projectId);
    try {
      if (isSaved) {
        await projectService.wishlist.remove(projectId);
        setWishlistIds((prev) => { const next = new Set(prev); next.delete(projectId); return next; });
        setWishlistCount((c) => c - 1);
        toast('Removed from wishlist.');
      } else {
        await projectService.wishlist.add(projectId);
        setWishlistIds((prev) => new Set(prev).add(projectId));
        setWishlistCount((c) => c + 1);
        toast('Saved to wishlist.');
      }
    } catch (err) {
      toast(err.message || 'Could not update your wishlist.', 'error');
    }
  }

  const avgInnovation = myProjects.length
    ? Math.round(myProjects.reduce((sum, p) => sum + (p.innovation ?? 0), 0) / myProjects.length)
    : 0;

  return (
    <>
      <div className="cx-hero p-4 p-lg-5 mb-4 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
        <div>
          <h1 className="cx-h1" style={{ marginBottom: 6 }}>
            Good to see you, {user?.name?.split(' ')[0] ?? 'there'}.
          </h1>
          <p className="cx-body mb-0">Here's how your project portfolio is shaping up this term.</p>
        </div>
        <Link to="/student/projects/add" className="cx-btn cx-btn-accent cx-btn-lg">
          <i className="bi bi-plus-lg"></i>Add Project
        </Link>
      </div>

      <div className="row g-3 mb-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div className="col-6 col-lg-3" key={i}><CardSkeleton /></div>
          ))
        ) : (
          <>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-folder2-open" value={myProjects.length} label="Total Projects" delta="+1 this month" direction="up" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-people" value={42} label="Projects This Batch" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-heart" value={wishlistCount} label="Wishlist Items" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-stars" value={`${avgInnovation}%`} label="Avg. Innovation Score" delta="+4% vs last term" direction="up" />
            </div>
          </>
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="cx-h2 mb-0">Recent Projects</h2>
            <Link to="/student/search" className="cx-link cx-small">Browse all</Link>
          </div>

          {loading ? (
            <SkeletonGrid count={4} cols="col-sm-6" />
          ) : recentProjects.length ? (
            <div className="row g-3">
              {recentProjects.map((p) => (
                <div className="col-sm-6" key={p.id}>
                  <ProjectCard
                    project={p}
                    inWishlist={wishlistIds.has(p.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="cx-empty">
              <div className="cx-empty-icon"><i className="bi bi-folder2-open"></i></div>
              <h3 className="cx-h3">No projects yet</h3>
              <p className="cx-small mb-3">Be the first to explore what's on CreateX, or add your own project.</p>
              <Link to="/student/projects/add" className="cx-btn cx-btn-primary">Add Project</Link>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="cx-glass p-4 mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-stars" style={{ color: 'var(--c-accent)' }}></i>
              <span className="cx-label mb-0">Latest Faculty Feedback</span>
            </div>
            {loading ? (
              <div className="cx-skel" style={{ height: 60, width: '100%' }} />
            ) : latestFeedback ? (
              <>
                <p className="cx-small mb-2">&ldquo;{latestFeedback.feedback}&rdquo;</p>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="cx-caption">{latestFeedback.faculty_name ?? latestFeedback.faculty}</span>
                  <span className="cx-caption">{latestFeedback.date}</span>
                </div>
              </>
            ) : (
              <p className="cx-small mb-0">No feedback yet — submit a project to get faculty input.</p>
            )}
          </div>

          <div className="cx-card p-4">
            <div className="cx-label mb-3">Innovation Snapshot</div>
            {loading ? (
              <div className="cx-skel" style={{ height: 84, width: 84, borderRadius: '50%' }} />
            ) : (
              <div className="d-flex align-items-center gap-4">
                <ScoreRing value={avgInnovation} size={84} stroke={8} />
                <p className="cx-small mb-0">
                  Your average Innovation Score across all submitted projects. Try the{' '}
                  <Link to="/student/assistant" className="cx-link">Innovation Assistant</Link> to push it higher.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
