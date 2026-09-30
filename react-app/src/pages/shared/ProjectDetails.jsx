import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Rating } from '../../components/Badge/Badge';
import { ScoreRing } from '../../components/ScoreCard/ScoreCard';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

function scoreColor(v) {
  return v >= 75
    ? 'var(--c-success)'
    : v >= 50
      ? 'var(--c-warning)'
      : 'var(--c-danger)';
}

const DOMAIN_VARIANT = {
  'AI / ML': 'accent',
  'Web Development': 'primary',
  'Cyber Security': 'danger',
  IoT: 'info',
  'Data Science': 'success',
  'Cloud Computing': 'info',
  'Mobile Application': 'primary',
  'Software Development': 'warning',
};

/* =========================================================
   FEEDBACK FORM
========================================================= */
function FeedbackForm({ projectId, onSubmitted }) {
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingRec, setSubmittingRec] = useState(false);

  async function submitFeedback(e) {
    e.preventDefault();

    if (rating === 0 || !feedback.trim()) {
      toast('Please add a rating and feedback text.', 'error');
      return;
    }

    setSubmittingFeedback(true);

    try {
      const res = await projectService.feedback.submit(projectId, {
        rating,
        feedback,
      });

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
    if (!recommendation.trim()) {
      toast('Please write a recommendation first.', 'error');
      return;
    }

    setSubmittingRec(true);

    try {
      const res = await projectService.feedback.submit(projectId, {
        recommendation,
      });

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
    <div className="cx-card p-4 p-lg-5 mt-4">
      <h3 className="cx-h3 mb-4">Give Feedback & Recommendation</h3>

      <form onSubmit={submitFeedback}>
        {/* Rating */}
        <div className="cx-field">
          <label>
            Rating <span className="req">*</span>
          </label>

          <Rating value={rating} onChange={setRating} />
        </div>

        {/* Feedback */}
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

        {/* Recommendation */}
        <div className="cx-field">
          <label htmlFor="recText">
            Recommendation <span className="req">*</span>
          </label>

          <textarea
            id="recText"
            className="cx-input"
            rows={2}
            placeholder="e.g. Recommended for department showcase"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="d-flex gap-3">
          <button
            type="submit"
            className="cx-btn cx-btn-primary"
            disabled={submittingFeedback}
          >
            {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
          </button>

          <button
            type="button"
            className="cx-btn cx-btn-outline"
            onClick={submitRecommendation}
            disabled={submittingRec}
          >
            {submittingRec ? 'Submitting…' : 'Submit Recommendation'}
          </button>
        </div>
      </form>
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

  const isFaculty = user?.role === 'faculty';

  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState(null);

  // Always keep feedback as ARRAY
  const [feedbackList, setFeedbackList] = useState([]);

  const [inWishlist, setInWishlist] = useState(false);

  /* =======================================================
     LOAD PROJECT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        /* ---------------------------------------------------
           PROJECT API
           Project should load independently.
        --------------------------------------------------- */

        const projectRes = await projectService.detail(id);
        if (cancelled) return;

        console.log('PROJECT ID:', id);

        console.log('PROJECT API RESPONSE:', projectRes);

        console.log('PROJECT DATA:', projectRes.data);

        setProject(projectRes.data);

        setInWishlist(Boolean(projectRes.data?.in_wishlist));

        /* ---------------------------------------------------
           FEEDBACK API
           Feedback should NOT break project page.
        --------------------------------------------------- */

        try {
          const feedbackRes = await projectService.feedback.listForProject(id);

          if (cancelled) return;

          console.log('FEEDBACK DATA:', feedbackRes.data);

          const data = feedbackRes.data;

          /*
             Backend can return:

             []
             ""
             { results: [] }

             We always convert it to an ARRAY.
          */

          if (Array.isArray(data)) {
            setFeedbackList(data);
          } else if (data && Array.isArray(data.results)) {
            setFeedbackList(data.results);
          } else {
            // No feedback
            setFeedbackList([]);
          }
        } catch (feedbackError) {
          console.error('FEEDBACK LOAD ERROR:', feedbackError);

          /*
             Feedback failure should NOT
             hide project details.
          */

          setFeedbackList([]);
        }
      } catch (err) {
        console.error('PROJECT LOAD ERROR:', err);

        if (!cancelled) {
          toast(err.message || 'Could not load this project.', 'error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  /* =======================================================
     WISHLIST
  ======================================================= */

  async function toggleWishlist() {
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
    }
  }

  /* =======================================================
     FEEDBACK SUBMITTED
  ======================================================= */

  function handleFeedbackSubmitted(newEntry) {
    /*
       If backend returns an object,
       add it to the beginning.

       If backend returns something invalid,
       don't break UI.
    */

    if (newEntry && typeof newEntry === 'object' && !Array.isArray(newEntry)) {
      setFeedbackList((prev) => [newEntry, ...prev]);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="row g-4">
        <div className="col-lg-8">
          <div
            className="cx-skel"
            style={{
              height: 280,
              marginBottom: 24,
            }}
          />

          <div
            className="cx-skel"
            style={{
              height: 160,
            }}
          />
        </div>

        <div className="col-lg-4">
          <div
            className="cx-skel"
            style={{
              height: 320,
            }}
          />
        </div>
      </div>
    );
  }

  /* =======================================================
     PROJECT NOT FOUND
  ======================================================= */

  if (!project) {
    return (
      <div className="cx-empty">
        <div className="cx-empty-icon">
          <i className="bi bi-exclamation-circle"></i>
        </div>

        <h3 className="cx-h3">Project not found</h3>

        <p className="cx-small mb-3">
          It may have been removed, or the link is incorrect.
        </p>

        <button className="cx-btn cx-btn-outline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const p = project;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* Back Button */}

      <button
        onClick={() => navigate(-1)}
        className="cx-small cx-link mb-3 d-inline-flex align-items-center gap-1 border-0 bg-transparent p-0"
      >
        <i className="bi bi-arrow-left"></i>
        Back to results
      </button>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
        <div>
          <Badge variant={DOMAIN_VARIANT[p.domain] || 'default'}>{p.domain}</Badge>

          <h1 className="cx-h1 mt-2 mb-2">{p.title}</h1>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Avatar name={p.owner_name || 'Student'} size={32} />

            <span
              className="cx-small mb-0"
              style={{
                color: 'var(--c-ink)',
                fontWeight: 600,
              }}
            >
              {p.owner_name || 'Unknown Student'}
            </span>

            <span className="cx-caption">
              &middot; {p.course} &middot; Batch {p.batch}
            </span>
          </div>
        </div>

        {/* Header Buttons */}

        <div className="d-flex gap-2">
          {!isFaculty && (
            <button className="cx-btn cx-btn-outline" onClick={toggleWishlist}>
              <i
                className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`}
                style={{
                  color: inWishlist ? 'var(--c-danger)' : 'inherit',
                }}
              ></i>

              {inWishlist ? 'Saved' : 'Save'}
            </button>
          )}

          <button
            className="cx-btn cx-btn-primary"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);

              toast('Link copied to clipboard.');
            }}
          >
            <i className="bi bi-share"></i>
            Share
          </button>
        </div>
      </div>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="row g-4">
        <div className="col-lg-8">
          {/* =================================================
              PROJECT IMAGES
          ================================================= */}

          {p.images?.length > 0 && (
            <div className="cx-card p-2 mb-4">
              <div className="row g-2">
                {p.images.map((img, i) => (
                  <div
                    className={`col-4 col-md-${i === 0 ? '12' : '4'}`}
                    key={img.id ?? i}
                  >
                    <div
                      style={{
                        aspectRatio: i === 0 ? '16/8' : '1',

                        borderRadius: 'var(--r-sm)',

                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={img.image ?? img}
                        alt={`${p.title} screenshot ${i + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              ABOUT PROJECT
          ================================================= */}

          <div className="cx-card p-4 p-lg-5 mb-4">
            <h3 className="cx-h3 mb-3">About this project</h3>

            <p className="cx-body">{p.description}</p>

            <div className="cx-tech-row mt-3">
              {Array.isArray(p.technologies) &&
                p.technologies.map((technology) => (
                  <Badge key={technology} variant="primary">
                    {technology}
                  </Badge>
                ))}
            </div>
          </div>

          {/* =================================================
              DOCUMENTATION & MEDIA
          ================================================= */}

          {(p.documentation || p.screen_recording) && (
            <div className="cx-card p-4 p-lg-5 mb-4">
              <h3 className="cx-h3 mb-3">Documentation & Media</h3>

              <div className="row g-3">
                {/* Documentation */}

                {p.documentation && (
                  <div className="col-md-6">
                    <a
                      href={p.documentation}
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center gap-3 p-3 text-decoration-none"
                      style={{
                        border: '1px solid var(--c-border-soft)',

                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <i
                        className="bi bi-file-earmark-pdf"
                        style={{
                          fontSize: '1.4rem',
                          color: 'var(--c-danger)',
                        }}
                      ></i>

                      <div className="flex-grow-1">
                        <div
                          className="cx-small mb-0"
                          style={{
                            fontWeight: 600,
                            color: 'var(--c-ink)',
                          }}
                        >
                          Project Documentation
                        </div>

                        <div className="cx-caption">PDF</div>
                      </div>

                      <i className="bi bi-download cx-link"></i>
                    </a>
                  </div>
                )}

                {/* Screen Recording */}

                {p.screen_recording && (
                  <div className="col-md-6">
                    <a
                      href={p.screen_recording}
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center gap-3 p-3 text-decoration-none"
                      style={{
                        border: '1px solid var(--c-border-soft)',

                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <i
                        className="bi bi-play-circle-fill"
                        style={{
                          fontSize: '1.4rem',
                          color: 'var(--c-primary)',
                        }}
                      ></i>

                      <div className="flex-grow-1">
                        <div
                          className="cx-small mb-0"
                          style={{
                            fontWeight: 600,
                            color: 'var(--c-ink)',
                          }}
                        >
                          Screen Recording
                        </div>

                        <div className="cx-caption">Video</div>
                      </div>

                      <i className="bi bi-play cx-link"></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================
              FACULTY FEEDBACK
          ================================================= */}

          <div className="cx-card p-4 p-lg-5">
            <h3 className="cx-h3 mb-4">Faculty Feedback</h3>

            {feedbackList.length > 0 ? (
              feedbackList.map((f, index) => (
                <div
                  className="d-flex gap-3 mb-4 pb-4"
                  style={{
                    borderBottom: '1px solid var(--c-border-soft)',
                  }}
                  key={f.id ?? index}
                >
                  <Avatar name={f.faculty_name ?? f.faculty ?? 'Faculty'} size={40} />

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <span
                        className="cx-small mb-0"
                        style={{
                          fontWeight: 650,
                          color: 'var(--c-ink)',
                        }}
                      >
                        {f.faculty_name ?? f.faculty ?? 'Faculty'}
                      </span>

                      {f.rating > 0 && <Rating value={f.rating} readOnly />}
                    </div>

                    {f.feedback && <p className="cx-small my-2">{f.feedback}</p>}

                    {f.recommendation && (
                      <Badge variant="success" icon="bi-award">
                        {f.recommendation}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              /*
                 No feedback:
                 ONLY this section shows empty state.
                 Other project details remain visible.
              */

              <div className="text-center py-3">
                <i
                  className="bi bi-chat-square-text"
                  style={{
                    fontSize: '2rem',
                    opacity: 0.5,
                  }}
                ></i>

                <p className="cx-small mb-0 mt-2">No feedback yet.</p>
              </div>
            )}
          </div>

          {/* =================================================
              FACULTY FEEDBACK FORM
          ================================================= */}

          {isFaculty && (
            <FeedbackForm projectId={p.id} onSubmitted={handleFeedbackSubmitted} />
          )}
        </div>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <div className="col-lg-4">
          {/* Score Overview */}

          <div
            className="cx-glass p-4 mb-3"
            style={{
              position: 'sticky',
              top: 'calc(var(--topbar-h) + 20px)',
            }}
          >
            <div className="cx-label mb-3">Score Overview</div>

            <div className="d-flex justify-content-around text-center mb-2">
              <ScoreRing value={p.innovation} size={78} stroke={7} />

              <ScoreRing value={p.originality} size={78} stroke={7} />
            </div>

            <div className="d-flex justify-content-around text-center">
              <div className="cx-caption">Innovation</div>

              <div className="cx-caption">Originality</div>
            </div>

            <hr
              style={{
                borderColor: 'var(--c-border-soft)',
              }}
            />

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="cx-small mb-0">Similarity Score</span>

              <span
                className="cx-badge"
                style={{
                  color: scoreColor(100 - p.similarity),
                }}
              >
                {p.similarity}%
              </span>
            </div>

            <div className="cx-bar">
              <div
                className="cx-bar-fill"
                style={{
                  width: `${p.similarity}%`,
                  background: scoreColor(100 - p.similarity),
                }}
              />
            </div>
          </div>

          {/* About Student */}

          <div className="cx-card p-4">
            <div className="cx-label mb-3">About the Student</div>

            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={p.owner_name || 'Student'} size={44} />

              <div>
                <div
                  className="cx-small mb-0"
                  style={{
                    fontWeight: 650,
                    color: 'var(--c-ink)',
                  }}
                >
                  {p.owner_name || 'Unknown Student'}
                </div>

                <div className="cx-caption">
                  {p.course} &middot; {p.batch}
                </div>
              </div>
            </div>

            {p.student?.id && (
              <Link
                to={`/faculty/students/${p.student.id}`}
                className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
