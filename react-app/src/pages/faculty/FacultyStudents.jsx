import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/Badge/Badge';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { projectService } from '../../services/projectService';

function scoreColor(v) {
  if (v == null) return 'var(--c-muted)';
  return v >= 75 ? 'var(--c-success)' : v >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';
}

function RowSkeleton() {
  return (
    <tr>
      <td className="ps-4"><div className="cx-skel" style={{ height: 36, width: '70%' }} /></td>
      <td><div className="cx-skel" style={{ height: 14, width: 50 }} /></td>
      <td><div className="cx-skel" style={{ height: 14, width: 80 }} /></td>
      <td><div className="cx-skel" style={{ height: 14, width: 30 }} /></td>
      <td><div className="cx-skel" style={{ height: 20, width: 44 }} /></td>
      <td className="pe-4"></td>
    </tr>
  );
}

export default function FacultyStudents() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const { toast } = useToast();

    useEffect(() => {
      async function load() {
        setLoading(true);
        try {
          // 1. all students from auth-service
          const res = await api.get('/auth/student/list/');
          const list = res.data.results ?? res.data;

          // 2. project count + avg innovation from project-service
          let stats = [];
          try {
            const statsRes = await projectService.studentStats();
            stats = statsRes.data;
          } catch (err) {
            console.log('Student stats error:', err);
          }

          // 3. join both lists using the student id
          const merged = list.map((s) => {
            const st = stats.find((x) => x.owner_id === s.id);
            return {
              ...s,
              project_count: st ? st.project_count : 0,
              avg_innovation: st ? st.avg_innovation : null,
            };
          });

          setStudents(merged);
        } catch (err) {
          toast(err.message || 'Could not load students right now.', 'error');
        }
        setLoading(false);
      }

      load();
    }, []);

  return (
    <>
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">Students</h1>
        <p className="cx-body mb-0">
          {loading ? 'Loading…' : `${students.length} student${students.length !== 1 ? 's' : ''} in your department`}
        </p>
      </div>

      <div className="cx-card" style={{ overflow: 'hidden' }}>
        {/* Desktop table */}
        <div className="table-responsive d-none d-md-block">
          <table className="table mb-0 align-middle">
            <thead>
              <tr className="cx-caption">
                <th className="ps-4">Student</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Projects</th>
                <th>Avg. Innovation</th>
                <th className="pe-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => <RowSkeleton key={i} />)
              ) : students.length ? (
                students.map((s) => (
                  <tr key={s.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={s.name} size={32} />
                        <div>
                          <div className="cx-small mb-0" style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{s.name}</div>
                          <div className="cx-caption">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cx-small">{s.course}</td>
                    <td className="cx-small">{s.batch}</td>
                    <td className="cx-small">{s.project_count}</td>
                    <td><span className="cx-badge" style={{ color: scoreColor(s.avg_innovation) }}>{s.avg_innovation != null ? `${s.avg_innovation}%` : '—'}</span></td>
                    <td className="pe-4 text-end">
                      <Link to={`/faculty/students/${s.id}`} className="cx-btn cx-btn-outline cx-btn-sm">View Profile</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-center py-5">
                  <div className="cx-empty">
                    <div className="cx-empty-icon"><i className="bi bi-people"></i></div>
                    <h3 className="cx-h3">No students found</h3>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="d-md-none p-3 d-flex flex-column gap-2">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => <div className="cx-skel" style={{ height: 76 }} key={i} />)
          ) : students.length ? (
            students.map((s) => (
              <div className="cx-card p-3" key={s.id}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Avatar name={s.name} size={36} />
                  <div>
                    <div className="cx-small mb-0" style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{s.name}</div>
                    <div className="cx-caption">{s.course} &middot; {s.batch}</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="cx-caption">
                    {s.project_count} projects &middot; Avg {s.avg_innovation != null ? `${s.avg_innovation}%` : '—'}
                  </span>
                  <Link to={`/faculty/students/${s.id}`} className="cx-btn cx-btn-outline cx-btn-sm">View</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="cx-empty">
              <div className="cx-empty-icon"><i className="bi bi-people"></i></div>
              <h3 className="cx-h3">No students found</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
