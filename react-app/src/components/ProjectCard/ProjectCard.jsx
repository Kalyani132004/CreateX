import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Avatar } from '../Badge/Badge';

const DOMAIN_VARIANT = {
  'AI / ML': 'accent', 'Web Development': 'primary', 'Cyber Security': 'danger',
  IoT: 'info', 'Data Science': 'success', 'Cloud Computing': 'info',
  'Mobile Application': 'primary', 'Software Development': 'warning',
};
function scoreColor(v) { return v >= 75 ? 'var(--c-success)' : v >= 50 ? 'var(--c-warning)' : 'var(--c-danger)'; }

/**
 * Project summary card used across Dashboard, Search, Wishlist, My Projects.
 * @param {object} project
 * @param {boolean} hideWishlist - hide the save button (e.g. faculty view, "my projects")
 * @param {boolean} inWishlist
 * @param {(id:number)=>void} onToggleWishlist
 */
export default function ProjectCard({ project: p, hideWishlist = false, inWishlist = false, onToggleWishlist }) {
  return (
    <div className="cx-card cx-hover cx-pcard">
      <div className="cx-pcard-thumb"><i className="bi bi-diagram-3" aria-hidden="true"></i></div>

      <div className="d-flex justify-content-between align-items-start gap-2 mt-2">
        <Badge variant={DOMAIN_VARIANT[p.domain] || 'default'}>{p.domain}</Badge>
        {!hideWishlist && (
          <button
            type="button"
            className="cx-btn cx-btn-ghost"
            style={{ padding: 6 }}
            aria-pressed={inWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => onToggleWishlist?.(p.id)}
          >
            <i
              className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`}
              style={{ color: inWishlist ? 'var(--c-danger)' : 'var(--c-muted)' }}
            />
          </button>
        )}
      </div>

      <h3 className="cx-h3" style={{ lineHeight: 1.3 }}>{p.title}</h3>
      <p className="cx-small" style={{ margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {p.desc}
      </p>

      <div className="cx-tech-row">
        {p.techs.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
        {p.techs.length > 3 && <Badge>+{p.techs.length - 3}</Badge>}
      </div>

      <div className="cx-pcard-meta">
        <Avatar name={p.student.name} size={20} />
        <span>{p.student.name}</span><span>&middot;</span><span>{p.course} {p.batch}</span>
      </div>

      <div className="cx-pcard-scores">
        <div className="score-mini">
          <div className="num" style={{ color: scoreColor(p.innovation) }}>{p.innovation}%</div>
          <div className="lbl">Innovation</div>
        </div>
        <div className="score-mini">
          <div className="num" style={{ color: scoreColor(100 - p.similarity) }}>{p.similarity}%</div>
          <div className="lbl">Similarity</div>
        </div>
      </div>

      <Link to={`/project/${p.id}`} className="cx-btn cx-btn-outline cx-btn-block cx-btn-sm mt-1">
        View Project
      </Link>
    </div>
  );
}
