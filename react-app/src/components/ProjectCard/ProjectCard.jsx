
// import { Link } from 'react-router-dom';
// import { Avatar, Badge } from '../Badge/Badge';
// import { useAuth } from '../../context/AuthContext';

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

// function scoreColor(v) {
//   return v >= 75
//     ? 'var(--c-success)'
//     : v >= 50
//       ? 'var(--c-warning)'
//       : 'var(--c-danger)';
// }

// export default function ProjectCard({
//   project: p,
//   hideWishlist = false,
//   inWishlist = false,
//   onToggleWishlist,

//   // Edit functionality
//   showEdit = false,
//   onEdit,
//   showDelete = false,
//   onDelete,
// }) {
//   // NEW: get the logged in user
//   const { user } = useAuth();

//   const technologies = p?.technologies || [];

//   const innovation = Number(p?.innovation ?? 0);
//   const similarity = Number(p?.similarity ?? 0);

//   const ownerName = p?.owner_name || 'Unknown Student';

//   // NEW: faculty and student have different view pages
//   const viewLink =
//     user?.role === 'faculty'
//       ? `/faculty/projects/view/${p.id}`
//       : `/student/projects/view/${p.id}`;

//   return (
//     <div className="cx-card cx-hover cx-pcard">
//       {/* Project Thumbnail */}
//       <div className="cx-pcard-thumb">
//         <i className="bi bi-diagram-3" aria-hidden="true"></i>
//       </div>

//       {/* Domain + Wishlist */}
//       <div className="d-flex justify-content-between align-items-start gap-2 mt-2">
//         <Badge variant={DOMAIN_VARIANT[p?.domain] || 'default'}>
//           {p?.domain || 'Unknown Domain'}
//         </Badge>

//         {!hideWishlist && (
//           <button
//             type="button"
//             className="cx-btn cx-btn-ghost"
//             style={{ padding: 6 }}
//             aria-pressed={inWishlist}
//             aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
//             onClick={() => onToggleWishlist?.(p.id)}
//           >
//             <i
//               className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`}
//               style={{
//                 color: inWishlist ? 'var(--c-danger)' : 'var(--c-muted)',
//               }}
//             />
//           </button>
//         )}
//       </div>

//       {/* Title */}
//       <h3 className="cx-h3" style={{ lineHeight: 1.3 }}>
//         {p?.title || 'Untitled Project'}
//       </h3>

//       {/* Description */}
//       <p
//         className="cx-small"
//         style={{
//           margin: 0,
//           display: '-webkit-box',
//           WebkitLineClamp: 2,
//           WebkitBoxOrient: 'vertical',
//           overflow: 'hidden',
//         }}
//       >
//         {p?.description || 'No description available.'}
//       </p>

//       {/* Technologies */}
//       <div className="cx-tech-row">
//         {technologies.slice(0, 3).map((technology) => (
//           <Badge key={technology}>{technology}</Badge>
//         ))}

//         {technologies.length > 3 && <Badge>+{technologies.length - 3}</Badge>}
//       </div>

//       {/* Project Meta */}
//       <div className="cx-pcard-meta">
//         <Avatar name={ownerName} size={20} />

//         <span>{ownerName}</span>

//         <span>&middot;</span>

//         <span>
//           {p?.course || ''}
//           {p?.batch ? ` ${p.batch}` : ''}
//         </span>
//       </div>

//       {/* AI Scores */}
//       <div className="cx-pcard-scores">
//         {/* Innovation */}
//         <div className="score-mini">
//           <div
//             className="num"
//             style={{
//               color: scoreColor(innovation),
//             }}
//           >
//             {innovation}%
//           </div>

//           <div className="lbl">Innovation</div>
//         </div>

//         {/* Similarity */}
//         <div className="score-mini">
//           <div
//             className="num"
//             style={{
//               color: scoreColor(100 - similarity),
//             }}
//           >
//             {similarity}%
//           </div>

//           <div className="lbl">Similarity</div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="d-flex gap-2 mt-1">
//         {/* NEW: to={viewLink} instead of the fixed student link */}
//         <Link
//           to={viewLink}
//           className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm"
//         >
//           <i className="bi bi-eye me-1"></i>
//           View
//         </Link>

//         {showEdit && (
//           <button
//             type="button"
//             className="cx-btn cx-btn-primary cx-btn-block cx-btn-sm"
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               onEdit?.(p.id);
//             }}
//           >
//             <i className="bi bi-pencil me-1"></i>
//             Edit
//           </button>
//         )}

//         {showDelete && (
//           <button
//             type="button"
//             className="cx-btn cx-btn-danger cx-btn-sm"
//             title="Delete project"
//             aria-label={`Delete ${p?.title || 'project'}`}
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               onDelete?.(p.id);
//             }}
//           >
//             <i className="bi bi-trash3"></i>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Badge } from '../Badge/Badge';
import { useAuth } from '../../context/AuthContext';
// ASSUMPTION: adjust the import / method names to match your ToastContext.
import { useToast } from '../../context/ToastContext';
import '../../styles/ProjectCard.css'

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

const MAX_TECH = 3;

const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/* ---------- helpers (pure, outside render) ---------- */

// Returns a 0-100 number, or null when the API did not send a usable value.
function toScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : null;
}

function scoreTone(v) {
  return v >= 75 ? 'good' : v >= 50 ? 'mid' : 'bad';
}

// technologies may be an array or a comma-separated string.
function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

// images may be [url], [{image|url}], or a single thumbnail field.
function pickThumbnail(p) {
  const first = Array.isArray(p?.images) ? p.images[0] : null;
  const src =
    (typeof first === 'string' ? first : first?.image || first?.url) ||
    p?.thumbnail ||
    p?.image ||
    null;
  return typeof src === 'string' && src.trim() ? src : null;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : dateFormat.format(d);
}

/* ---------- component ---------- */

export default function ProjectCard({
  project: p,
  hideWishlist = false,
  inWishlist = false,
  onToggleWishlist,

  showEdit = false,
  onEdit,
  showDelete = false,
  onDelete,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [wishlistPending, setWishlistPending] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!p) return null;

  const technologies = toList(p.technologies);
  const innovation = toScore(p.innovation);
  const similarity = toScore(p.similarity);
  const rating = Number(p.average_rating ?? p.rating);
  const ratingCount = Number(p.rating_count ?? p.feedback_count ?? 0);
  const hasRating = Number.isFinite(rating) && rating > 0;

  const ownerName = p.owner_name || p.owner?.name || 'Unknown Student';
  const created = formatDate(p.created_at);
  const thumbnail = imageFailed ? null : pickThumbnail(p);
  const courseBatch = [p.course, p.batch].filter(Boolean).join(' ');

  const viewLink =
    user?.role === 'faculty'
      ? `/faculty/projects/view/${p.id}`
      : `/student/projects/view/${p.id}`;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistPending || !onToggleWishlist) return;

    setWishlistPending(true);
    try {
      await onToggleWishlist(p.id);
      toast?.success?.(
        inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      );
    } catch {
      toast?.error?.('Could not update wishlist. Please try again.');
    } finally {
      setWishlistPending(false);
    }
  };

  const stop = (handler) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    handler?.(p.id);
  };

  return (
    <article className="cx-card cx-hover cx-pcard pc">
      <div className="pc-thumb">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <i className="bi bi-diagram-3" aria-hidden="true" />
        )}
      </div>

      <div className="pc-head">
        <Badge variant={DOMAIN_VARIANT[p.domain] || 'default'}>
          {p.domain || 'Unknown Domain'}
        </Badge>

        {!hideWishlist && (
          <button
            type="button"
            className="pc-icon-btn"
            aria-pressed={inWishlist}
            aria-busy={wishlistPending}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            disabled={wishlistPending}
            onClick={handleWishlist}
          >
            {wishlistPending ? (
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            ) : (
              <i
                className={`bi ${inWishlist ? 'bi-heart-fill pc-heart-on' : 'bi-heart'}`}
                aria-hidden="true"
              />
            )}
          </button>
        )}
      </div>

      <h3 className="cx-h3 pc-title">{p.title || 'Untitled Project'}</h3>
      <p className="cx-small pc-desc">
        {p.description || 'No description available.'}
      </p>

      {technologies.length > 0 && (
        <div className="cx-tech-row">
          {technologies.slice(0, MAX_TECH).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          {technologies.length > MAX_TECH && (
            <Badge>+{technologies.length - MAX_TECH}</Badge>
          )}
        </div>
      )}

      <div className="cx-pcard-meta pc-meta">
        <Avatar name={ownerName} size={20} />
        <span className="pc-owner">{ownerName}</span>
        {courseBatch && <span className="pc-dim">{courseBatch}</span>}
      </div>

      {(created || hasRating) && (
        <div className="pc-sub">
          {created && <span>{created}</span>}
          {hasRating && (
            <span aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
              <i className="bi bi-star-fill pc-star" aria-hidden="true" />{' '}
              {rating.toFixed(1)}
              {ratingCount > 0 && ` (${ratingCount})`}
            </span>
          )}
        </div>
      )}

      {(innovation !== null || similarity !== null) && (
        <div className="cx-pcard-scores pc-scores">
          {innovation !== null && (
            <div className={`score-mini pc-score pc-${scoreTone(innovation)}`}>
              <div className="num">{innovation}%</div>
              <div className="lbl">Innovation</div>
            </div>
          )}
          {similarity !== null && (
            // Lower similarity is better, so the tone is inverted.
            <div className={`score-mini pc-score pc-${scoreTone(100 - similarity)}`}>
              <div className="num">{similarity}%</div>
              <div className="lbl">Similarity</div>
            </div>
          )}
        </div>
      )}

      <div className="pc-actions">
        <Link to={viewLink} className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm">
          <i className="bi bi-eye me-1" aria-hidden="true" />
          View
        </Link>

        {showEdit && (
          <button
            type="button"
            className="cx-btn cx-btn-primary cx-btn-block cx-btn-sm"
            onClick={stop(onEdit)}
          >
            <i className="bi bi-pencil me-1" aria-hidden="true" />
            Edit
          </button>
        )}

        {showDelete && (
          <button
            type="button"
            className="cx-btn cx-btn-danger cx-btn-sm"
            title="Delete project"
            aria-label={`Delete ${p.title || 'project'}`}
            onClick={stop(onDelete)}
          >
            <i className="bi bi-trash3" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
