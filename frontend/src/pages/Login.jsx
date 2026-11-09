import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'ADMIN') navigate('/admin');
      else if (result.user.role === 'TEACHER') navigate('/teacher');
      else if (result.user.role === 'STUDENT') navigate('/student');
    } else {
      setError(result.message);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 1.25rem', width: '64px', height: '64px', borderRadius: '18px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#loginLogoGrad)" />
              <path d="M7 7H10V10H7V7Z" fill="white" />
              <path d="M14 7H17V10H14V7Z" fill="white" />
              <path d="M7 14H10V17H7V14Z" fill="white" />
              <path d="M14 14H17V17H14V14Z" fill="white" />
              <circle cx="12" cy="12" r="2" fill="#38bdf8" />
              <defs>
                <linearGradient id="loginLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            AttendSync Pro • University Authentication Gateway
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. teacher1@smartattendance.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.85rem' }}>
            ⚡ <strong>One-Click Demo Credentials (Click to prefill)</strong>:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <button type="button" className="quick-login-btn" onClick={() => handleQuickFill('admin@smartattendance.edu')}>
              <strong style={{ color: '#c4b5fd' }}>👑 Admin</strong>
              admin@edu
            </button>
            <button type="button" className="quick-login-btn" onClick={() => handleQuickFill('teacher1@smartattendance.edu')}>
              <strong style={{ color: '#60a5fa' }}>👨‍🏫 Teacher</strong>
              teacher1@edu
            </button>
            <button type="button" className="quick-login-btn" onClick={() => handleQuickFill('student1@gmail.com')}>
              <strong style={{ color: '#34d399' }}>🎓 Student</strong>
              student1@gmail
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.85rem' }}>
            Default password: <code>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
