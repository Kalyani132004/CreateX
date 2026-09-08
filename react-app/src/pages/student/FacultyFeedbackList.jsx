import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Rating, Badge } from '../../components/Badge/Badge';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
//function
export default function FacultyFeedbackList() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const projectsRes = await projectService.myProjects();
        const projects = projectsRes.data.results ?? projectsRes.data;

        // Faculty feedback lives per-project; gather it across every project the student owns.
        const perProject = await Promise.all(
          projects.map((p) =>
            projectService.feedback.listForProject(p.id)
              .then((res) => (res.data.results ?? res.data).map((f) => ({ ...f, projectTitle: p.title, projectId: p.id })))
              .catch(() => [])
          )
        );

        const flattened = perProject.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        if (!cancelled) setFeedback(flattened);
      } catch (err) {
        if (!cancelled) toast(err.message || 'Could not load your feedback right now.', 'error');
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
        <h1 className="cx-h1 mb-1">Faculty Feedback</h1>
        <p className="cx-body mb-0">Reviews and recommendations from faculty on your projects.</p>
      </div>

      {loading ? (
        <SkeletonGrid count={3} cols="col-12" />
      ) : feedback.length ? (
        <div className="d-flex flex-column gap-3">
          {feedback.map((f) => (
            <div className="cx-card p-4" key={f.id ?? `${f.projectId}-${f.date}`}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <Avatar name={f.faculty_name ?? f.faculty} size={42} />
                  <div>
                    <div className="cx-h3" style={{ marginBottom: 2 }}>{f.faculty_name ?? f.faculty}</div>
                    <div className="cx-caption">
                      on <Link to={`/project/${f.projectId}`} className="cx-link">{f.projectTitle}</Link> &middot; {f.date}
                    </div>
                  </div>
                </div>
                <Rating value={f.rating} readOnly />
              </div>
              <p className="cx-small mb-2">{f.feedback}</p>
              {f.recommendation && (
                <Badge variant="success" icon="bi-award">{f.recommendation}</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="cx-empty">
          <div className="cx-empty-icon"><i className="bi bi-chat-square-text"></i></div>
          <h3 className="cx-h3">No feedback yet</h3>
          <p className="cx-small mb-3">Once faculty review your projects, their feedback and recommendations will appear here.</p>
          <Link to="/student/projects" className="cx-btn cx-btn-primary">View My Projects</Link>
        </div>
      )}
    </>
  );
}
