// import { useEffect, useState } from 'react';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { Avatar, Badge, Rating } from '../../components/Badge/Badge';
// import { ScoreRing } from '../../components/ScoreCard/ScoreCard';

// import { useAuth } from '../../context/AuthContext';
// import { useToast } from '../../context/ToastContext';
// import { projectService } from '../../services/projectService';

// function scoreColor(v) {
//   return v >= 75
//     ? 'var(--c-success)'
//     : v >= 50
//       ? 'var(--c-warning)'
//       : 'var(--c-danger)';
// }

// const DOMAIN_VARIANT = {
//   'AI / ML': 'accent',
//   'Web Development': 'primary',
//   'Cyber Security': 'danger',
//   IoT: 'info',
//   'Data Science': 'success',
//   'Cloud Computing': 'info',
//   'Mobile Application': 'primary',
//   'Software Development': 'warning',
// };

// /* =========================================================
//    FEEDBACK FORM
// ========================================================= */
// function FeedbackForm({ projectId, onSubmitted }) {
//   const { toast } = useToast();

//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [recommendation, setRecommendation] = useState('');

//   const [submittingFeedback, setSubmittingFeedback] = useState(false);
//   const [submittingRec, setSubmittingRec] = useState(false);

//   async function submitFeedback(e) {
//     e.preventDefault();

//     if (rating === 0 || !feedback.trim()) {
//       toast('Please add a rating and feedback text.', 'error');
//       return;
//     }

//     setSubmittingFeedback(true);

//     try {
//       const res = await projectService.feedback.submit(projectId, {
//         rating,
//         feedback,
//       });

//       toast('Feedback submitted successfully.');

//       setRating(0);
//       setFeedback('');

//       onSubmitted?.(res.data);
//     } catch (err) {
//       toast(err.message || 'Could not submit feedback.', 'error');
//     } finally {
//       setSubmittingFeedback(false);
//     }
//   }

//   async function submitRecommendation() {
//     if (!recommendation.trim()) {
//       toast('Please write a recommendation first.', 'error');
//       return;
//     }

//     setSubmittingRec(true);

//     try {
//       const res = await projectService.feedback.submit(projectId, {
//         recommendation,
//       });

//       toast('Recommendation submitted.');

//       setRecommendation('');

//       onSubmitted?.(res.data);
//     } catch (err) {
//       toast(err.message || 'Could not submit recommendation.', 'error');
//     } finally {
//       setSubmittingRec(false);
//     }
//   }

//   return (
//     <div className="cx-card p-4 p-lg-5 mt-4">
//       <h3 className="cx-h3 mb-4">Give Feedback & Recommendation</h3>

//       <form onSubmit={submitFeedback}>
//         {/* Rating */}
//         <div className="cx-field">
//           <label>
//             Rating <span className="req">*</span>
//           </label>

//           <Rating value={rating} onChange={setRating} />
//         </div>

//         {/* Feedback */}
//         <div className="cx-field">
//           <label htmlFor="feedbackText">
//             Feedback <span className="req">*</span>
//           </label>

//           <textarea
//             id="feedbackText"
//             className="cx-input"
//             rows={3}
//             placeholder="Share constructive feedback on the project's approach, execution, and areas to improve..."
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//           />
//         </div>

//         {/* Recommendation */}
//         <div className="cx-field">
//           <label htmlFor="recText">
//             Recommendation <span className="req">*</span>
//           </label>

//           <textarea
//             id="recText"
//             className="cx-input"
//             rows={2}
//             placeholder="e.g. Recommended for department showcase"
//             value={recommendation}
//             onChange={(e) => setRecommendation(e.target.value)}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="d-flex gap-3">
//           <button
//             type="submit"
//             className="cx-btn cx-btn-primary"
//             disabled={submittingFeedback}
//           >
//             {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
//           </button>

//           <button
//             type="button"
//             className="cx-btn cx-btn-outline"
//             onClick={submitRecommendation}
//             disabled={submittingRec}
//           >
//             {submittingRec ? 'Submitting…' : 'Submit Recommendation'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// /* =========================================================
//    PROJECT DETAILS
// ========================================================= */

// export default function ProjectDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const { user } = useAuth();
//   const { toast } = useToast();

//   const isFaculty = user?.role === 'faculty';

//   /* =======================================================
//      STATE
//   ======================================================= */

//   const [loading, setLoading] = useState(true);

//   const [project, setProject] = useState(null);

//   // Always keep feedback as ARRAY
//   const [feedbackList, setFeedbackList] = useState([]);

//   const [inWishlist, setInWishlist] = useState(false);

//   /* =======================================================
//      LOAD PROJECT
//   ======================================================= */

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       setLoading(true);

//       try {
//         /* ---------------------------------------------------
//            PROJECT API
//            Project should load independently.
//         --------------------------------------------------- */

//         const projectRes = await projectService.detail(id);
//         if (cancelled) return;

//         console.log('PROJECT ID:', id);

//         console.log('PROJECT API RESPONSE:', projectRes);

//         console.log('PROJECT DATA:', projectRes.data);

//         setProject(projectRes.data);

//         setInWishlist(Boolean(projectRes.data?.in_wishlist));

//         /* ---------------------------------------------------
//            FEEDBACK API
//            Feedback should NOT break project page.
//         --------------------------------------------------- */

//         try {
//           const feedbackRes = await projectService.feedback.listForProject(id);

//           if (cancelled) return;

//           console.log('FEEDBACK DATA:', feedbackRes.data);

//           const data = feedbackRes.data;

//           /*
//              Backend can return:

//              []
//              ""
//              { results: [] }

//              We always convert it to an ARRAY.
//           */

//           if (Array.isArray(data)) {
//             setFeedbackList(data);
//           } else if (data && Array.isArray(data.results)) {
//             setFeedbackList(data.results);
//           } else {
//             // No feedback
//             setFeedbackList([]);
//           }
//         } catch (feedbackError) {
//           console.error('FEEDBACK LOAD ERROR:', feedbackError);

//           /*
//              Feedback failure should NOT
//              hide project details.
//           */

//           setFeedbackList([]);
//         }
//       } catch (err) {
//         console.error('PROJECT LOAD ERROR:', err);

//         if (!cancelled) {
//           toast(err.message || 'Could not load this project.', 'error');
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     load();

//     return () => {
//       cancelled = true;
//     };
//   }, [id, toast]);

//   /* =======================================================
//      WISHLIST
//   ======================================================= */

//   async function toggleWishlist() {
//     try {
//       if (inWishlist) {
//         await projectService.wishlist.remove(project.id);

//         setInWishlist(false);

//         toast('Removed from wishlist.');
//       } else {
//         await projectService.wishlist.add(project.id);

//         setInWishlist(true);

//         toast('Saved to wishlist.');
//       }
//     } catch (err) {
//       toast(err.message || 'Could not update your wishlist.', 'error');
//     }
//   }

//   /* =======================================================
//      FEEDBACK SUBMITTED
//   ======================================================= */

//   function handleFeedbackSubmitted(newEntry) {
//     /*
//        If backend returns an object,
//        add it to the beginning.

//        If backend returns something invalid,
//        don't break UI.
//     */

//     if (newEntry && typeof newEntry === 'object' && !Array.isArray(newEntry)) {
//       setFeedbackList((prev) => [newEntry, ...prev]);
//     }
//   }

//   /* =======================================================
//      LOADING
//   ======================================================= */

//   if (loading) {
//     return (
//       <div className="row g-4">
//         <div className="col-lg-8">
//           <div
//             className="cx-skel"
//             style={{
//               height: 280,
//               marginBottom: 24,
//             }}
//           />

//           <div
//             className="cx-skel"
//             style={{
//               height: 160,
//             }}
//           />
//         </div>

//         <div className="col-lg-4">
//           <div
//             className="cx-skel"
//             style={{
//               height: 320,
//             }}
//           />
//         </div>
//       </div>
//     );
//   }

//   /* =======================================================
//      PROJECT NOT FOUND
//   ======================================================= */

//   if (!project) {
//     return (
//       <div className="cx-empty">
//         <div className="cx-empty-icon">
//           <i className="bi bi-exclamation-circle"></i>
//         </div>

//         <h3 className="cx-h3">Project not found</h3>

//         <p className="cx-small mb-3">
//           It may have been removed, or the link is incorrect.
//         </p>

//         <button className="cx-btn cx-btn-outline" onClick={() => navigate(-1)}>
//           Go back
//         </button>
//       </div>
//     );
//   }

//   const p = project;

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <>
//       {/* Back Button */}

//       <button
//         onClick={() => navigate(-1)}
//         className="cx-small cx-link mb-3 d-inline-flex align-items-center gap-1 border-0 bg-transparent p-0"
//       >
//         <i className="bi bi-arrow-left"></i>
//         Back to results
//       </button>

//       {/* ===================================================
//           HEADER
//       =================================================== */}

//       <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
//         <div>
//           <Badge variant={DOMAIN_VARIANT[p.domain] || 'default'}>{p.domain}</Badge>

//           <h1 className="cx-h1 mt-2 mb-2">{p.title}</h1>

//           <div className="d-flex align-items-center gap-2 flex-wrap">
//             <Avatar name={p.owner_name || 'Student'} size={32} />

//             <span
//               className="cx-small mb-0"
//               style={{
//                 color: 'var(--c-ink)',
//                 fontWeight: 600,
//               }}
//             >
//               {p.owner_name || 'Unknown Student'}
//             </span>

//             <span className="cx-caption">
//               &middot; {p.course} &middot; Batch {p.batch}
//             </span>
//           </div>
//         </div>

//         {/* Header Buttons */}

//         <div className="d-flex gap-2">
//           {!isFaculty && (
//             <button className="cx-btn cx-btn-outline" onClick={toggleWishlist}>
//               <i
//                 className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`}
//                 style={{
//                   color: inWishlist ? 'var(--c-danger)' : 'inherit',
//                 }}
//               ></i>

//               {inWishlist ? 'Saved' : 'Save'}
//             </button>
//           )}

//           <button
//             className="cx-btn cx-btn-primary"
//             onClick={() => {
//               navigator.clipboard?.writeText(window.location.href);

//               toast('Link copied to clipboard.');
//             }}
//           >
//             <i className="bi bi-share"></i>
//             Share
//           </button>
//         </div>
//       </div>

//       {/* ===================================================
//           MAIN CONTENT
//       =================================================== */}

//       <div className="row g-4">
//         <div className="col-lg-8">
//           {/* =================================================
//               PROJECT IMAGES
//           ================================================= */}

//           {p.images?.length > 0 && (
//             <div className="cx-card p-2 mb-4">
//               <div className="row g-2">
//                 {p.images.map((img, i) => (
//                   <div
//                     className={`col-4 col-md-${i === 0 ? '12' : '4'}`}
//                     key={img.id ?? i}
//                   >
//                     <div
//                       style={{
//                         aspectRatio: i === 0 ? '16/8' : '1',

//                         borderRadius: 'var(--r-sm)',

//                         overflow: 'hidden',
//                       }}
//                     >
//                       <img
//                         src={img.image ?? img}
//                         alt={`${p.title} screenshot ${i + 1}`}
//                         style={{
//                           width: '100%',
//                           height: '100%',
//                           objectFit: 'cover',
//                         }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* =================================================
//               ABOUT PROJECT
//           ================================================= */}

//           <div className="cx-card p-4 p-lg-5 mb-4">
//             <h3 className="cx-h3 mb-3">About this project</h3>

//             <p className="cx-body">{p.description}</p>

//             <div className="cx-tech-row mt-3">
//               {Array.isArray(p.technologies) &&
//                 p.technologies.map((technology) => (
//                   <Badge key={technology} variant="primary">
//                     {technology}
//                   </Badge>
//                 ))}
//             </div>
//           </div>

//           {/* =================================================
//               DOCUMENTATION & MEDIA
//           ================================================= */}

//           {(p.documentation || p.screen_recording) && (
//             <div className="cx-card p-4 p-lg-5 mb-4">
//               <h3 className="cx-h3 mb-3">Documentation & Media</h3>

//               <div className="row g-3">
//                 {/* Documentation */}

//                 {p.documentation && (
//                   <div className="col-md-6">
//                     <a
//                       href={p.documentation}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="d-flex align-items-center gap-3 p-3 text-decoration-none"
//                       style={{
//                         border: '1px solid var(--c-border-soft)',

//                         borderRadius: 'var(--r-sm)',
//                       }}
//                     >
//                       <i
//                         className="bi bi-file-earmark-pdf"
//                         style={{
//                           fontSize: '1.4rem',
//                           color: 'var(--c-danger)',
//                         }}
//                       ></i>

//                       <div className="flex-grow-1">
//                         <div
//                           className="cx-small mb-0"
//                           style={{
//                             fontWeight: 600,
//                             color: 'var(--c-ink)',
//                           }}
//                         >
//                           Project Documentation
//                         </div>

//                         <div className="cx-caption">PDF</div>
//                       </div>

//                       <i className="bi bi-download cx-link"></i>
//                     </a>
//                   </div>
//                 )}

//                 {/* Screen Recording */}

//                 {p.screen_recording && (
//                   <div className="col-md-6">
//                     <a
//                       href={p.screen_recording}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="d-flex align-items-center gap-3 p-3 text-decoration-none"
//                       style={{
//                         border: '1px solid var(--c-border-soft)',

//                         borderRadius: 'var(--r-sm)',
//                       }}
//                     >
//                       <i
//                         className="bi bi-play-circle-fill"
//                         style={{
//                           fontSize: '1.4rem',
//                           color: 'var(--c-primary)',
//                         }}
//                       ></i>

//                       <div className="flex-grow-1">
//                         <div
//                           className="cx-small mb-0"
//                           style={{
//                             fontWeight: 600,
//                             color: 'var(--c-ink)',
//                           }}
//                         >
//                           Screen Recording
//                         </div>

//                         <div className="cx-caption">Video</div>
//                       </div>

//                       <i className="bi bi-play cx-link"></i>
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* =================================================
//               FACULTY FEEDBACK
//           ================================================= */}

//           <div className="cx-card p-4 p-lg-5">
//             <h3 className="cx-h3 mb-4">Faculty Feedback</h3>

//             {feedbackList.length > 0 ? (
//               feedbackList.map((f, index) => (
//                 <div
//                   className="d-flex gap-3 mb-4 pb-4"
//                   style={{
//                     borderBottom: '1px solid var(--c-border-soft)',
//                   }}
//                   key={f.id ?? index}
//                 >
//                   <Avatar name={f.faculty_name ?? f.faculty ?? 'Faculty'} size={40} />

//                   <div className="flex-grow-1">
//                     <div className="d-flex justify-content-between flex-wrap gap-2">
//                       <span
//                         className="cx-small mb-0"
//                         style={{
//                           fontWeight: 650,
//                           color: 'var(--c-ink)',
//                         }}
//                       >
//                         {f.faculty_name ?? f.faculty ?? 'Faculty'}
//                       </span>

//                       {f.rating > 0 && <Rating value={f.rating} readOnly />}
//                     </div>

//                     {f.feedback && <p className="cx-small my-2">{f.feedback}</p>}

//                     {f.recommendation && (
//                       <Badge variant="success" icon="bi-award">
//                         {f.recommendation}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               /*
//                  No feedback:
//                  ONLY this section shows empty state.
//                  Other project details remain visible.
//               */

//               <div className="text-center py-3">
//                 <i
//                   className="bi bi-chat-square-text"
//                   style={{
//                     fontSize: '2rem',
//                     opacity: 0.5,
//                   }}
//                 ></i>

//                 <p className="cx-small mb-0 mt-2">No feedback yet.</p>
//               </div>
//             )}
//           </div>

//           {/* =================================================
//               FACULTY FEEDBACK FORM
//           ================================================= */}

//           {isFaculty && (
//             <FeedbackForm projectId={p.id} onSubmitted={handleFeedbackSubmitted} />
//           )}
//         </div>

//         {/* ===================================================
//             RIGHT SIDEBAR
//         =================================================== */}

//         <div className="col-lg-4">
//           {/* Score Overview */}

//           <div
//             className="cx-glass p-4 mb-3"
//             style={{
//               position: 'sticky',
//               top: 'calc(var(--topbar-h) + 20px)',
//             }}
//           >
//             <div className="cx-label mb-3">Score Overview</div>

//             <div className="d-flex justify-content-around text-center mb-2">
//               <ScoreRing value={p.innovation} size={78} stroke={7} />

//               <ScoreRing value={p.originality} size={78} stroke={7} />
//             </div>

//             <div className="d-flex justify-content-around text-center">
//               <div className="cx-caption">Innovation</div>

//               <div className="cx-caption">Originality</div>
//             </div>

//             <hr
//               style={{
//                 borderColor: 'var(--c-border-soft)',
//               }}
//             />

//             <div className="d-flex justify-content-between align-items-center mb-2">
//               <span className="cx-small mb-0">Similarity Score</span>

//               <span
//                 className="cx-badge"
//                 style={{
//                   color: scoreColor(100 - p.similarity),
//                 }}
//               >
//                 {p.similarity}%
//               </span>
//             </div>

//             <div className="cx-bar">
//               <div
//                 className="cx-bar-fill"
//                 style={{
//                   width: `${p.similarity}%`,
//                   background: scoreColor(100 - p.similarity),
//                 }}
//               />
//             </div>
//           </div>

//           {/* About Student */}

//           <div className="cx-card p-4">
//             <div className="cx-label mb-3">About the Student</div>

//             <div className="d-flex align-items-center gap-3 mb-3">
//               <Avatar name={p.owner_name || 'Student'} size={44} />

//               <div>
//                 <div
//                   className="cx-small mb-0"
//                   style={{
//                     fontWeight: 650,
//                     color: 'var(--c-ink)',
//                   }}
//                 >
//                   {p.owner_name || 'Unknown Student'}
//                 </div>

//                 <div className="cx-caption">
//                   {p.course} &middot; {p.batch}
//                 </div>
//               </div>
//             </div>

//             {p.student?.id && (
//               <Link
//                 to={`/faculty/students/${p.student.id}`}
//                 className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm"
//               >
//                 View Profile
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Rating } from '../../components/Badge/Badge';
import { ScoreRing } from '../../components/ScoreCard/ScoreCard';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
import '../../styles/ProjectDetails.css';

const DOMAIN_VARIANT = {
  'AI / ML': 'accent',
  'Web Development': 'primary',
  'Cyber Security': 'danger',
  'IoT': 'info',
  'Data Science': 'success',
  'Cloud Computing': 'info',
  'Mobile Application': 'primary',
  'Software Development': 'warning',
};

/* =========================================================
   HELPERS (pure, outside render)
========================================================= */

function scoreColor(v) {
  return v >= 75
    ? 'var(--c-success)'
    : v >= 50
      ? 'var(--c-warning)'
      : 'var(--c-danger)';
}

// 0-100 number, or null when the API did not send a usable value.
function toScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : null;
}

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

// Array or comma-separated string -> de-duplicated list, original names kept.
function toTechList(value) {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  return [...new Set(list.map((t) => String(t).trim()).filter(Boolean))];
}

// images: [url] | [{id, image}] | [{url}]
function toImageList(images) {
  if (!Array.isArray(images)) return [];
  const seen = new Set();
  return images
    .map((img) => (typeof img === 'string' ? img : img?.image || img?.url))
    .filter((src) => typeof src === 'string' && src && !seen.has(src) && seen.add(src));
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : dateFormat.format(d);
}

function isNotFound(err) {
  return err?.status === 404 || err?.response?.status === 404;
}

/*
  One in-flight request per project id. React Strict Mode runs effects twice
  in development; the second run shares the first run's promise instead of
  firing duplicate GETs. Cleared on settle, so Retry always fetches fresh.
*/
const inflight = new Map();

function fetchPage(id) {
  if (!inflight.has(id)) {
    const req = Promise.allSettled([
      projectService.detail(id),
      projectService.feedback.listForProject(id),
    ]).finally(() => inflight.delete(id));
    inflight.set(id, req);
  }
  return inflight.get(id);
}

/* =========================================================
   GALLERY
========================================================= */

function Gallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(() => new Set());

  const markFailed = (src) =>
    setFailed((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  const current = images[active];
  const showImage = current && !failed.has(current);

  return (
    <div className="pd-gallery">
      <div className="pd-gallery-main">
        {showImage ? (
          <img
            key={current}
            src={current}
            alt={`${title} screenshot ${active + 1}`}
            decoding="async"
            onError={() => markFailed(current)}
          />
        ) : (
          <div className="pd-placeholder" role="img" aria-label="Image unavailable">
            <i className="bi bi-image" aria-hidden="true" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="pd-thumbs" aria-label="Project screenshots">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                className="pd-thumb"
                aria-label={`Show screenshot ${i + 1}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                {failed.has(src) ? (
                  <i className="bi bi-image" aria-hidden="true" />
                ) : (
                  <img
                    src={src}
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => markFailed(src)}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================
   FEEDBACK FORM  (behaviour unchanged; adds pending guards)
========================================================= */

function FeedbackForm({ projectId, onSubmitted }) {
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingRec, setSubmittingRec] = useState(false);
  const busy = submittingFeedback || submittingRec;

  async function submitFeedback(e) {
    e.preventDefault();
    if (busy) return;

    if (rating === 0 || !feedback.trim()) {
      toast('Please add a rating and feedback text.', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await projectService.feedback.submit(projectId, { rating, feedback });
      toast('Feedback submitted successfully.');
      setRating(0);
      setFeedback('');
      onSubmitted?.(res.data);
    } catch (err) {
      toast(err.message || 'Could not submit feedback.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function submitRecommendation() {
    if (busy) return;

    if (!recommendation.trim()) {
      toast('Please write a recommendation first.', 'error');
      return;
    }

    setSubmittingRec(true);
    try {
      const res = await projectService.feedback.submit(projectId, { recommendation });
      toast('Recommendation submitted.');
      setRecommendation('');
      onSubmitted?.(res.data);
    } catch (err) {
      toast(err.message || 'Could not submit recommendation.', 'error');
    } finally {
      setSubmittingRec(false);
    }
  }

  return (
    <section className="cx-card p-4 p-lg-5 mt-4" aria-labelledby="pd-form-h">
      <h2 id="pd-form-h" className="cx-h3 mb-4">
        Give feedback &amp; recommendation
      </h2>

      <form onSubmit={submitFeedback}>
        <div className="cx-field">
          <label>
            Rating <span className="req">*</span>
          </label>
          <Rating value={rating} onChange={setRating} />
        </div>

        <div className="cx-field">
          <label htmlFor="feedbackText">
            Feedback <span className="req">*</span>
          </label>
          <textarea
            id="feedbackText"
            className="cx-input"
            rows={3}
            placeholder="Share constructive feedback on the project's approach, execution, and areas to improve..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="cx-field">
          <label htmlFor="recText">Recommendation</label>
          <textarea
            id="recText"
            className="cx-input"
            rows={2}
            placeholder="e.g. Recommended for department showcase"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          />
        </div>

        <div className="d-flex flex-wrap gap-3">
          <button type="submit" className="cx-btn cx-btn-primary" disabled={busy}>
            {submittingFeedback ? 'Submitting…' : 'Submit feedback'}
          </button>

          <button
            type="button"
            className="cx-btn cx-btn-outline"
            onClick={submitRecommendation}
            disabled={busy}
          >
            {submittingRec ? 'Submitting…' : 'Submit recommendation'}
          </button>
        </div>
      </form>
    </section>
  );
}

/* =========================================================
   SMALL PRESENTATIONAL PIECES
========================================================= */

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading project">
      <div className="cx-skel pd-skel-crumb" />
      <div className="cx-skel pd-skel-hero" />
      <div className="row g-4 mt-0">
        <div className="col-lg-8">
          <div className="cx-skel pd-skel-block" />
          <div className="cx-skel pd-skel-block mt-4" />
        </div>
        <div className="col-lg-4">
          <div className="cx-skel pd-skel-side" />
        </div>
      </div>
    </div>
  );
}

function ResourceLink({ href, icon, tint, title, hint, action }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="pd-resource">
      <i className={`bi ${icon}`} style={{ color: tint }} aria-hidden="true" />
      <span className="pd-resource-text">
        <strong>{title}</strong>
        <small>{hint}</small>
      </span>
      <i className={`bi ${action} cx-link`} aria-hidden="true" />
    </a>
  );
}

function RatingSummary({ ratings }) {
  const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
  const showDistribution = ratings.length >= 3;

  return (
    <div className="pd-rating-sum">
      <div className="pd-rating-avg">
        <span className="pd-rating-num">{avg.toFixed(1)}</span>
        <Rating value={Math.round(avg)} readOnly />
        <span className="cx-caption">
          {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
        </span>
      </div>

      {showDistribution && (
        <div className="pd-dist" aria-label="Rating distribution">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratings.filter((r) => Math.round(r) === star).length;
            return (
              <div className="pd-dist-row" key={star}>
                <span className="cx-caption">{star}</span>
                <div className="cx-bar">
                  <div
                    className="cx-bar-fill"
                    style={{ width: `${(count / ratings.length) * 100}%` }}
                  />
                </div>
                <span className="cx-caption">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROJECT DETAILS
========================================================= */

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { toast } = useToast();

  // toast may change identity on every notification; keeping it out of the
  // effect dependencies stops a toast from re-triggering the page fetch.
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const isFaculty = user?.role === 'faculty';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { message, notFound }
  const [attempt, setAttempt] = useState(0); // bump to retry
  const [project, setProject] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackFailed, setFeedbackFailed] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);

  /* ------------------------- LOAD ------------------------- */

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchPage(id).then(([projectRes, feedbackRes]) => {
      if (cancelled) return;

      if (projectRes.status === 'rejected') {
        const err = projectRes.reason;
        setProject(null);
        setError({
          message: err?.message || 'Could not load this project.',
          notFound: isNotFound(err),
        });
        toastRef.current(err?.message || 'Could not load this project.', 'error');
      } else {
        setProject(projectRes.value.data);
        setInWishlist(Boolean(projectRes.value.data?.in_wishlist));
      }

      // Feedback failing must never hide the project.
      if (feedbackRes.status === 'fulfilled') {
        setFeedbackList(toArray(feedbackRes.value.data));
        setFeedbackFailed(false);
      } else {
        setFeedbackList([]);
        setFeedbackFailed(true);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  /* ----------------------- ACTIONS ------------------------ */

  async function toggleWishlist() {
    if (wishlistPending) return;
    setWishlistPending(true);

    try {
      if (inWishlist) {
        await projectService.wishlist.remove(project.id);
        setInWishlist(false);
        toast('Removed from wishlist.');
      } else {
        await projectService.wishlist.add(project.id);
        setInWishlist(true);
        toast('Saved to wishlist.');
      }
    } catch (err) {
      toast(err.message || 'Could not update your wishlist.', 'error');
    } finally {
      setWishlistPending(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard.');
    } catch {
      toast('Could not copy the link.', 'error');
    }
  }

  function handleFeedbackSubmitted(newEntry) {
    if (newEntry && typeof newEntry === 'object' && !Array.isArray(newEntry)) {
      setFeedbackList((prev) => [newEntry, ...prev]);
    }
  }

  /* ------------------------ STATES ------------------------ */

  if (loading) return <PageSkeleton />;

  if (error?.notFound || (!project && !error)) {
    return (
      <div className="cx-empty">
        <div className="cx-empty-icon">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
        </div>
        <h2 className="cx-h3">Project not found</h2>
        <p className="cx-small mb-3">It may have been removed, or the link is incorrect.</p>
        <button type="button" className="cx-btn cx-btn-outline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cx-empty" role="alert">
        <div className="cx-empty-icon">
          <i className="bi bi-wifi-off" aria-hidden="true" />
        </div>
        <h2 className="cx-h3">Couldn&rsquo;t load this project</h2>
        <p className="cx-small mb-3">{error.message}</p>
        <div className="d-flex gap-2 justify-content-center">
          <button type="button" className="cx-btn cx-btn-primary" onClick={() => setAttempt((n) => n + 1)}>
            Retry
          </button>
          <button type="button" className="cx-btn cx-btn-outline" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------ DERIVED ----------------------- */

  const p = project;
  const images = toImageList(p.images);
  const technologies = toTechList(p.technologies);
  const innovation = toScore(p.innovation);
  const originality = toScore(p.originality);
  const similarity = toScore(p.similarity);
  const hasAnalysis = innovation !== null || originality !== null || similarity !== null;

  const ownerName = p.owner_name || 'Unknown Student';
  const courseBatch = [p.course, p.batch && `Batch ${p.batch}`].filter(Boolean);
  const created = formatDate(p.created_at);
  const ratings = feedbackList.map((f) => Number(f.rating)).filter((r) => r > 0);

  /* ------------------------ RENDER ------------------------ */

  return (
    <>
      <nav className="pd-crumbs" aria-label="Breadcrumb">
        <button type="button" className="pd-crumb-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Projects
        </button>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="pd-crumb-current">
          {p.title || 'Project details'}
        </span>
      </nav>

      {/* ============ HERO ============ */}
      <header className={`cx-glass pd-hero ${images.length ? 'pd-hero--media' : ''}`}>
        <div className="pd-hero-info">
          <div>
            {p.domain && (
              <Badge variant={DOMAIN_VARIANT[p.domain] || 'default'}>{p.domain}</Badge>
            )}
            <h1 className="pd-title">{p.title || 'Untitled Project'}</h1>

            <div className="pd-owner">
              <Avatar name={ownerName} size={32} />
              <span className="pd-owner-name">{ownerName}</span>
            </div>
          </div>

          {(courseBatch.length > 0 || created || ratings.length > 0) && (
            <ul className="pd-facts">
              {courseBatch.length > 0 && (
                <li>
                  <i className="bi bi-mortarboard" aria-hidden="true" />
                  {courseBatch.join(' · ')}
                </li>
              )}
              {created && (
                <li>
                  <i className="bi bi-calendar3" aria-hidden="true" />
                  {created}
                </li>
              )}
              {ratings.length > 0 && (
                <li>
                  <i className="bi bi-star-fill pd-star" aria-hidden="true" />
                  {(ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)} (
                  {ratings.length})
                </li>
              )}
            </ul>
          )}

          <div className="pd-actions">
            {!isFaculty && (
              <button
                type="button"
                className="cx-btn cx-btn-outline"
                onClick={toggleWishlist}
                disabled={wishlistPending}
                aria-pressed={inWishlist}
              >
                {wishlistPending ? (
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                ) : (
                  <i
                    className={`bi ${inWishlist ? 'bi-heart-fill pd-heart-on' : 'bi-heart'}`}
                    aria-hidden="true"
                  />
                )}{' '}
                {inWishlist ? 'Saved' : 'Save'}
              </button>
            )}

            <button type="button" className="cx-btn cx-btn-primary" onClick={handleShare}>
              <i className="bi bi-share" aria-hidden="true" /> Share
            </button>
          </div>
        </div>

        {images.length > 0 && <Gallery key={p.id} images={images} title={p.title || 'Project'} />}
      </header>

      <div className="row g-4">
        {/* ============ MAIN ============ */}
        <div className="col-lg-8">
          <section className="cx-card p-4 p-lg-5 mb-4" aria-labelledby="pd-about-h">
            <h2 id="pd-about-h" className="cx-h3 mb-3">
              About this project
            </h2>

            <p className="cx-body pd-prose">{p.description || 'No description available.'}</p>

            {technologies.length > 0 && (
              <>
                <h3 className="pd-subhead">Technologies</h3>
                <div className="cx-tech-row">
                  {technologies.map((t) => (
                    <Badge key={t} variant="primary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </section>

          {(p.documentation || p.screen_recording) && (
            <section className="cx-card p-4 p-lg-5 mb-4" aria-labelledby="pd-res-h">
              <h2 id="pd-res-h" className="cx-h3 mb-3">
                Documentation &amp; media
              </h2>

              <div className="row g-3">
                {p.documentation && (
                  <div className="col-md-6">
                    <ResourceLink
                      href={p.documentation}
                      icon="bi-file-earmark-pdf"
                      tint="var(--c-danger)"
                      title="Project documentation"
                      hint="Opens in a new tab"
                      action="bi-download"
                    />
                  </div>
                )}
                {p.screen_recording && (
                  <div className="col-md-6">
                    <ResourceLink
                      href={p.screen_recording}
                      icon="bi-play-circle-fill"
                      tint="var(--c-primary)"
                      title="Screen recording"
                      hint="Opens in a new tab"
                      action="bi-box-arrow-up-right"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="cx-card p-4 p-lg-5" aria-labelledby="pd-fb-h">
            <h2 id="pd-fb-h" className="cx-h3 mb-4">
              Faculty feedback
            </h2>

            {ratings.length > 0 && <RatingSummary ratings={ratings} />}

            {feedbackFailed ? (
              <div className="pd-empty" role="status">
                <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                <p className="cx-small mb-0">Feedback couldn&rsquo;t be loaded right now.</p>
                <button
                  type="button"
                  className="cx-btn cx-btn-outline cx-btn-sm mt-2"
                  onClick={() => setAttempt((n) => n + 1)}
                >
                  Retry
                </button>
              </div>
            ) : feedbackList.length > 0 ? (
              <ul className="pd-feedback-list">
                {feedbackList.map((f, index) => {
                  const name = f.faculty_name ?? f.faculty ?? 'Faculty';
                  return (
                    <li className="pd-feedback" key={f.id ?? index}>
                      <Avatar name={name} size={40} />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between flex-wrap gap-2">
                          <span className="pd-reviewer">{name}</span>
                          {f.rating > 0 && <Rating value={f.rating} readOnly />}
                        </div>

                        {f.feedback && <p className="cx-small my-2">{f.feedback}</p>}

                        {f.recommendation && (
                          <Badge variant="success" icon="bi-award">
                            {f.recommendation}
                          </Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="pd-empty">
                <i className="bi bi-chat-square-text" aria-hidden="true" />
                <p className="cx-small mb-0">No feedback yet.</p>
              </div>
            )}
          </section>

          {isFaculty && <FeedbackForm projectId={p.id} onSubmitted={handleFeedbackSubmitted} />}
        </div>

        {/* ============ SIDEBAR ============ */}
        <aside className="col-lg-4">
          <div className="pd-aside">
            {hasAnalysis && (
              <section className="cx-glass p-4" aria-labelledby="pd-ai-h">
                <h2 id="pd-ai-h" className="cx-label mb-3">
                  AI project analysis
                </h2>

                {(innovation !== null || originality !== null) && (
                  <div className="pd-rings">
                    {innovation !== null && (
                      <div className="pd-ring">
                        <ScoreRing value={innovation} size={78} stroke={7} />
                        <strong>Innovation</strong>
                        <small>How novel the idea appears compared with existing projects.</small>
                      </div>
                    )}
                    {originality !== null && (
                      <div className="pd-ring">
                        <ScoreRing value={originality} size={78} stroke={7} />
                        <strong>Originality</strong>
                        <small>Estimated distinctiveness of this project.</small>
                      </div>
                    )}
                  </div>
                )}

                {similarity !== null && (
                  <div className="pd-sim">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="cx-small">Similarity</strong>
                      <span className="cx-badge" style={{ color: scoreColor(100 - similarity) }}>
                        {similarity}%
                      </span>
                    </div>
                    <div
                      className="cx-bar"
                      role="progressbar"
                      aria-label="Similarity score"
                      aria-valuenow={similarity}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="cx-bar-fill"
                        style={{ width: `${similarity}%`, background: scoreColor(100 - similarity) }}
                      />
                    </div>
                    <small className="pd-hint">
                      Overlap with other projects on the platform. Lower is better.
                    </small>
                  </div>
                )}

                <p className="pd-note">
                  <i className="bi bi-info-circle" aria-hidden="true" /> These are automated
                  estimates, not an academic evaluation or proof of plagiarism. Read them in
                  context.
                </p>
              </section>
            )}

            <section className="cx-card p-4 mt-3" aria-labelledby="pd-owner-h">
              <h2 id="pd-owner-h" className="cx-label mb-3">
                About the student
              </h2>

              <div className="d-flex align-items-center gap-3 mb-3">
                <Avatar name={ownerName} size={44} />
                <div>
                  <div className="pd-reviewer">{ownerName}</div>
                  {courseBatch.length > 0 && (
                    <div className="cx-caption">{[p.course, p.batch].filter(Boolean).join(' · ')}</div>
                  )}
                </div>
              </div>

              {/* The profile route is faculty-only, so only faculty get the link. */}
              {isFaculty && p.student?.id && (
                <Link
                  to={`/faculty/students/${p.student.id}`}
                  className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm"
                >
                  View profile
                </Link>
              )}
            </section>
          </div>
        </aside>
      </div>
    </>
  );
}
