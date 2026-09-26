import { Modal } from 'bootstrap';
import { useEffect, useState } from 'react';

import { Avatar } from '../../components/Badge/Badge';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import ProjectCard from '../../components/ProjectCard/ProjectCard';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import api from '../../services/api';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';

const SOCIAL_FIELDS = [
  {
    key: 'github',
    icon: 'bi-github',
    label: 'GitHub',
  },
  {
    key: 'linkedin',
    icon: 'bi-linkedin',
    label: 'LinkedIn',
  },
  {
    key: 'leetcode',
    icon: 'bi-code-square',
    label: 'LeetCode',
  },
  {
    key: 'gfg',
    icon: 'bi-braces',
    label: 'GeeksForGeeks',
  },
];

const EMPTY_PROFILE = {
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  college_id: '',
  course: '',
  batch_start: '',
  batch_end: '',
  skills: [],

  bio: '',

  github: '',
  linkedin: '',
  leetcode: '',
  gfg: '',

  profile_photo: '',
};

const EMPTY_EDIT_FORM = {
  bio: '',
  github: '',
  linkedin: '',
  leetcode: '',
  gfg: '',
};

const EMPTY_PASSWORD_FORM = {
  current: '',
  next: '',
  confirm: '',
};

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(EMPTY_PROFILE);

  const [projects, setProjects] = useState([]);

  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [pwdForm, setPwdForm] = useState(EMPTY_PASSWORD_FORM);

  const [savingProfile, setSavingProfile] = useState(false);

  const [savingPwd, setSavingPwd] = useState(false);

  // =========================================================
  // ERROR HELPER
  // =========================================================

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data?.detail) {
      return data.detail;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    // Django/DRF field errors
    if (data && typeof data === 'object') {
      const firstFieldError = Object.values(data).find(
        (value) => Array.isArray(value) && value.length > 0,
      );

      if (firstFieldError) {
        return firstFieldError[0];
      }
    }

    return error?.message || fallback;
  };

  // =========================================================
  // NORMALIZE PROFILE RESPONSE
  // =========================================================

  const normalizeProfile = (data = {}) => {
    const profileData = data?.profile || data || {};

    return {
      first_name: profileData?.first_name ?? '',
      middle_name: profileData?.middle_name ?? '',
      last_name: profileData?.last_name ?? '',

      email: profileData?.email ?? '',

      college_id: profileData?.college_id ?? profileData?.college_unique_id ?? '',

      course: profileData?.course ?? '',

      batch_start: profileData?.batch_start ?? '',

      batch_end: profileData?.batch_end ?? '',

      skills: Array.isArray(profileData?.skills) ? profileData.skills : [],

      bio: profileData?.bio ?? '',

      github: profileData?.github_url ?? '',

      linkedin: profileData?.linkedin_url ?? '',

      leetcode: profileData?.leetcode_url ?? '',

      gfg: profileData?.gfg_url ?? '',

      profile_photo: profileData?.profile_photo ?? '',
    };
  };

  // =========================================================
  // NORMALIZE EDIT FORM
  // =========================================================

  const profileToEditForm = (profileData) => ({
    bio: profileData?.bio ?? '',

    github: profileData?.github ?? '',

    linkedin: profileData?.linkedin ?? '',

    leetcode: profileData?.leetcode ?? '',

    gfg: profileData?.gfg ?? '',
  });

  // =========================================================
  // UPDATE AUTH CONTEXT
  // =========================================================

  const updateAuthUser = (profileData) => {
    if (!setUser) {
      return;
    }

    setUser((previousUser) => ({
      ...(previousUser || {}),

      first_name: profileData.first_name,
      middle_name: profileData.middle_name,
      last_name: profileData.last_name,

      name: [profileData.first_name, profileData.middle_name, profileData.last_name]
        .filter(Boolean)
        .join(' '),

      email: profileData.email,

      college_id: profileData.college_id,

      course: profileData.course,

      batch_start: profileData.batch_start,

      batch_end: profileData.batch_end,

      skills: profileData.skills,

      bio: profileData.bio,

      github_url: profileData.github,

      linkedin_url: profileData.linkedin,

      leetcode_url: profileData.leetcode,

      gfg_url: profileData.gfg,

      profile_photo: profileData.profile_photo,
    }));
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);

      // =====================================================
      // LOAD PROFILE
      // =====================================================

      try {
        const profileResponse = await api.get('/auth/student/profile/');

        console.log('PROFILE API RESPONSE:', profileResponse.data);

        if (cancelled) {
          return;
        }

        const normalizedProfile = normalizeProfile(profileResponse.data);

        console.log('NORMALIZED PROFILE:', normalizedProfile);

        setProfile(normalizedProfile);

        setEditForm(profileToEditForm(normalizedProfile));

        updateAuthUser(normalizedProfile);
      } catch (error) {
        console.error('Student profile API error:', error);

        if (!cancelled) {
          toast(
            getErrorMessage(error, 'Could not load your profile information.'),
            'error',
          );
        }
      }

      // =====================================================
      // LOAD PROJECTS SEPARATELY
      // =====================================================

      try {
        const projectsResponse = await projectService.myProjects();

        console.log('PROJECT API RESPONSE:', projectsResponse.data);

        if (cancelled) {
          return;
        }

        const projectData =
          projectsResponse?.data?.results ?? projectsResponse?.data ?? [];

        setProjects(Array.isArray(projectData) ? projectData : []);
      } catch (error) {
        console.error('Student projects API error:', error);

        // Project failure should NOT hide profile information.
        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);
  // =========================================================
  // PROFILE PHOTO
  // =========================================================

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast('Please select a JPG, PNG or WEBP image.', 'error');

      event.target.value = '';

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast('Profile picture must be less than 2 MB.', 'error');

      event.target.value = '';

      return;
    }

    setProfilePhoto(file);
  };

  // =========================================================
  // PROFILE FORM CHANGE
  // =========================================================

  const handleProfileChange = (event) => {
    const { id, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();

      if (!profilePhoto) {
        console.log('NO PROFILE PHOTO SELECTED');
        return;
      }

      formData.append('profile_photo', profilePhoto);

      console.log('========== REACT PHOTO DEBUG ==========');
      console.log('File:', profilePhoto);
      console.log('Name:', profilePhoto.name);
      console.log('Type:', profilePhoto.type);
      console.log('Size:', profilePhoto.size);

      for (const [key, value] of formData.entries()) {
        console.log('FORM DATA:', key, value, value instanceof File ? value.name : '');
      }

      console.log('Is FormData:', formData instanceof FormData);
      console.log('=======================================');

      const response = await api.patch('/auth/student/profile/', formData);

      console.log('PHOTO UPDATE RESPONSE:', response.data);
    } catch (error) {
      console.error('PHOTO UPDATE ERROR:', error);
    }
  };

  // =========================================================
  // PASSWORD FORM
  // =========================================================

  const handlePasswordChange = (event) => {
    const { id, value } = event.target;

    setPwdForm((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (savingPwd) {
      return;
    }

    const currentPassword = pwdForm.current.trim();

    const newPassword = pwdForm.next;

    const confirmPassword = pwdForm.confirm;

    if (!currentPassword) {
      toast('Please enter your current password.', 'error');

      return;
    }

    if (newPassword.length < 8) {
      toast('New password must contain at least 8 characters.', 'error');

      return;
    }

    if (newPassword !== confirmPassword) {
      toast('New password and confirm password do not match.', 'error');

      return;
    }

    setSavingPwd(true);

    try {
      const response = await authService.changePassword({
        user_type: user?.role || 'student',

        current_password: currentPassword,

        new_password: newPassword,
      });

      const modalElement = document.getElementById('changePwdModal');

      if (modalElement) {
        Modal.getOrCreateInstance(modalElement).hide();
      }

      setPwdForm(EMPTY_PASSWORD_FORM);

      toast(
        response?.data?.detail ||
          response?.data?.message ||
          'Password updated successfully!',
      );
    } catch (error) {
      console.error('Change password error:', error);

      toast(getErrorMessage(error, 'Could not update your password.'), 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  // =========================================================
  // DISPLAY NAME
  // =========================================================

  const displayName =
    [profile.first_name, profile.middle_name, profile.last_name]
      .filter(Boolean)
      .join(' ') ||
    user?.name ||
    'Student';

  // =========================================================
  // AVATAR NAME
  // =========================================================

  const avatarName = profile.first_name || displayName || 'Student';

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <div className="cx-hero p-4 p-lg-5 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          {/* AVATAR */}

          <Avatar name={avatarName} image={profile.profile_photo} size={84} />

          {/* STUDENT INFORMATION */}

          <div className="flex-grow-1">
            <h1 className="cx-h1 mb-1">{displayName}</h1>

            <p className="cx-small mb-1">
              {profile.course || 'Course'}
              {' · '}
              Batch {profile.batch_start || 'N/A'}
              {' - '}
              {profile.batch_end || 'N/A'}
            </p>

            {profile.college_id && (
              <p className="cx-small mb-2">
                College ID: <strong>{profile.college_id}</strong>
              </p>
            )}

            {profile.email && <p className="cx-small mb-2">{profile.email}</p>}

            <p
              className="cx-body mb-0"
              style={{
                maxWidth: 520,
              }}
            >
              {profile.bio || 'No bio added yet.'}
            </p>
          </div>

          {/* ACTION BUTTONS */}

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="cx-btn cx-btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#editProfileModal"
            >
              Edit Profile
            </button>

            <button
              type="button"
              className="cx-btn cx-btn-outline"
              data-bs-toggle="modal"
              data-bs-target="#changePwdModal"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="row g-4">
        {/* ===================================================
            PROJECTS
        =================================================== */}

        <div className="col-lg-8">
          <div className="cx-card p-4 mb-4">
            <h3 className="cx-h3 mb-3">Projects ({loading ? '…' : projects.length})</h3>

            {loading ? (
              <SkeletonGrid count={2} cols="col-sm-6" />
            ) : projects.length > 0 ? (
              <div className="row g-3">
                {projects.map((project) => (
                  <div className="col-sm-6" key={project.id || project._id}>
                    <ProjectCard project={project} hideWishlist />
                  </div>
                ))}
              </div>
            ) : (
              <p className="cx-small mb-0">No projects submitted yet.</p>
            )}
          </div>
        </div>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <div className="col-lg-4">
          {/* SKILLS */}

          <div className="cx-card p-4 mb-3">
            <h3 className="cx-h3 mb-3">Skills</h3>

            <div className="cx-tech-row">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span className="cx-badge cx-badge-primary" key={`${skill}-${index}`}>
                    {skill}
                  </span>
                ))
              ) : (
                <p className="cx-small mb-0">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* SOCIAL LINKS */}

          <div className="cx-card p-4">
            <h3 className="cx-h3 mb-3">Social Links</h3>

            {SOCIAL_FIELDS.map(({ key, icon, label }) => {
              const url = profile[key];

              return (
                <div
                  className="d-flex align-items-center gap-2 py-2"
                  style={{
                    borderBottom: '1px solid var(--c-border-soft)',
                  }}
                  key={key}
                >
                  <i
                    className={`bi ${icon}`}
                    style={{
                      color: 'var(--c-ink-soft)',
                    }}
                    aria-hidden="true"
                  />

                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cx-small mb-0 text-decoration-none text-truncate"
                      title={url}
                    >
                      {url}
                    </a>
                  ) : (
                    <span className="cx-small mb-0">{label} not linked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      <div
        className="modal fade"
        id="editProfileModal"
        tabIndex="-1"
        aria-labelledby="editProfileModalLabel"
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
                style={{
                  borderBottom: '1px solid var(--c-border-soft)',
                }}
              >
                <h3 className="cx-h3 mb-0" id="editProfileModalLabel">
                  Edit Profile
                </h3>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>

              <div className="modal-body">
                {/* PROFILE PHOTO */}

                <div className="cx-field">
                  <label htmlFor="profilePhoto">Profile Picture</label>

                  <input
                    id="profilePhoto"
                    type="file"
                    className="cx-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePhotoChange}
                  />

                  <small className="cx-small">JPG, PNG or WEBP. Maximum 2 MB.</small>

                  {profilePhoto && (
                    <small className="d-block mt-2">
                      Selected: <strong>{profilePhoto.name}</strong>
                    </small>
                  )}
                </div>

                {/* BIO */}

                <div className="cx-field">
                  <label htmlFor="bio">Bio</label>

                  <textarea
                    id="bio"
                    className="cx-input"
                    rows={4}
                    value={editForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell something about yourself..."
                    maxLength={500}
                  />
                </div>

                {/* GITHUB */}

                <div className="cx-field">
                  <label htmlFor="github">GitHub</label>

                  <input
                    id="github"
                    type="url"
                    className="cx-input"
                    value={editForm.github}
                    onChange={handleProfileChange}
                    placeholder="https://github.com/username"
                  />
                </div>

                {/* LINKEDIN */}

                <div className="cx-field">
                  <label htmlFor="linkedin">LinkedIn</label>

                  <input
                    id="linkedin"
                    type="url"
                    className="cx-input"
                    value={editForm.linkedin}
                    onChange={handleProfileChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                {/* LEETCODE */}

                <div className="cx-field">
                  <label htmlFor="leetcode">LeetCode</label>

                  <input
                    id="leetcode"
                    type="url"
                    className="cx-input"
                    value={editForm.leetcode}
                    onChange={handleProfileChange}
                    placeholder="https://leetcode.com/username"
                  />
                </div>

                {/* GFG */}

                <div className="cx-field mb-0">
                  <label htmlFor="gfg">GeeksForGeeks</label>

                  <input
                    id="gfg"
                    type="url"
                    className="cx-input"
                    value={editForm.gfg}
                    onChange={handleProfileChange}
                    placeholder="https://www.geeksforgeeks.org/user/username"
                  />
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  borderTop: '1px solid var(--c-border-soft)',
                }}
              >
                <button
                  type="button"
                  className="cx-btn cx-btn-outline"
                  data-bs-dismiss="modal"
                  disabled={savingProfile}
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

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ===================================================== */}

      <div
        className="modal fade"
        id="changePwdModal"
        tabIndex="-1"
        aria-labelledby="changePwdModalLabel"
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
                style={{
                  borderBottom: '1px solid var(--c-border-soft)',
                }}
              >
                <h3 className="cx-h3 mb-0" id="changePwdModalLabel">
                  Change Password
                </h3>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>

              <div className="modal-body">
                <div className="cx-field">
                  <label htmlFor="current">Current Password</label>

                  <input
                    id="current"
                    type="password"
                    className="cx-input"
                    value={pwdForm.current}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="cx-field">
                  <label htmlFor="next">New Password</label>

                  <input
                    id="next"
                    type="password"
                    className="cx-input"
                    value={pwdForm.next}
                    onChange={handlePasswordChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />

                  <small className="cx-small">Minimum 8 characters.</small>
                </div>

                <div className="cx-field mb-0">
                  <label htmlFor="confirm">Confirm New Password</label>

                  <input
                    id="confirm"
                    type="password"
                    className="cx-input"
                    value={pwdForm.confirm}
                    onChange={handlePasswordChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  borderTop: '1px solid var(--c-border-soft)',
                }}
              >
                <button
                  type="button"
                  className="cx-btn cx-btn-outline"
                  data-bs-dismiss="modal"
                  disabled={savingPwd}
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
