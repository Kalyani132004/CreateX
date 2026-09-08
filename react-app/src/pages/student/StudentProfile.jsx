import React, { useEffect, useState } from 'react';
import { Modal } from 'bootstrap';
import { Avatar } from '../../components/Badge/Badge';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';
import api from '../../services/api';

const SOCIAL_FIELDS = [
  { key: 'github', icon: 'bi-github', label: 'GitHub' },
  { key: 'linkedin', icon: 'bi-linkedin', label: 'LinkedIn' },
  { key: 'leetcode', icon: 'bi-code-square', label: 'LeetCode' },
  { key: 'gfg', icon: 'bi-braces', label: 'GeeksForGeeks' },
];

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [editForm, setEditForm] = useState({ bio: '', github: '', linkedin: '', leetcode: '', gfg: '' });
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        bio: user.bio ?? '',
        github: user.github ?? '',
        linkedin: user.linkedin ?? '',
        leetcode: user.leetcode ?? '',
        gfg: user.gfg ?? '',
      });
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    projectService.myProjects()
      .then((res) => { if (!cancelled) setProjects(res.data.results ?? res.data); })
      .catch((err) => { if (!cancelled) toast(err.message || 'Could not load your projects.', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/auth/profile/', editForm);
      setUser?.((prev) => ({ ...prev, ...res.data }));
      Modal.getOrCreateInstance(document.getElementById('editProfileModal')).hide();
      toast('Profile updated successfully.');
    } catch (err) {
      toast(err.message || 'Could not update your profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwdForm.next.length < 8 || pwdForm.next !== pwdForm.confirm) {
      toast('Check your new password fields before continuing.', 'error');
      return;
    }
    setSavingPwd(true);
    try {
      await authService.changePassword({
        current_password: pwdForm.current,
        new_password: pwdForm.next,
      });
      Modal.getOrCreateInstance(document.getElementById('changePwdModal')).hide();
      setPwdForm({ current: '', next: '', confirm: '' });
      toast('Password updated successfully.');
    } catch (err) {
      toast(err.message || 'Could not update your password.', 'error');
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <>
      <div className="cx-hero p-4 p-lg-5 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          <Avatar name={user?.name ?? ''} size={84} />
          <div className="flex-grow-1">
            <h1 className="cx-h1 mb-1">{user?.name}</h1>
            <p className="cx-small mb-2">{user?.course} &middot; Batch {user?.batch} &middot; {user?.uid}</p>
            <p className="cx-body mb-0" style={{ maxWidth: 520 }}>{user?.bio || 'No bio added yet.'}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="cx-btn cx-btn-primary" data-bs-toggle="modal" data-bs-target="#editProfileModal">Edit Profile</button>
            <button className="cx-btn cx-btn-outline" data-bs-toggle="modal" data-bs-target="#changePwdModal">Change Password</button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="cx-card p-4 mb-4">
            <h3 className="cx-h3 mb-3">Projects ({loading ? '…' : projects.length})</h3>
            {loading ? (
              <SkeletonGrid count={2} cols="col-sm-6" />
            ) : projects.length ? (
              <div className="row g-3">
                {projects.map((p) => (
                  <div className="col-sm-6" key={p.id}>
                    <ProjectCard project={p} hideWishlist />
                  </div>
                ))}
              </div>
            ) : (
              <p className="cx-small mb-0">No projects submitted yet.</p>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="cx-card p-4 mb-3">
            <h3 className="cx-h3 mb-3">Skills</h3>
            <div className="cx-tech-row">
              {(user?.skills ?? []).length
                ? user.skills.map((s) => <span className="cx-badge cx-badge-primary" key={s}>{s}</span>)
                : <p className="cx-small mb-0">No skills added yet.</p>}
            </div>
          </div>
          <div className="cx-card p-4">
            <h3 className="cx-h3 mb-3">Social Links</h3>
            {SOCIAL_FIELDS.map(({ key, icon, label }) => (
              <div className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--c-border-soft)' }} key={key}>
                <i className={`bi ${icon}`} style={{ color: 'var(--c-ink-soft)' }} aria-hidden="true"></i>
                <span className="cx-small mb-0">{user?.[key] || `${label} not linked`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile modal */}
      <div className="modal fade" id="editProfileModal" tabIndex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border-soft)' }}>
            <form onSubmit={handleSaveProfile}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--c-border-soft)' }}>
                <h3 className="cx-h3 mb-0" id="editProfileModalLabel">Edit Profile</h3>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="cx-field">
                  <label htmlFor="bio">Bio</label>
                  <textarea id="bio" className="cx-input" rows={3} value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} />
                </div>
                <div className="cx-field">
                  <label htmlFor="github">GitHub</label>
                  <input id="github" className="cx-input" value={editForm.github} onChange={(e) => setEditForm((f) => ({ ...f, github: e.target.value }))} />
                </div>
                <div className="cx-field">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <input id="linkedin" className="cx-input" value={editForm.linkedin} onChange={(e) => setEditForm((f) => ({ ...f, linkedin: e.target.value }))} />
                </div>
                <div className="cx-field mb-0">
                  <label htmlFor="leetcode">LeetCode</label>
                  <input id="leetcode" className="cx-input" value={editForm.leetcode} onChange={(e) => setEditForm((f) => ({ ...f, leetcode: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--c-border-soft)' }}>
                <button type="button" className="cx-btn cx-btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="cx-btn cx-btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Change Password modal */}
      <div className="modal fade" id="changePwdModal" tabIndex="-1" aria-labelledby="changePwdModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border-soft)' }}>
            <form onSubmit={handleChangePassword}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--c-border-soft)' }}>
                <h3 className="cx-h3 mb-0" id="changePwdModalLabel">Change Password</h3>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="cx-field">
                  <label htmlFor="currentPwd">Current Password</label>
                  <input id="currentPwd" type="password" className="cx-input" value={pwdForm.current} onChange={(e) => setPwdForm((f) => ({ ...f, current: e.target.value }))} />
                </div>
                <div className="cx-field">
                  <label htmlFor="newPwd">New Password</label>
                  <input id="newPwd" type="password" className="cx-input" value={pwdForm.next} onChange={(e) => setPwdForm((f) => ({ ...f, next: e.target.value }))} />
                </div>
                <div className="cx-field mb-0">
                  <label htmlFor="confirmNewPwd">Confirm New Password</label>
                  <input id="confirmNewPwd" type="password" className="cx-input" value={pwdForm.confirm} onChange={(e) => setPwdForm((f) => ({ ...f, confirm: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--c-border-soft)' }}>
                <button type="button" className="cx-btn cx-btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="cx-btn cx-btn-primary" disabled={savingPwd}>
                  {savingPwd ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
