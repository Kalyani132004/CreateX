import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard/StatCard';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { CardSkeleton, SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
import api from '../../services/api';

// Projects that need a closer look
const NEEDS_REVIEW_SIMILARITY = 50;
const NEEDS_REVIEW_INNOVATION = 70;

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [needsReview, setNeedsReview] = useState([]);

  // backend sends full_name, so check that first
  const facultyName = user?.full_name || user?.name || '';

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      // 1. projects
      try {
        const res = await projectService.list({ sort: 'recent' });
        const allProjects = res.data.results ?? res.data;

        setRecentProjects(allProjects.slice(0, 4));

        const reviewList = allProjects.filter(
          (p) =>
            p.similarity > NEEDS_REVIEW_SIMILARITY ||
            p.innovation < NEEDS_REVIEW_INNOVATION
        );
        setNeedsReview(reviewList.slice(0, 4));
      } catch (err) {
        toast(err.message || 'Could not load projects.', 'error');
      }

      // 2. stats (separate try, so projects still show if this fails)
      try {
        const res = await projectService.facultyStats();
        setStats(res.data);
      } catch (err) {
        console.log('Dashboard stats error:', err);
      }

      // 3. total students (same list the Students page uses)
      try {
        const res = await api.get('/auth/student/list/');
        const list = res.data.results ?? res.data;
        setStudentCount(list.length);
      } catch (err) {
        console.log('Student count error:', err);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  return (
    <>
      <div className="cx-hero p-4 p-lg-5 mb-4">
        <h1 className="cx-h1 mb-1">Welcome back, {facultyName}.</h1>
        <p className="cx-body mb-0">{user?.department ?? user?.dept}</p>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <CardSkeleton />
            </div>
          ))
        ) : (
          <>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-eye" value={stats?.projects_reviewed ?? 0} label="Projects Reviewed" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-people" value={studentCount} label="Students" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-chat-square-text" value={stats?.feedback_given ?? 0} label="Feedback Given" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-award" value={stats?.recommendations_given ?? 0} label="Recommendations Given" />
            </div>
          </>
        )}
      </div>

      <div className="row g-4">
        {/* Recent projects */}
        <div className="col-lg-7">
          <h2 className="cx-h2 mb-3">Recent Projects</h2>

          {loading ? (
            <SkeletonGrid count={4} cols="col-sm-6" />
          ) : recentProjects.length > 0 ? (
            <div className="row g-3">
              {recentProjects.map((p) => (
                <div className="col-sm-6" key={p.id}>
                  <ProjectCard project={p} hideWishlist />
                </div>
              ))}
            </div>
          ) : (
            <div className="cx-empty">
              <div className="cx-empty-icon"><i className="bi bi-folder2-open"></i></div>
              <h3 className="cx-h3">No projects yet</h3>
              <p className="cx-small mb-0">Recently submitted projects will appear here.</p>
            </div>
          )}
        </div>

        {/* Projects requiring review */}
        <div className="col-lg-5">
          <h2 className="cx-h2 mb-3">Projects Requiring Review</h2>

          {loading ? (
            <div className="d-flex flex-column gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div className="cx-skel" style={{ height: 64 }} key={i} />
              ))}
            </div>
          ) : needsReview.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {needsReview.map((p) => (
                <Link
                  to={`/faculty/projects/view/${p.id}`}
                  key={p.id}
                  className="cx-card cx-hover p-3 d-flex align-items-center gap-3 text-decoration-none"
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--c-warning-soft)',
                      color: 'var(--c-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <i className="bi bi-flag"></i>
                  </div>

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div
                      className="cx-small text-truncate mb-0"
                      style={{ fontWeight: 650, color: 'var(--c-ink)' }}
                    >
                      {p.title}
                    </div>
                    <div className="cx-caption">
                      {p.owner_name} &middot; Similarity {p.similarity}%
                    </div>
                  </div>

                  <i className="bi bi-chevron-right" style={{ color: 'var(--c-muted)' }}></i>
                </Link>
              ))}
            </div>
          ) : (
            <div className="cx-empty">
              <div className="cx-empty-icon"><i className="bi bi-check2-circle"></i></div>
              <h3 className="cx-h3">All caught up</h3>
              <p className="cx-small mb-0">No projects currently need a closer look.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}