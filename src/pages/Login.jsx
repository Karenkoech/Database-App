import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      navigate(result.redirect || '/home');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🔍</div>
            <h1>Database Audit Tool</h1>
            <p>AI-Powered Script Analysis for IT Auditors</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="error-message" style={{ display: 'block' }}>
                {error}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              <span className={loading ? 'btn-loader' : 'btn-text'}>
                {loading ? '⏳' : 'Sign In'}
              </span>
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                Create Account
              </Link>
            </p>
            <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#999' }}>
              Default credentials: <strong>admin</strong> / <strong>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
