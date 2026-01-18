import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('Username, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName || null
    });

    if (result.success) {
      navigate(result.redirect || '/home');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🔍</div>
            <h1>Create Account</h1>
            <p>Join Database Audit Tool</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                autoComplete="name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                autoComplete="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="new-password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="error-message" style={{ display: 'block' }}>
                {error}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              <span className={loading ? 'btn-loader' : 'btn-text'}>
                {loading ? '⏳' : 'Create Account'}
              </span>
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
