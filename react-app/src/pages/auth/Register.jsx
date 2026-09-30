import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const COURSES = ['MCA', 'BCA', 'BE', 'BTECH'];
const UID_PATTERN = /^N\d{11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function yearRange(start, end) {
  const years = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}
const BATCH_START_YEARS = yearRange(2019, 2026);
const BATCH_END_YEARS = yearRange(2023, 2030);

const STEPS = [
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Academics' },
  { id: 3, label: 'Security' },
];

const STRENGTH_LABELS = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];

function passwordRules(pwd) {
  return {
    len: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    num: /[0-9]/.test(pwd),
    sym: /[^A-Za-z0-9]/.test(pwd),
  };
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', email: '', uid: '',
    course: '', batchStart: BATCH_START_YEARS[BATCH_START_YEARS.length - 3],
    batchEnd: BATCH_END_YEARS[2],
    password: '', confirmPassword: '',
  });

  const { loginStudent } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const emailValid = form.email ? EMAIL_PATTERN.test(form.email) : null;
  const uidValid = form.uid ? UID_PATTERN.test(form.uid) : null;
  const rules = passwordRules(form.password);
  const strengthScore = Object.values(rules).filter(Boolean).length;
  const strengthClass = !form.password ? '' : strengthScore <= 1 ? 'weak' : strengthScore === 2 ? 'fair' : strengthScore === 3 ? 'good' : 'strong';
  const confirmValid = form.confirmPassword ? form.password === form.confirmPassword : null;

  function goNext() {
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim() || !emailValid || !uidValid) {
        toast('Please complete all required fields correctly.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!form.course) {
        toast('Please select your course.', 'error');
        return;
      }
    }
    if (step === 3) {
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    if (form.password.length < 8 || form.password !== form.confirmPassword) {
      toast('Check your password fields before continuing.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await authService.register({
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        email: form.email,
        unique_id: form.uid.toUpperCase(),
        course: form.course,
        batch_start: form.batchStart,
        batch_end: form.batchEnd,
        password: form.password,
        confirm_password:form.confirmPassword
      });
      console.log('ok');
      await loginStudent(form.uid.toUpperCase(), form.password);
      toast('Account created! Welcome to CreateX.');
      navigate('/student/dashboard');
    } catch (err) {
      toast(err.message || 'Could not create your account. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side d-none d-lg-flex">
        <div className="auth-side-inner">
          <div className="cx-brand" style={{ padding: '0 0 32px' }}>
            <span className="cx-brand-mark">X</span>
            <span className="cx-brand-name" style={{ color: '#fff' }}>CreateX</span>
          </div>
          <span className="cx-stat-pill mb-3"><i className="bi bi-stars"></i> AI-Powered Innovation Platform</span>
          <h1 className="cx-display" style={{ color: '#fff', maxWidth: 440, marginTop: 16 }}>
            Join a community building{' '}
            <span style={{ background: 'linear-gradient(135deg,#67E8F9,#C4B5FD)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              real projects.
            </span>
          </h1>
          <p className="cx-body" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 400, marginTop: 16 }}>
            Register with your college unique ID to submit projects, get Innovation Scores,
            and receive faculty feedback.
          </p>
          <div className="d-flex gap-3 mt-5 flex-wrap">
            <div className="cx-stat-pill"><i className="bi bi-folder2-open"></i> 2,300+ projects indexed</div>
            <div className="cx-stat-pill"><i className="bi bi-people"></i> 140 faculty reviewers</div>
          </div>
        </div>
      </div>

      <div className="auth-form-col">
        <div className="auth-form-card cx-fade-in" style={{ maxWidth: 560 }}>
          <div className="d-flex d-lg-none cx-brand" style={{ padding: '0 0 24px' }}>
            <span className="cx-brand-mark" style={{ background: 'linear-gradient(155deg,var(--c-primary),var(--c-accent))' }}>X</span>
            <span className="cx-brand-name">CreateX</span>
          </div>
          <h2 className="cx-h1" style={{ marginBottom: 6 }}>Create your student account</h2>
          <p className="cx-body" style={{ marginBottom: 24 }}>Join CreateX with your college unique ID.</p>

          <div className="reg-steps mb-4">
            {STEPS.map((s) => (
              <div key={s.id} className={`reg-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}>
                <span>{step > s.id ? <i className="bi bi-check-lg"></i> : s.id}</span>{s.label}
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); goNext(); }} noValidate>
            {step === 1 && (
              <div className="cx-fade-in">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="cx-field mb-0">
                      <label htmlFor="fname">First Name <span className="req">*</span></label>
                      <input id="fname" className="cx-input" placeholder="Aarav" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="cx-field mb-0">
                      <label htmlFor="mname">Middle Name</label>
                      <input id="mname" className="cx-input" placeholder="Optional" value={form.middleName} onChange={(e) => update('middleName', e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="cx-field mb-0">
                      <label htmlFor="lname">Last Name <span className="req">*</span></label>
                      <input id="lname" className="cx-input" placeholder="Mehta" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="cx-field mt-3">
                  <label htmlFor="email">Email <span className="req">*</span></label>
                  <input
                    id="email" className={`cx-input ${emailValid === null ? '' : emailValid ? 'is-valid' : 'is-invalid'}`}
                    type="email" placeholder="you@college.edu"
                    value={form.email} onChange={(e) => update('email', e.target.value)}
                  />
                  {form.email && (
                    <div className={`cx-hint ${emailValid ? 'valid' : 'invalid'}`}>
                      {emailValid ? 'Looks good' : 'Enter a valid email address'}
                    </div>
                  )}
                </div>

                <div className="cx-field">
                  <label htmlFor="uid">College Unique ID <span className="req">*</span></label>
                  <input
                    id="uid" className={`cx-input ${uidValid === null ? '' : uidValid ? 'is-valid' : 'is-invalid'}`}
                    placeholder="N02122500051"
                    value={form.uid} onChange={(e) => update('uid', e.target.value.toUpperCase())}
                  />
                  <div className={`cx-hint ${form.uid ? (uidValid ? 'valid' : 'invalid') : ''}`}>
                    {form.uid && !uidValid
                      ? `Format: N + 11 digits (${form.uid.length}/12)`
                      : uidValid ? 'Valid unique ID format' : 'Format: N + 11 digits, e.g. N02122500051'}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="cx-fade-in">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="cx-field mb-0">
                      <label htmlFor="course">Course <span className="req">*</span></label>
                      <select id="course" className="cx-select" value={form.course} onChange={(e) => update('course', e.target.value)}>
                        <option value="">Select course</option>
                        {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="cx-field mb-0">
                      <label htmlFor="batchStart">Batch Start <span className="req">*</span></label>
                      <select id="batchStart" className="cx-select" value={form.batchStart} onChange={(e) => update('batchStart', +e.target.value)}>
                        {BATCH_START_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="cx-field mb-0">
                      <label htmlFor="batchEnd">Batch End <span className="req">*</span></label>
                      <select id="batchEnd" className="cx-select" value={form.batchEnd} onChange={(e) => update('batchEnd', +e.target.value)}>
                        {BATCH_END_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="cx-hero mt-4 p-4 d-flex align-items-center gap-3">
                  <i className="bi bi-mortarboard-fill" style={{ fontSize: '1.6rem', color: 'var(--c-primary)' }}></i>
                  <div className="cx-small mb-0">
                    Your course and batch help other students and faculty filter and discover your projects accurately.
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="cx-fade-in">
                <div className="cx-field">
                  <label htmlFor="password">Password <span className="req">*</span></label>
                  <div className="cx-input-group">
                    <input
                      id="password" className="cx-input" type={showPwd ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={form.password} onChange={(e) => update('password', e.target.value)}
                    />
                    <button
                      type="button" className="cx-input-icon" onClick={() => setShowPwd((s) => !s)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <div className={`cx-strength ${strengthClass}`}>
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div className="cx-hint">
                    {form.password ? `${STRENGTH_LABELS[strengthScore]} password` : 'Use 8+ characters with a mix of letters, numbers & symbols'}
                  </div>
                </div>

                <div className="cx-field">
                  <label htmlFor="confirmPassword">Confirm Password <span className="req">*</span></label>
                  <input
                    id="confirmPassword" className={`cx-input ${confirmValid === null ? '' : confirmValid ? 'is-valid' : 'is-invalid'}`}
                    type="password" placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                  />
                  {form.confirmPassword && (
                    <div className={`cx-hint ${confirmValid ? 'valid' : 'invalid'}`}>
                      {confirmValid ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                <ul className="pwd-reqs">
                  <li className={rules.len ? 'ok' : ''}><i className={`bi ${rules.len ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> At least 8 characters</li>
                  <li className={rules.upper ? 'ok' : ''}><i className={`bi ${rules.upper ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> One uppercase letter</li>
                  <li className={rules.num ? 'ok' : ''}><i className={`bi ${rules.num ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> One number</li>
                  <li className={rules.sym ? 'ok' : ''}><i className={`bi ${rules.sym ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> One special character</li>
                </ul>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button" className="cx-btn cx-btn-outline"
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                onClick={goBack}
              >
                Back
              </button>
              <button type="submit" className="cx-btn cx-btn-primary" disabled={submitting}>
                {step === 3 ? (submitting ? 'Creating account…' : 'Create Account') : 'Continue'}
              </button>
            </div>
          </form>

          <p className="cx-small text-center mt-4">
            Already have an account? <Link to="/login" className="cx-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
