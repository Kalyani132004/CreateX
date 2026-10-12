
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  // Token and UID are coming from the URL path:
  // /reset-password/:uid/:token/
  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  console.log('UID:', uid);
  console.log('TOKEN:', token);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    // Check reset link
    if (!uid || !token) {
      setError('Invalid or expired password reset link.');
      return;
    }

    // Check passwords
    if (!password || !confirmPassword) {
      setError('Please enter both passwords.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        uid,
        token,
        password,
      });

      setMessage(
        'Password reset successful. Redirecting to login...'
      );

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);

      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Unable to reset password. The link may be invalid or expired.';

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="p-4 p-md-5 rounded-4 shadow-lg"
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">
            Reset Password
          </h2>

          <p className="text-muted mb-0">
            Create a new password for your account.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-3">
            <label
              htmlFor="password"
              className="form-label fw-semibold"
            >
              New Password
            </label>

            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control form-control-lg"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label
              htmlFor="confirmPassword"
              className="form-label fw-semibold"
            >
              Confirm Password
            </label>

            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="form-control form-control-lg"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                disabled={loading}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                disabled={loading}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="small text-muted mb-4">
            Password must contain at least 8 characters.
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading
              ? 'Resetting Password...'
              : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="cx-link cx-small"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
