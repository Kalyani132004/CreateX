// import { Modal } from 'bootstrap';
// import { useEffect, useState } from 'react';

// import { Avatar } from '../../components/Badge/Badge';

// import { useAuth } from '../../context/AuthContext';
// import { useToast } from '../../context/ToastContext';

// import api from '../../services/api';
// import { authService } from '../../services/authService';

// const SOCIAL_FIELDS = [
//   {
//     key: 'github',
//     icon: 'bi-github',
//     label: 'GitHub',
//   },
//   {
//     key: 'linkedin',
//     icon: 'bi-linkedin',
//     label: 'LinkedIn',
//   },
//   {
//     key: 'leetcode',
//     icon: 'bi-code-square',
//     label: 'LeetCode',
//   },
//   {
//     key: 'gfg',
//     icon: 'bi-braces',
//     label: 'GeeksForGeeks',
//   },
// ];

// const EMPTY_PROFILE = {
//   first_name: '',
//   middle_name: '',
//   last_name: '',
//   email: '',
//   college_id: '',
//   course: '',
//   batch_start: '',
//   batch_end: '',
//   skills: [],
//   bio: '',
//   github: '',
//   linkedin: '',
//   leetcode: '',
//   gfg: '',
//   profile_photo: '',
// };

// const EMPTY_EDIT_FORM = {
//   bio: '',
//   github: '',
//   linkedin: '',
//   leetcode: '',
//   gfg: '',
// };

// const EMPTY_PASSWORD_FORM = {
//   current: '',
//   next: '',
//   confirm: '',
// };

// export default function StudentProfile() {
//   const { user, setUser } = useAuth();
//   const { toast } = useToast();

//   // =========================================================
//   // STATE
//   // =========================================================

//   const [loading, setLoading] = useState(true);

//   const [profile, setProfile] = useState(EMPTY_PROFILE);

//   const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

//   const [profilePhoto, setProfilePhoto] = useState(null);

//   const [pwdForm, setPwdForm] = useState(EMPTY_PASSWORD_FORM);

//   const [savingProfile, setSavingProfile] = useState(false);

//   const [savingPwd, setSavingPwd] = useState(false);

//   // =========================================================
//   // ERROR HELPER
//   // =========================================================

//   const getErrorMessage = (error, fallback) => {
//     const data = error?.response?.data;

//     if (typeof data === 'string') {
//       return data;
//     }

//     if (data?.detail) {
//       return data.detail;
//     }

//     if (data?.message) {
//       return data.message;
//     }

//     if (data?.error) {
//       return data.error;
//     }

//     if (data && typeof data === 'object') {
//       const firstFieldError = Object.values(data).find(
//         (value) => Array.isArray(value) && value.length > 0,
//       );

//       if (firstFieldError) {
//         return firstFieldError[0];
//       }
//     }

//     return error?.message || fallback;
//   };

//   // =========================================================
//   // NORMALIZE PROFILE RESPONSE
//   // =========================================================

//   const normalizeProfile = (data = {}) => {
//     const profileData = data?.profile || data || {};

//     return {
//       first_name: profileData?.first_name ?? '',
//       middle_name: profileData?.middle_name ?? '',
//       last_name: profileData?.last_name ?? '',

//       email: profileData?.email ?? '',

//       college_id: profileData?.college_id ?? profileData?.college_unique_id ?? '',

//       course: profileData?.course ?? '',

//       batch_start: profileData?.batch_start ?? '',

//       batch_end: profileData?.batch_end ?? '',

//       skills: Array.isArray(profileData?.skills) ? profileData.skills : [],

//       bio: profileData?.bio ?? '',

//       github: profileData?.github_url ?? '',

//       linkedin: profileData?.linkedin_url ?? '',

//       leetcode: profileData?.leetcode_url ?? '',

//       gfg: profileData?.gfg_url ?? '',

//       profile_photo: profileData?.profile_photo ?? '',
//     };
//   };

//   // =========================================================
//   // PROFILE → EDIT FORM
//   // =========================================================

//   const profileToEditForm = (profileData) => ({
//     bio: profileData?.bio ?? '',
//     github: profileData?.github ?? '',
//     linkedin: profileData?.linkedin ?? '',
//     leetcode: profileData?.leetcode ?? '',
//     gfg: profileData?.gfg ?? '',
//   });

//   // =========================================================
//   // UPDATE AUTH CONTEXT
//   // =========================================================

//   const updateAuthUser = (profileData) => {
//     if (!setUser) {
//       return;
//     }

//     setUser((previousUser) => ({
//       ...(previousUser || {}),

//       first_name: profileData.first_name,
//       middle_name: profileData.middle_name,
//       last_name: profileData.last_name,

//       name: [profileData.first_name, profileData.middle_name, profileData.last_name]
//         .filter(Boolean)
//         .join(' '),

//       email: profileData.email,

//       college_id: profileData.college_id,

//       course: profileData.course,

//       batch_start: profileData.batch_start,

//       batch_end: profileData.batch_end,

//       skills: profileData.skills,

//       bio: profileData.bio,

//       github_url: profileData.github,

//       linkedin_url: profileData.linkedin,

//       leetcode_url: profileData.leetcode,

//       gfg_url: profileData.gfg,

//       profile_photo: profileData.profile_photo,
//     }));
//   };

//   // =========================================================
//   // LOAD PROFILE
//   // =========================================================

//   useEffect(() => {
//     let cancelled = false;

//     const loadProfile = async () => {
//       setLoading(true);

//       try {
//         const response = await api.get('/auth/student/profile/');

//         if (cancelled) {
//           return;
//         }

//         console.log('PROFILE API RESPONSE:', response.data);

//         const normalizedProfile = normalizeProfile(response.data);

//         console.log('NORMALIZED PROFILE:', normalizedProfile);

//         setProfile(normalizedProfile);

//         setEditForm(profileToEditForm(normalizedProfile));

//         updateAuthUser(normalizedProfile);
//       } catch (error) {
//         console.error('Student profile API error:', error);

//         if (!cancelled) {
//           toast(
//             getErrorMessage(error, 'Could not load your profile information.'),
//             'error',
//           );
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     loadProfile();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // =========================================================
//   // PROFILE PHOTO CHANGE
//   // =========================================================

//   const handleProfilePhotoChange = (event) => {
//     const file = event.target.files?.[0];

//     if (!file) {
//       return;
//     }

//     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

//     if (!allowedTypes.includes(file.type)) {
//       toast('Please select a JPG, PNG or WEBP image.', 'error');

//       event.target.value = '';

//       return;
//     }

//     // 2 MB
//     const maxSize = 2 * 1024 * 1024;

//     if (file.size > maxSize) {
//       toast('Profile picture must be less than 2 MB.', 'error');

//       event.target.value = '';

//       return;
//     }

//     setProfilePhoto(file);
//   };

//   // =========================================================
//   // PROFILE FORM CHANGE
//   // =========================================================

//   const handleProfileChange = (event) => {
//     const { id, value } = event.target;

//     setEditForm((previous) => ({
//       ...previous,
//       [id]: value,
//     }));
//   };

//   // =========================================================
//   // SAVE PROFILE
//   // =========================================================

//   const handleSaveProfile = async (event) => {
//     event.preventDefault();

//     if (savingProfile) {
//       return;
//     }

//     setSavingProfile(true);

//     try {
//       const formData = new FormData();

//       // Text fields
//       formData.append('bio', editForm.bio);
//       formData.append('github_url', editForm.github);
//       formData.append('linkedin_url', editForm.linkedin);
//       formData.append('leetcode_url', editForm.leetcode);
//       formData.append('gfg_url', editForm.gfg);

//       // Photo is optional
//       if (profilePhoto) {
//         formData.append('profile_photo', profilePhoto);
//       }

//       console.log('========== PROFILE UPDATE ==========');

//       for (const [key, value] of formData.entries()) {
//         console.log(key, value instanceof File ? value.name : value);
//       }

//       console.log('====================================');

//       const response = await api.patch('/auth/student/profile/', formData);

//       console.log('PROFILE UPDATE RESPONSE:', response.data);

//       // Normalize updated response
//       const updatedProfile = normalizeProfile(response.data);

//       setProfile(updatedProfile);

//       setEditForm(profileToEditForm(updatedProfile));

//       updateAuthUser(updatedProfile);

//       setProfilePhoto(null);

//       // Close modal
//       const modalElement = document.getElementById('editProfileModal');

//       if (modalElement) {
//         Modal.getOrCreateInstance(modalElement).hide();
//       }

//       toast('Profile updated successfully!', 'success');
//     } catch (error) {
//       console.error('PROFILE UPDATE ERROR:', error);

//       toast(getErrorMessage(error, 'Could not update your profile.'), 'error');
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   // =========================================================
//   // PASSWORD FORM
//   // =========================================================

//   const handlePasswordChange = (event) => {
//     const { id, value } = event.target;

//     setPwdForm((previous) => ({
//       ...previous,
//       [id]: value,
//     }));
//   };

//   // =========================================================
//   // CHANGE PASSWORD
//   // =========================================================

//   const handleChangePassword = async (event) => {
//     event.preventDefault();

//     if (savingPwd) {
//       return;
//     }

//     const currentPassword = pwdForm.current.trim();

//     const newPassword = pwdForm.next;

//     const confirmPassword = pwdForm.confirm;

//     if (!currentPassword) {
//       toast('Please enter your current password.', 'error');

//       return;
//     }

//     if (newPassword.length < 8) {
//       toast('New password must contain at least 8 characters.', 'error');

//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast('New password and confirm password do not match.', 'error');

//       return;
//     }

//     setSavingPwd(true);

//     try {
//       const response = await authService.changePassword({
//         user_type: user?.role || 'student',
//         current_password: currentPassword,
//         new_password: newPassword,
//       });

//       const modalElement = document.getElementById('changePwdModal');

//       if (modalElement) {
//         Modal.getOrCreateInstance(modalElement).hide();
//       }

//       setPwdForm(EMPTY_PASSWORD_FORM);

//       toast(
//         response?.data?.detail ||
//           response?.data?.message ||
//           'Password updated successfully!',
//         'success',
//       );
//     } catch (error) {
//       console.error('Change password error:', error);

//       toast(getErrorMessage(error, 'Could not update your password.'), 'error');
//     } finally {
//       setSavingPwd(false);
//     }
//   };

//   // =========================================================
//   // DISPLAY NAME
//   // =========================================================

//   const displayName =
//     [profile.first_name, profile.middle_name, profile.last_name]
//       .filter(Boolean)
//       .join(' ') ||
//     user?.name ||
//     'Student';

//   // =========================================================
//   // AVATAR NAME
//   // =========================================================

//   const avatarName = profile.first_name || displayName || 'Student';

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (loading) {
//     return (
//       <div className="cx-card p-5 text-center">
//         <div className="spinner-border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>

//         <p className="cx-small mt-3 mb-0">Loading your profile...</p>
//       </div>
//     );
//   }

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <>
//       {/* =====================================================
//           PROFILE HEADER
//       ===================================================== */}

//       <div className="cx-hero p-4 p-lg-5 mb-4">
//         <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
//           {/* AVATAR */}

//           <Avatar name={avatarName} image={profile.profile_photo} size={84} />

//           {/* STUDENT INFORMATION */}

//           <div className="flex-grow-1">
//             <h1 className="cx-h1 mb-1">{displayName}</h1>

//             <p className="cx-small mb-1">
//               {profile.course || 'Course'}
//               {' · '}
//               Batch {profile.batch_start || 'N/A'}
//               {' - '}
//               {profile.batch_end || 'N/A'}
//             </p>

//             {profile.college_id && (
//               <p className="cx-small mb-2">
//                 College ID: <strong>{profile.college_id}</strong>
//               </p>
//             )}

//             {profile.email && <p className="cx-small mb-2">{profile.email}</p>}

//             <p
//               className="cx-body mb-0"
//               style={{
//                 maxWidth: 520,
//               }}
//             >
//               {profile.bio || 'No bio added yet.'}
//             </p>
//           </div>

//           {/* ACTION BUTTONS */}

//           <div className="d-flex flex-wrap gap-2">
//             <button
//               type="button"
//               className="cx-btn cx-btn-primary"
//               data-bs-toggle="modal"
//               data-bs-target="#editProfileModal"
//             >
//               <i className="bi bi-pencil me-1"></i>
//               Edit Profile
//             </button>

//             <button
//               type="button"
//               className="cx-btn cx-btn-outline"
//               data-bs-toggle="modal"
//               data-bs-target="#changePwdModal"
//             >
//               <i className="bi bi-key me-1"></i>
//               Change Password
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           PROFILE CONTENT
//       ===================================================== */}

//       <div className="row g-4">
//         {/* ===================================================
//             SKILLS
//         =================================================== */}

//         <div className="col-lg-6">
//           <div className="cx-card p-4 h-100">
//             <h3 className="cx-h3 mb-3">Skills</h3>

//             <div className="cx-tech-row">
//               {profile.skills.length > 0 ? (
//                 profile.skills.map((skill, index) => (
//                   <span className="cx-badge cx-badge-primary" key={`${skill}-${index}`}>
//                     {skill}
//                   </span>
//                 ))
//               ) : (
//                 <p className="cx-small mb-0">No skills added yet.</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ===================================================
//             SOCIAL LINKS
//         =================================================== */}

//         <div className="col-lg-6">
//           <div className="cx-card p-4 h-100">
//             <h3 className="cx-h3 mb-3">Social Links</h3>

//             {SOCIAL_FIELDS.map(({ key, icon, label }) => {
//               const url = profile[key];

//               return (
//                 <div
//                   className="d-flex align-items-center gap-2 py-2"
//                   style={{
//                     borderBottom: '1px solid var(--c-border-soft)',
//                   }}
//                   key={key}
//                 >
//                   <i
//                     className={`bi ${icon}`}
//                     style={{
//                       color: 'var(--c-ink-soft)',
//                     }}
//                     aria-hidden="true"
//                   />

//                   {url ? (
//                     <a
//                       href={url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="cx-small mb-0 text-decoration-none text-truncate"
//                       title={url}
//                     >
//                       {url}
//                     </a>
//                   ) : (
//                     <span className="cx-small mb-0">{label} not linked</span>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           EDIT PROFILE MODAL
//       ===================================================== */}

//       <div
//         className="modal fade"
//         id="editProfileModal"
//         tabIndex="-1"
//         aria-labelledby="editProfileModalLabel"
//         aria-hidden="true"
//       >
//         <div className="modal-dialog modal-dialog-centered">
//           <div
//             className="modal-content"
//             style={{
//               borderRadius: 'var(--r-lg)',
//               border: '1px solid var(--c-border-soft)',
//             }}
//           >
//             <form onSubmit={handleSaveProfile}>
//               <div
//                 className="modal-header"
//                 style={{
//                   borderBottom: '1px solid var(--c-border-soft)',
//                 }}
//               >
//                 <h3 className="cx-h3 mb-0" id="editProfileModalLabel">
//                   Edit Profile
//                 </h3>

//                 <button
//                   type="button"
//                   className="btn-close"
//                   data-bs-dismiss="modal"
//                   aria-label="Close"
//                 />
//               </div>

//               <div className="modal-body">
//                 {/* PROFILE PHOTO */}

//                 <div className="cx-field">
//                   <label htmlFor="profilePhoto">Profile Picture</label>

//                   <input
//                     id="profilePhoto"
//                     type="file"
//                     className="cx-input"
//                     accept="image/jpeg,image/png,image/webp"
//                     onChange={handleProfilePhotoChange}
//                   />

//                   <small className="cx-small">JPG, PNG or WEBP. Maximum 2 MB.</small>

//                   {profilePhoto && (
//                     <small className="d-block mt-2">
//                       Selected: <strong>{profilePhoto.name}</strong>
//                     </small>
//                   )}
//                 </div>

//                 {/* BIO */}

//                 <div className="cx-field">
//                   <label htmlFor="bio">Bio</label>

//                   <textarea
//                     id="bio"
//                     className="cx-input"
//                     rows={4}
//                     value={editForm.bio}
//                     onChange={handleProfileChange}
//                     placeholder="Tell something about yourself..."
//                     maxLength={500}
//                   />
//                 </div>

//                 {/* GITHUB */}

//                 <div className="cx-field">
//                   <label htmlFor="github">GitHub</label>

//                   <input
//                     id="github"
//                     type="url"
//                     className="cx-input"
//                     value={editForm.github}
//                     onChange={handleProfileChange}
//                     placeholder="https://github.com/username"
//                   />
//                 </div>

//                 {/* LINKEDIN */}

//                 <div className="cx-field">
//                   <label htmlFor="linkedin">LinkedIn</label>

//                   <input
//                     id="linkedin"
//                     type="url"
//                     className="cx-input"
//                     value={editForm.linkedin}
//                     onChange={handleProfileChange}
//                     placeholder="https://linkedin.com/in/username"
//                   />
//                 </div>

//                 {/* LEETCODE */}

//                 <div className="cx-field">
//                   <label htmlFor="leetcode">LeetCode</label>

//                   <input
//                     id="leetcode"
//                     type="url"
//                     className="cx-input"
//                     value={editForm.leetcode}
//                     onChange={handleProfileChange}
//                     placeholder="https://leetcode.com/username"
//                   />
//                 </div>

//                 {/* GFG */}

//                 <div className="cx-field mb-0">
//                   <label htmlFor="gfg">GeeksForGeeks</label>

//                   <input
//                     id="gfg"
//                     type="url"
//                     className="cx-input"
//                     value={editForm.gfg}
//                     onChange={handleProfileChange}
//                     placeholder="https://www.geeksforgeeks.org/user/username"
//                   />
//                 </div>
//               </div>

//               <div
//                 className="modal-footer"
//                 style={{
//                   borderTop: '1px solid var(--c-border-soft)',
//                 }}
//               >
//                 <button
//                   type="button"
//                   className="cx-btn cx-btn-outline"
//                   data-bs-dismiss="modal"
//                   disabled={savingProfile}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className="cx-btn cx-btn-primary"
//                   disabled={savingProfile}
//                 >
//                   {savingProfile ? 'Saving…' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           CHANGE PASSWORD MODAL
//       ===================================================== */}

//       <div
//         className="modal fade"
//         id="changePwdModal"
//         tabIndex="-1"
//         aria-labelledby="changePwdModalLabel"
//         aria-hidden="true"
//       >
//         <div className="modal-dialog modal-dialog-centered">
//           <div
//             className="modal-content"
//             style={{
//               borderRadius: 'var(--r-lg)',
//               border: '1px solid var(--c-border-soft)',
//             }}
//           >
//             <form onSubmit={handleChangePassword}>
//               <div
//                 className="modal-header"
//                 style={{
//                   borderBottom: '1px solid var(--c-border-soft)',
//                 }}
//               >
//                 <h3 className="cx-h3 mb-0" id="changePwdModalLabel">
//                   Change Password
//                 </h3>

//                 <button
//                   type="button"
//                   className="btn-close"
//                   data-bs-dismiss="modal"
//                   aria-label="Close"
//                 />
//               </div>

//               <div className="modal-body">
//                 {/* CURRENT PASSWORD */}

//                 <div className="cx-field">
//                   <label htmlFor="current">Current Password</label>

//                   <input
//                     id="current"
//                     type="password"
//                     className="cx-input"
//                     value={pwdForm.current}
//                     onChange={handlePasswordChange}
//                     autoComplete="current-password"
//                     required
//                   />
//                 </div>

//                 {/* NEW PASSWORD */}

//                 <div className="cx-field">
//                   <label htmlFor="next">New Password</label>

//                   <input
//                     id="next"
//                     type="password"
//                     className="cx-input"
//                     value={pwdForm.next}
//                     onChange={handlePasswordChange}
//                     minLength={8}
//                     autoComplete="new-password"
//                     required
//                   />

//                   <small className="cx-small">Minimum 8 characters.</small>
//                 </div>

//                 {/* CONFIRM PASSWORD */}

//                 <div className="cx-field mb-0">
//                   <label htmlFor="confirm">Confirm New Password</label>

//                   <input
//                     id="confirm"
//                     type="password"
//                     className="cx-input"
//                     value={pwdForm.confirm}
//                     onChange={handlePasswordChange}
//                     minLength={8}
//                     autoComplete="new-password"
//                     required
//                   />
//                 </div>
//               </div>

//               <div
//                 className="modal-footer"
//                 style={{
//                   borderTop: '1px solid var(--c-border-soft)',
//                 }}
//               >
//                 <button
//                   type="button"
//                   className="cx-btn cx-btn-outline"
//                   data-bs-dismiss="modal"
//                   disabled={savingPwd}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className="cx-btn cx-btn-primary"
//                   disabled={savingPwd}
//                 >
//                   {savingPwd ? 'Updating…' : 'Update Password'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
import '../../styles/StudentProfile.css';
import { Modal } from 'bootstrap';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '../../components/Badge/Badge';
import ProjectCard from '../../components/ProjectCard/ProjectCard';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import api from '../../services/api';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';
// import './StudentProfile.css';

/* =========================================================
   CONFIG
========================================================= */

const SOCIAL_FIELDS = [
  { key: 'github', icon: 'bi-github', label: 'GitHub' },
  { key: 'linkedin', icon: 'bi-linkedin', label: 'LinkedIn' },
  { key: 'leetcode', icon: 'bi-code-square', label: 'LeetCode' },
  { key: 'gfg', icon: 'bi-braces', label: 'GeeksForGeeks' },
];

const EMPTY_PROFILE = {
  first_name: '', middle_name: '', last_name: '', email: '', college_id: '',
  course: '', batch_start: '', batch_end: '', skills: [], bio: '',
  github: '', linkedin: '', leetcode: '', gfg: '', profile_photo: '',
};
const EMPTY_EDIT_FORM = { bio: '', github: '', linkedin: '', leetcode: '' , gfg: '' };
const EMPTY_PASSWORD_FORM = { current: '', next: '', confirm: '' };

const BIO_MAX = 500;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_MAX = 2 * 1024 * 1024;
const PROJECTS_PREVIEW = 6;

/*
  ASSUMPTION: the profile API does not return projects, and I have not seen
  projectService. Point this at your real "projects owned by the logged-in
  student" method. If it does not exist, the Projects section and the
  project-based statistics are simply not rendered (nothing breaks).
*/
const fetchMyProjects = () =>
  typeof projectService.mine === 'function' ? projectService.mine() : null;

/* =========================================================
   PURE HELPERS
========================================================= */

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data && typeof data === 'object') {
    const first = Object.values(data).find((v) => Array.isArray(v) && v.length > 0);
    if (first) return first[0];
  }
  return error?.message || fallback;
}

function normalizeProfile(data = {}) {
  const d = data?.profile || data || {};
  return {
    first_name: d?.first_name ?? '',
    middle_name: d?.middle_name ?? '',
    last_name: d?.last_name ?? '',
    email: d?.email ?? '',
    college_id: d?.college_id ?? d?.college_unique_id ?? '',
    course: d?.course ?? '',
    batch_start: d?.batch_start ?? '',
    batch_end: d?.batch_end ?? '',
    skills: Array.isArray(d?.skills) ? d.skills : [],
    bio: d?.bio ?? '',
    github: d?.github_url ?? '',
    linkedin: d?.linkedin_url ?? '',
    leetcode: d?.leetcode_url ?? '',
    gfg: d?.gfg_url ?? '',
    profile_photo: d?.profile_photo ?? '',
  };
}

const profileToEditForm = (p) => ({
  bio: p?.bio ?? '',
  github: p?.github ?? '',
  linkedin: p?.linkedin ?? '',
  leetcode: p?.leetcode ?? '',
  gfg: p?.gfg ?? '',
});

// Only http(s) URLs are ever rendered as links (blocks javascript: etc.).
function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function displayUrl(url) {
  const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
  return `${url.hostname.replace(/^www\./, '')}${path}`;
}

function uniqueList(list) {
  const seen = new Set();
  return list
    .map((v) => String(v).trim())
    .filter((v) => v && !seen.has(v.toLowerCase()) && seen.add(v.toLowerCase()));
}

function toTechList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',');
  return [];
}

function toProjectList(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  const seen = new Set();
  return list.filter((p) => p && p.id != null && !seen.has(p.id) && seen.add(p.id));
}

/* One in-flight GET per resource: Strict Mode's double effect shares it. */
const inflight = new Map();
function dedupe(key, factory) {
  if (!inflight.has(key)) {
    const req = Promise.resolve(factory()).finally(() => inflight.delete(key));
    inflight.set(key, req);
  }
  return inflight.get(key);
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

/* Renders the photo directly (keyed by URL so a new upload always remounts),
   and falls back to the initials Avatar if the image is missing or fails. */
function ProfileAvatar({ name, src, size }) {
  const [failedSrc, setFailedSrc] = useState('');
  if (!src || failedSrc === src) return <Avatar name={name} size={size} />;
  return (
    <img
      key={src}
      className="sp-photo"
      src={src}
      alt={`${name} profile photo`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      onError={() => setFailedSrc(src)}
    />
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="sp-stat">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <div>
        <div className="sp-stat-num">{value}</div>
        <div className="sp-stat-lbl">{label}</div>
      </div>
    </div>
  );
}

function EditTrigger({ children, className = 'cx-btn cx-btn-outline cx-btn-sm' }) {
  return (
    <button type="button" className={className} data-bs-toggle="modal" data-bs-target="#editProfileModal">
      {children}
    </button>
  );
}

function Empty({ icon, text, action }) {
  return (
    <div className="sp-empty">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <p className="cx-small mb-0">{text}</p>
      {action}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <div className="cx-skel sp-skel-hero" />
      <div className="sp-stats">
        {[0, 1, 2].map((i) => <div key={i} className="cx-skel sp-skel-stat" />)}
      </div>
      <div className="row g-4">
        <div className="col-lg-8"><div className="cx-skel sp-skel-block" /></div>
        <div className="col-lg-4"><div className="cx-skel sp-skel-block" /></div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [pwdForm, setPwdForm] = useState(EMPTY_PASSWORD_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // null = not available / not loaded yet
  const [projects, setProjects] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsFailed, setProjectsFailed] = useState(false);
  const projectsSupported = typeof projectService.mine === 'function';

  /* ---------------- AUTH CONTEXT SYNC ---------------- */

  const updateAuthUser = (p) => {
    if (!setUser) return;
    setUser((prev) => ({
      ...(prev || {}),
      first_name: p.first_name,
      middle_name: p.middle_name,
      last_name: p.last_name,
      name: [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' '),
      email: p.email,
      college_id: p.college_id,
      course: p.course,
      batch_start: p.batch_start,
      batch_end: p.batch_end,
      skills: p.skills,
      bio: p.bio,
      github_url: p.github,
      linkedin_url: p.linkedin,
      leetcode_url: p.leetcode,
      gfg_url: p.gfg,
      profile_photo: p.profile_photo,
    }));
  };

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    dedupe('student-profile', () => api.get('/auth/student/profile/'))
      .then((response) => {
        if (cancelled) return;
        const normalized = normalizeProfile(response.data);
        setProfile(normalized);
        setEditForm(profileToEditForm(normalized));
        updateAuthUser(normalized);
      })
      .catch((error) => {
        if (cancelled) return;
        const msg = getErrorMessage(error, 'Could not load your profile information.');
        setLoadError(msg);
        toastRef.current(msg, 'error');
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  /* ---------------- LOAD PROJECTS (independent) ---------------- */

  useEffect(() => {
    if (!projectsSupported) return undefined;
    let cancelled = false;
    setProjectsLoading(true);
    setProjectsFailed(false);

    dedupe('my-projects', fetchMyProjects)
      .then((res) => !cancelled && setProjects(toProjectList(res?.data)))
      .catch(() => !cancelled && setProjectsFailed(true))
      .finally(() => !cancelled && setProjectsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [projectsSupported, attempt]);

  /* ---------------- MODAL RESET ON CLOSE ---------------- */

  useEffect(() => {
    const editEl = document.getElementById('editProfileModal');
    const pwdEl = document.getElementById('changePwdModal');
    if (!editEl || !pwdEl) return undefined;

    const onEditHidden = () => {
      setEditForm(profileToEditForm(profileRef.current));
      setProfilePhoto(null);
    };
    const onPwdHidden = () => setPwdForm(EMPTY_PASSWORD_FORM);

    editEl.addEventListener('hidden.bs.modal', onEditHidden);
    pwdEl.addEventListener('hidden.bs.modal', onPwdHidden);
    return () => {
      editEl.removeEventListener('hidden.bs.modal', onEditHidden);
      pwdEl.removeEventListener('hidden.bs.modal', onPwdHidden);
    };
  }, [loading, loadError]);

  /* ---------------- PHOTO PREVIEW ---------------- */

  useEffect(() => {
    if (!profilePhoto) {
      setPhotoPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(profilePhoto);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePhoto]);

  /* ---------------- HANDLERS ---------------- */

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!PHOTO_TYPES.includes(file.type)) {
      toast('Please select a JPG, PNG or WEBP image.', 'error');
      event.target.value = '';
      return;
    }
    if (file.size > PHOTO_MAX) {
      toast('Profile picture must be less than 2 MB.', 'error');
      event.target.value = '';
      return;
    }
    setProfilePhoto(file);
  };

  const handleProfileChange = (event) => {
    const { id, value } = event.target;
    setEditForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (savingProfile) return;

    // Client-side check; backend validation still applies.
    const badLink = SOCIAL_FIELDS.find(({ key }) => editForm[key] && !safeUrl(editForm[key]));
    if (badLink) {
      toast(`${badLink.label} must be a full http(s) link.`, 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('bio', editForm.bio);
      formData.append('github_url', editForm.github);
      formData.append('linkedin_url', editForm.linkedin);
      formData.append('leetcode_url', editForm.leetcode);
      formData.append('gfg_url', editForm.gfg);
      if (profilePhoto) formData.append('profile_photo', profilePhoto);

      const response = await api.patch('/auth/student/profile/', formData);

      const updated = normalizeProfile(response.data);
      setProfile(updated);
      setEditForm(profileToEditForm(updated));
      updateAuthUser(updated);
      setProfilePhoto(null);

      const el = document.getElementById('editProfileModal');
      if (el) Modal.getOrCreateInstance(el).hide();

      toast('Profile updated successfully!', 'success');
    } catch (error) {
      toast(getErrorMessage(error, 'Could not update your profile.'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { id, value } = event.target;
    setPwdForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (savingPwd) return;

    // Passwords are never trimmed: spaces can be part of a password.
    const { current, next, confirm } = pwdForm;

    if (!current) return toast('Please enter your current password.', 'error');
    if (next.length < 8) return toast('New password must contain at least 8 characters.', 'error');
    if (next !== confirm) return toast('New password and confirm password do not match.', 'error');

    setSavingPwd(true);
    try {
      const response = await authService.changePassword({
        user_type: user?.role || 'student',
        current_password: current,
        new_password: next,
      });

      const el = document.getElementById('changePwdModal');
      if (el) Modal.getOrCreateInstance(el).hide();
      setPwdForm(EMPTY_PASSWORD_FORM);

      toast(response?.data?.detail || response?.data?.message || 'Password updated successfully!', 'success');
    } catch (error) {
      toast(getErrorMessage(error, 'Could not update your password.'), 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  /* ---------------- STATES ---------------- */

  if (loading) return <ProfileSkeleton />;

  if (loadError) {
    return (
      <div className="cx-empty" role="alert">
        <div className="cx-empty-icon"><i className="bi bi-exclamation-circle" aria-hidden="true" /></div>
        <h2 className="cx-h3">Couldn&rsquo;t load your profile</h2>
        <p className="cx-small mb-3">{loadError}</p>
        <button type="button" className="cx-btn cx-btn-primary" onClick={() => setAttempt((n) => n + 1)}>
          Retry
        </button>
      </div>
    );
  }

  /* ---------------- DERIVED ---------------- */

  const displayName =
    [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    'Student';
  const avatarName = profile.first_name || displayName;

  const batch =
    profile.batch_start && profile.batch_end
      ? `${profile.batch_start} – ${profile.batch_end}`
      : profile.batch_start || profile.batch_end || '';
  const subline = [profile.course, batch && `Batch ${batch}`].filter(Boolean).join(' · ');

  const skills = uniqueList(profile.skills);
  const links = SOCIAL_FIELDS.map((f) => ({ ...f, url: safeUrl(profile[f.key]) })).filter((l) => l.url);

  const techUsed = projects ? uniqueList(projects.flatMap((p) => toTechList(p.technologies))) : [];

  // Profile completion: five equally weighted, visible checks.
  const completion = [
    { label: 'Profile photo', done: Boolean(profile.profile_photo) },
    { label: 'Bio', done: Boolean(profile.bio.trim()) },
    { label: 'Skills', done: skills.length > 0 },
    { label: 'At least one professional link', done: links.length > 0 },
    { label: 'Course and batch', done: Boolean(profile.course && profile.batch_start && profile.batch_end) },
  ];
  const doneCount = completion.filter((c) => c.done).length;
  const percent = Math.round((doneCount / completion.length) * 100);

  const showProjects = projectsSupported;
  const projectsReady = projects !== null;

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {/* ============ HERO ============ */}
      <header className="cx-hero sp-hero">
        <div className="sp-avatar">
          <ProfileAvatar name={avatarName} src={profile.profile_photo} size={96} />
          <button
            type="button"
            className="sp-avatar-btn"
            aria-label="Change profile photo"
            data-bs-toggle="modal"
            data-bs-target="#editProfileModal"
          >
            <i className="bi bi-camera" aria-hidden="true" />
          </button>
        </div>

        <div className="sp-identity">
          <div className="sp-name-row">
            <h1 className="sp-name">{displayName}</h1>
            <span className="cx-badge">Student</span>
          </div>

          {subline && <p className="sp-sub">{subline}</p>}

          <ul className="sp-meta">
            {profile.college_id && (
              <li><i className="bi bi-person-badge" aria-hidden="true" />ID {profile.college_id}</li>
            )}
            {profile.email && (
              <li><i className="bi bi-envelope" aria-hidden="true" />{profile.email}</li>
            )}
          </ul>

          {links.length > 0 && (
            <div className="sp-hero-links">
              {links.map(({ key, icon, label, url }) => (
                <a key={key} href={url.href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} title={label}>
                  <i className={`bi ${icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="sp-hero-actions">
          <button type="button" className="cx-btn cx-btn-primary" data-bs-toggle="modal" data-bs-target="#editProfileModal">
            <i className="bi bi-pencil me-1" aria-hidden="true" />Edit profile
          </button>
          <button type="button" className="cx-btn cx-btn-outline" data-bs-toggle="modal" data-bs-target="#changePwdModal">
            <i className="bi bi-key me-1" aria-hidden="true" />Change password
          </button>
        </div>
      </header>

      {/* ============ STATS (real data only) ============ */}
      <section className="sp-stats" aria-label="Profile statistics">
        {projectsReady && <Stat icon="bi-folder2-open" value={projects.length} label={projects.length === 1 ? 'Project' : 'Projects'} />}
        {projectsReady && <Stat icon="bi-stack" value={techUsed.length} label="Technologies in projects" />}
        <Stat icon="bi-lightning-charge" value={skills.length} label={skills.length === 1 ? 'Skill' : 'Skills'} />
      </section>

      <div className="row g-4">
        {/* ============ MAIN ============ */}
        <div className="col-lg-8">
          <section className="cx-card sp-card" aria-labelledby="sp-about-h">
            <div className="sp-card-head">
              <h2 id="sp-about-h" className="cx-h3">About</h2>
              {profile.bio && <EditTrigger>Edit</EditTrigger>}
            </div>
            {profile.bio ? (
              <p className="cx-body sp-prose">{profile.bio}</p>
            ) : (
              <Empty icon="bi-person-lines-fill" text="Add a short bio so faculty and peers know who you are." action={<EditTrigger>Add bio</EditTrigger>} />
            )}
          </section>

          <section className="cx-card sp-card" aria-labelledby="sp-skills-h">
            <h2 id="sp-skills-h" className="cx-h3 mb-3">Skills</h2>
            {skills.length > 0 ? (
              <div className="cx-tech-row">
                {skills.map((s) => <span className="cx-badge cx-badge-primary" key={s}>{s}</span>)}
              </div>
            ) : (
              <Empty icon="bi-lightning-charge" text="No skills added yet." />
            )}
          </section>

          {showProjects && (
            <section className="sp-projects" aria-labelledby="sp-proj-h">
              <div className="sp-card-head">
                <h2 id="sp-proj-h" className="cx-h3">Projects</h2>
                {projectsReady && projects.length > PROJECTS_PREVIEW && (
                  <Link to="/student/projects" className="cx-small cx-link">View all projects</Link>
                )}
              </div>

              {projectsLoading ? (
                <div className="sp-grid">
                  {[0, 1].map((i) => <div key={i} className="cx-skel sp-skel-card" />)}
                </div>
              ) : projectsFailed ? (
                <div className="cx-card sp-card">
                  <Empty
                    icon="bi-exclamation-triangle"
                    text="Your projects couldn’t be loaded."
                    action={<button type="button" className="cx-btn cx-btn-outline cx-btn-sm" onClick={() => setAttempt((n) => n + 1)}>Retry</button>}
                  />
                </div>
              ) : projectsReady && projects.length > 0 ? (
                <div className="sp-grid">
                  {projects.slice(0, PROJECTS_PREVIEW).map((p) => (
                    <ProjectCard key={p.id} project={p} hideWishlist />
                  ))}
                </div>
              ) : (
                <div className="cx-card sp-card">
                  <Empty icon="bi-folder2-open" text="You haven’t shared any projects yet." />
                </div>
              )}
            </section>
          )}
        </div>

        {/* ============ SIDEBAR ============ */}
        <aside className="col-lg-4">
          <section className="cx-glass sp-card" aria-labelledby="sp-comp-h">
            <div className="sp-card-head">
              <h2 id="sp-comp-h" className="cx-label mb-0">Profile completion</h2>
              <strong>{percent}%</strong>
            </div>
            <div className="cx-bar" role="progressbar" aria-label="Profile completion" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="cx-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <ul className="sp-checklist">
              {completion.map((c) => (
                <li key={c.label} className={c.done ? 'is-done' : ''}>
                  <i className={`bi ${c.done ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />
                  <span>{c.label}</span>
                  <span className="sp-sr">{c.done ? ' (complete)' : ' (missing)'}</span>
                </li>
              ))}
            </ul>
            <p className="sp-note">Based on these five items only. It does not mean your profile is verified.</p>
          </section>

          <section className="cx-card sp-card" aria-labelledby="sp-acad-h">
            <h2 id="sp-acad-h" className="cx-label mb-3">Academic information</h2>
            <dl className="sp-dl">
              {profile.course && (<><dt>Course</dt><dd>{profile.course}</dd></>)}
              {batch && (<><dt>Batch</dt><dd>{batch}</dd></>)}
              {profile.college_id && (<><dt>College ID</dt><dd>{profile.college_id}</dd></>)}
            </dl>
            {!profile.course && !batch && !profile.college_id && (
              <Empty icon="bi-mortarboard" text="No academic details on file." />
            )}
          </section>

          <section className="cx-card sp-card" aria-labelledby="sp-links-h">
            <h2 id="sp-links-h" className="cx-label mb-3">Professional links</h2>
            {links.length > 0 ? (
              <ul className="sp-links">
                {links.map(({ key, icon, label, url }) => (
                  <li key={key}>
                    <a href={url.href} target="_blank" rel="noopener noreferrer" title={url.href}>
                      <i className={`bi ${icon}`} aria-hidden="true" />
                      <span className="sp-link-text">
                        <strong>{label}</strong>
                        <small>{displayUrl(url)}</small>
                      </span>
                      <i className="bi bi-box-arrow-up-right" aria-label="opens in a new tab" role="img" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon="bi-link-45deg" text="No links added yet." action={<EditTrigger>Add links</EditTrigger>} />
            )}
          </section>
        </aside>
      </div>

      {/* ============ EDIT PROFILE MODAL ============ */}
      <div className="modal fade" id="editProfileModal" tabIndex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content sp-modal">
            <form onSubmit={handleSaveProfile}>
              <div className="modal-header">
                <h2 className="cx-h3 mb-0" id="editProfileModalLabel">Edit profile</h2>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
              </div>

              <div className="modal-body">
                <div className="cx-field sp-photo-field">
                  <ProfileAvatar name={avatarName} src={photoPreview || profile.profile_photo} size={64} />
                  <div className="flex-grow-1">
                    <label htmlFor="profilePhoto">Profile picture</label>
                    <input id="profilePhoto" type="file" className="cx-input" accept={PHOTO_TYPES.join(',')} onChange={handleProfilePhotoChange} />
                    <small className="cx-small">JPG, PNG or WEBP. Maximum 2 MB.</small>
                  </div>
                </div>

                <div className="cx-field">
                  <label htmlFor="bio">Bio</label>
                  <textarea id="bio" className="cx-input" rows={4} value={editForm.bio} onChange={handleProfileChange} placeholder="Tell something about yourself..." maxLength={BIO_MAX} />
                  <small className="cx-small d-block text-end">{editForm.bio.length}/{BIO_MAX}</small>
                </div>

                <div className="cx-field">
                  <label htmlFor="github">GitHub</label>
                  <input id="github" type="url" className="cx-input" value={editForm.github} onChange={handleProfileChange} placeholder="https://github.com/username" />
                </div>
                <div className="cx-field">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <input id="linkedin" type="url" className="cx-input" value={editForm.linkedin} onChange={handleProfileChange} placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="cx-field">
                  <label htmlFor="leetcode">LeetCode</label>
                  <input id="leetcode" type="url" className="cx-input" value={editForm.leetcode} onChange={handleProfileChange} placeholder="https://leetcode.com/username" />
                </div>
                <div className="cx-field mb-0">
                  <label htmlFor="gfg">GeeksForGeeks</label>
                  <input id="gfg" type="url" className="cx-input" value={editForm.gfg} onChange={handleProfileChange} placeholder="https://www.geeksforgeeks.org/user/username" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cx-btn cx-btn-outline" data-bs-dismiss="modal" disabled={savingProfile}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ============ CHANGE PASSWORD MODAL ============ */}
      <div className="modal fade" id="changePwdModal" tabIndex="-1" aria-labelledby="changePwdModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content sp-modal">
            <form onSubmit={handleChangePassword}>
              <div className="modal-header">
                <h2 className="cx-h3 mb-0" id="changePwdModalLabel">Change password</h2>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
              </div>

              <div className="modal-body">
                <div className="cx-field">
                  <label htmlFor="current">Current password</label>
                  <input id="current" type="password" className="cx-input" value={pwdForm.current} onChange={handlePasswordChange} autoComplete="current-password" required />
                </div>
                <div className="cx-field">
                  <label htmlFor="next">New password</label>
                  <input id="next" type="password" className="cx-input" value={pwdForm.next} onChange={handlePasswordChange} minLength={8} autoComplete="new-password" required />
                  <small className="cx-small">Minimum 8 characters.</small>
                </div>
                <div className="cx-field mb-0">
                  <label htmlFor="confirm">Confirm new password</label>
                  <input id="confirm" type="password" className="cx-input" value={pwdForm.confirm} onChange={handlePasswordChange} minLength={8} autoComplete="new-password" required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cx-btn cx-btn-outline" data-bs-dismiss="modal" disabled={savingPwd}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn-primary" disabled={savingPwd}>
                  {savingPwd ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
