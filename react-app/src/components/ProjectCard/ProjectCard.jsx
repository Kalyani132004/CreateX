import { Link } from 'react-router-dom';
import { Avatar, Badge } from '../Badge/Badge';

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

function scoreColor(v) {
  return v >= 75
    ? 'var(--c-success)'
    : v >= 50
      ? 'var(--c-warning)'
      : 'var(--c-danger)';
}

/**
 * Project summary card used across:
 * Dashboard, Search, Wishlist, My Projects
 *
 * @param {object} project
 * @param {boolean} hideWishlist
 * @param {boolean} inWishlist
 * @param {(id:number)=>void} onToggleWishlist
 */
export default function ProjectCard({
  project: p,
  hideWishlist = false,
  inWishlist = false,
  onToggleWishlist,
}) {
  const technologies = p?.technologies || [];

  const innovation = Number(p?.innovation ?? 0);
  const similarity = Number(p?.similarity ?? 0);

  const ownerName = p?.owner_name || 'Unknown Student';

  return (
    <div className="cx-card cx-hover cx-pcard">

      {/* Project Thumbnail */}
      <div className="cx-pcard-thumb">
        <i
          className="bi bi-diagram-3"
          aria-hidden="true"
        ></i>
      </div>

      {/* Domain + Wishlist */}
      <div className="d-flex justify-content-between align-items-start gap-2 mt-2">

        <Badge variant={DOMAIN_VARIANT[p?.domain] || 'default'}>
          {p?.domain || 'Unknown Domain'}
        </Badge>

        {!hideWishlist && (
          <button
            type="button"
            className="cx-btn cx-btn-ghost"
            style={{ padding: 6 }}
            aria-pressed={inWishlist}
            aria-label={
              inWishlist
                ? 'Remove from wishlist'
                : 'Add to wishlist'
            }
            onClick={() => onToggleWishlist?.(p.id)}
          >
            <i
              className={`bi ${
                inWishlist
                  ? 'bi-heart-fill'
                  : 'bi-heart'
              }`}
              style={{
                color: inWishlist
                  ? 'var(--c-danger)'
                  : 'var(--c-muted)',
              }}
            />
          </button>
        )}

      </div>

      {/* Title */}
      <h3
        className="cx-h3"
        style={{ lineHeight: 1.3 }}
      >
        {p?.title || 'Untitled Project'}
      </h3>

      {/* Description */}
      <p
        className="cx-small"
        style={{
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {p?.description || 'No description available.'}
      </p>

      {/* Technologies */}
      <div className="cx-tech-row">

        {technologies
          .slice(0, 3)
          .map((technology) => (
            <Badge key={technology}>
              {technology}
            </Badge>
          ))}

        {technologies.length > 3 && (
          <Badge>
            +{technologies.length - 3}
          </Badge>
        )}

      </div>

      {/* Project Meta */}
      <div className="cx-pcard-meta">

        <Avatar
          name={ownerName}
          size={20}
        />

        <span>
          {ownerName}
        </span>

        <span>&middot;</span>

        <span>
          {p?.course || ''}
          {p?.batch ? ` ${p.batch}` : ''}
        </span>

      </div>

      {/* AI Scores */}
      <div className="cx-pcard-scores">

        {/* Innovation */}
        <div className="score-mini">

          <div
            className="num"
            style={{
              color: scoreColor(innovation),
            }}
          >
            {innovation}%
          </div>

          <div className="lbl">
            Innovation
          </div>

        </div>

        {/* Similarity */}
        <div className="score-mini">

          <div
            className="num"
            style={{
              color: scoreColor(100 - similarity),
            }}
          >
            {similarity}%
          </div>

          <div className="lbl">
            Similarity
          </div>

        </div>

      </div>

      {/* View Project */}
      <Link
        to={`student/projects/${p.id}`}
        className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm mt-1"
        >
        View Project
        </Link>

    </div>
  );
}
