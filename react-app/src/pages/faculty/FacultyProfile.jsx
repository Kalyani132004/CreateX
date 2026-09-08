import React, { useState } from 'react';
import { Modal } from 'bootstrap';
import { Avatar } from '../../components/Badge/Badge';
import StatCard from '../../components/StatCard/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import api from '../../services/api';

export default function FacultyProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    bio: user?.bio ?? '',
    department: user?.department ?? user?.dept ?? '',
  });
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/auth/profile/', editForm);
      setUser?.((prev) => ({ ...prev, ...res.data }));
      Modal.getOrCreateInstance(document.getElementById('editFacProfileModal')).hide();
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
      Modal.getOrCreateInstance(document.getElementById('changeFacPwdModal')).hide();
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
            <p className="cx-small mb-2">
              <i className="bi bi-envelope me-1"></i>
              {user?.email} &middot; {user?.department ?? user?.dept}
            </p>
            <p className="cx-body mb-0" style={{ maxWidth: 520 }}>
              {user?.bio || 'No bio added yet.'}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="cx-btn cx-btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#editFacProfileModal"
            >
              Edit Profile
            </button>
            <button
              className="cx-btn cx-btn-outline"
              data-bs-toggle="modal"
              data-bs-target="#changeFacPwdModal"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-eye"
            value={user?.projects_reviewed ?? 0}
            label="Projects Reviewed"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-chat-square-text"
            value={user?.feedback_given ?? 0}
            label="Feedback Given"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-award"
            value={user?.recommendations_given ?? 0}
            label="Recommendations Given"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-people"
            value={user?.students_guided ?? 0}
            label="Students Guided"
          />
        </div>
      </div>

      {/* Edit Profile modal */}
      <div
        className="modal fade"
        id="editFacProfileModal"
        tabIndex="-1"
        aria-labelledby="editFacProfileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-border-soft)',
            }}
          >
            <form onSubmit={handleSaveProfile}>
              <div
                className="modal-header"
                style={{ borderBottom: '1px solid var(--c-border-soft)' }}
              >
                <h3 className="cx-h3 mb-0" id="editFacProfileModalLabel">
                  Edit Profile
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="cx-field">
                  <label htmlFor="facBio">Bio</label>
                  <textarea
                    id="facBio"
                    className="cx-input"
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, bio: e.target.value }))
                    }
                  />
                </div>
                <div className="cx-field mb-0">
                  <label htmlFor="facDept">Department</label>
                  <input
                    id="facDept"
                    className="cx-input"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, department: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: '1px solid var(--c-border-soft)' }}
              >
                <button
                  type="button"
                  className="cx-btn cx-btn-outline"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cx-btn cx-btn-primary"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Change Password modal */}
      <div
        className="modal fade"
        id="changeFacPwdModal"
        tabIndex="-1"
        aria-labelledby="changeFacPwdModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-border-soft)',
            }}
          >
            <form onSubmit={handleChangePassword}>
              <div
                className="modal-header"
                style={{ borderBottom: '1px solid var(--c-border-soft)' }}
              >
                <h3 className="cx-h3 mb-0" id="changeFacPwdModalLabel">
                  Change Password
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="cx-field">
                  <label htmlFor="facCurrentPwd">Current Password</label>
                  <input
                    id="facCurrentPwd"
                    type="password"
                    className="cx-input"
                    value={pwdForm.current}
                    onChange={(e) =>
                      setPwdForm((f) => ({ ...f, current: e.target.value }))
                    }
                  />
                </div>
                <div className="cx-field">
                  <label htmlFor="facNewPwd">New Password</label>
                  <input
                    id="facNewPwd"
                    type="password"
                    className="cx-input"
                    value={pwdForm.next}
                    onChange={(e) =>
                      setPwdForm((f) => ({ ...f, next: e.target.value }))
                    }
                  />
                </div>
                <div className="cx-field mb-0">
                  <label htmlFor="facConfirmPwd">Confirm New Password</label>
                  <input
                    id="facConfirmPwd"
                    type="password"
                    className="cx-input"
                    value={pwdForm.confirm}
                    onChange={(e) =>
                      setPwdForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: '1px solid var(--c-border-soft)' }}
              >
                <button
                  type="button"
                  className="cx-btn cx-btn-outline"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cx-btn cx-btn-primary"
                  disabled={savingPwd}
                >
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
