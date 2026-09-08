import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const UID_PATTERN = /^N\d{11}$/;

export default function Login() {
  const [role, setRole] = useState('student');
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginStudent, loginFaculty } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uid.trim() || !password.trim()) {
      setError('Please fill in both fields to continue.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (role === 'student') await loginStudent(uid.trim(), password);
      else await loginFaculty(uid.trim(), password);
      toast(`Welcome back${role === 'faculty' ? ', Professor' : ''}! Signed in successfully.`);
      navigate(role === 'student' ? '/student/dashboard' : '/faculty/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect ID or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side d-none d-lg-flex">
        <div className="auth-side-inner">
          <div className="cx-brand" style={{ padding: '0 0 40px' }}>
            <span className="cx-brand-mark">X</span>
            <span className="cx-brand-name" style={{ color: '#fff' }}>CreateX</span>
          </div>
          <h1 className="cx-display" style={{ color: '#fff', maxWidth: 420 }}>
            Where student projects find their edge.
          </h1>
          <p className="cx-body" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 400, marginTop: 16 }}>
            Discover what your peers are building, check how original your idea really is,
            and get faculty feedback that sharpens it.
          </p>
        </div>
      </div>

      <div className="auth-form-col">
        <div className="auth-form-card cx-fade-in">
          <div className="d-flex d-lg-none cx-brand" style={{ padding: '0 0 28px' }}>
            <span className="cx-brand-mark" style={{ background: 'linear-gradient(155deg,var(--c-primary),var(--c-accent))' }}>X</span>
            <span className="cx-brand-name">CreateX</span>
          </div>
          <h2 className="cx-h1" style={{ marginBottom: 6 }}>Welcome back</h2>
          <p className="cx-body" style={{ marginBottom: 28 }}>Sign in with your college unique ID to continue.</p>

          <div className="cx-chip-toggle mb-4" role="tablist" aria-label="Login as">
            <button type="button" className={`cx-chip ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')} role="tab" aria-selected={role === 'student'}>Student</button>
            <button type="button" className={`cx-chip ${role === 'faculty' ? 'active' : ''}`} onClick={() => setRole('faculty')} role="tab" aria-selected={role === 'faculty'}>Faculty</button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="cx-field">
              <label htmlFor="uid">College Unique ID <span className="req">*</span></label>
              <input
                id="uid" className="cx-input" autoComplete="username"
                placeholder={role === 'student' ? 'N02122500051' : 'FAC-2026-0143'}
                value={uid} onChange={(e) => setUid(e.target.value)}
                aria-describedby="uidHint"
              />
              <div className="cx-hint" id="uidHint">
                {role === 'student' ? 'Format: N + 11 digits, e.g. N02122500051' : 'Faculty staff ID, e.g. FAC-2026-0143'}
                {uid && role === 'student' && !UID_PATTERN.test(uid) && ' — check the format'}
              </div>
            </div>

            <div className="cx-field">
              <label htmlFor="pwd">Password <span className="req">*</span></label>
              <div className="cx-input-group">
                <input
                  id="pwd" className="cx-input" type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button" className="cx-input-icon" onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <label className="form-check-label cx-small" htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="cx-link cx-small">Forgot password?</a>
            </div>

            {error && (
              <div className="cx-hint invalid mb-3" role="alert">
                <i className="bi bi-exclamation-circle me-1"></i>{error}
              </div>
            )}

            <button className="cx-btn cx-btn-primary cx-btn-block cx-btn-lg" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="cx-small text-center mt-4">
            New to CreateX? <Link to="/register" className="cx-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
