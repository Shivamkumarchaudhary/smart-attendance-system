import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'TEACHER': return 'badge-teacher';
      case 'STUDENT': return 'badge-student';
      default: return 'badge-default';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#logoGrad)" />
              <path d="M7 7H10V10H7V7Z" fill="white" />
              <path d="M14 7H17V10H14V7Z" fill="white" />
              <path d="M7 14H10V17H7V14Z" fill="white" />
              <path d="M14 14H17V17H14V14Z" fill="white" />
              <circle cx="12" cy="12" r="2" fill="#38bdf8" />
              <path d="M4 12C4 7.58172 7.58172 4 12 4" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
              <defs>
                <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span className="brand-title">ATTEND<span style={{ color: '#38bdf8', fontWeight: 900 }}>SYNC</span> <span className="brand-badge-pro">PRO</span></span>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: 600 }}>CAMPUS SMART ATTENDANCE</span>
          </div>
        </Link>

        <div className="navbar-user-section">
          {user ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
                📊 My Dashboard
              </Link>

              <div className="user-info-box">
                <span className="user-name">{user.name}</span>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role} {user.identifier ? `• ${user.identifier}` : ''}
                </span>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="Sign out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
                Sign In Portal →
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
