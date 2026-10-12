import React, { useState } from 'react';
import ScoreCard from '../../components/ScoreCard/ScoreCard';
import { Badge } from '../../components/Badge/Badge';
import { SkeletonGrid } from '../../components/EmptyState/EmptyState';
import { innovationService } from '../../services/innovationService';
import { useToast } from '../../context/ToastContext';

function scoreColor(v) { return v >= 75 ? 'var(--c-success)' : v >= 50 ? 'var(--c-warning)' : 'var(--c-danger)'; }

export default function InnovationAssistant() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  async function analyze() {
  if (idea.trim().length < 20) {
    toast('Please describe your idea in a bit more detail.', 'error');
    return;
  }

  setLoading(true);
  setResult(null);

  try {
    const response = await innovationService.analyze(idea, []);

    setResult(response.data);
  } catch (err) {
    console.error('Innovation analysis error:', err);

    toast(
      err.response?.data?.detail ||
      err.message ||
      'Could not analyze your idea right now.',
      'error'
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <>
      <div className="cx-hero cx-assistant-bg p-4 p-lg-5 mb-4">
        <Badge variant="gradient" icon="bi-stars">AI Innovation Assistant</Badge>
        <h1 className="cx-display mt-3" style={{ maxWidth: 640 }}>Make Your Project <span className="cx-gradient-text">More Innovative</span></h1>
        <p className="cx-body mt-2" style={{ maxWidth: 560 }}>
          Describe your idea and CreateX will compare it against every project on the platform
          to score its originality and suggest ways to sharpen it.
        </p>
      </div>

      <div className="cx-card p-4 p-lg-5 mb-4">
        <label className="cx-label" htmlFor="ideaInput">Describe your project idea</label>
        <textarea
          id="ideaInput" className="cx-input mt-2" rows={4}
          placeholder="e.g. A mobile app that helps students find study groups based on course schedule overlap and learning style..."
          value={idea} onChange={(e) => setIdea(e.target.value)}
        />
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <span className="cx-caption">Analyzed against 2,300+ indexed projects</span>
          <button className="cx-btn cx-btn-accent cx-btn-lg" onClick={analyze} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-magic"></i>}
            {loading ? 'Analyzing…' : 'Analyze Project'}
          </button>
        </div>
      </div>

      {loading && <SkeletonGrid count={4} cols="col-6 col-lg-3" />}

      {result && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3"><ScoreCard label="Similarity Score" value={result.similarity} caption="How closely this matches existing projects" /></div>
            <div className="col-6 col-lg-3"><ScoreCard label="Originality" value={result.originality} caption="How unique your framing and features are" /></div>
            <div className="col-6 col-lg-3"><ScoreCard label="Innovation Potential" value={result.innovation} caption="Headroom for standout features" /></div>
            <div className="col-6 col-lg-3"><ScoreCard label="Innovation Gap" value={result.gap} caption="Distance to top-tier submissions" /></div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="cx-card p-4 h-100">
                <h3 className="cx-h3 mb-3">Similar Projects</h3>
                {result.similarProjects.map((s) => (
                  <div key={s.name} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--c-border-soft)' }}>
                    <div className="flex-grow-1">
                      <div className="cx-small mb-1" style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{s.name}</div>
                      <div className="cx-bar"><div className="cx-bar-fill" style={{ width: `${s.pct}%`, background: scoreColor(100 - s.pct) }} /></div>
                    </div>
                    <Badge>{s.pct}%</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="cx-glass p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-lightbulb-fill" style={{ color: 'var(--c-accent)' }}></i>
                  <h3 className="cx-h3 mb-0">Innovation Suggestions</h3>
                </div>
                {result.suggestions.map((s) => (
                  <div key={s.text} className="d-flex align-items-start gap-3 mb-3">
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--c-accent-soft)', color: 'var(--c-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bi ${s.icon}`}></i>
                    </div>
                    <span className="cx-small mb-0">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cx-card p-4 p-lg-5 mt-4">
            <h3 className="cx-h3 mb-4">Technology Recommendations</h3>
            <div className="row g-4 align-items-center">
              <div className="col-md-5">
                <div className="cx-caption mb-2">CURRENT STACK</div>
                <div className="cx-tech-row">{result.techRecommendation.current.map((t) => <Badge key={t}>{t}</Badge>)}</div>
              </div>
              <div className="col-md-2 text-center d-none d-md-block"><i className="bi bi-arrow-right" style={{ fontSize: '1.4rem', color: 'var(--c-muted)' }}></i></div>
              <div className="col-md-5">
                <div className="cx-caption mb-2">RECOMMENDED</div>
                <div className="cx-tech-row">{result.techRecommendation.recommended.map((t) => <Badge key={t} variant="accent">{t}</Badge>)}</div>
              </div>
            </div>
            <p className="cx-small mt-4 mb-0">{result.techRecommendation.rationale}</p>
          </div>

          <div className="cx-cta-banner mt-5 mb-3">
            <i className="bi bi-stars" style={{ fontSize: '1.8rem' }}></i>
            <h2 className="cx-h1 mt-2 mb-2" style={{ color: '#fff' }}>Make My Project Unique</h2>
            <p className="cx-body mb-4" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 420, margin: '0 auto 24px' }}>
              Discover new ways to improve your project idea and close the innovation gap.
            </p>
            <button
              className="cx-btn cx-btn-lg" style={{ background: '#fff', color: 'var(--cx-indigo)' }}
              onClick={() => toast('Suggestions saved to your project workspace.')}
            >
              <i className="bi bi-stars"></i>Start Innovation
            </button>
          </div>
        </>
      )}
    </>
  );
}
