import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="pulsing-dot"></span>
          Next-Gen Academic ERP • AttendSync Pro Live
        </div>

        <h1 className="hero-title">
          QR Smart Attendance Platform <br />
          <span className="gradient-text">Engineered for Real-World Campuses</span>
        </h1>

        <p className="hero-subtitle">
          Eliminate paper roll-calls and proxy attendance with military-grade rolling QR codes,
          instant face selfie biometrics, GPS geofencing, and automated 75% university eligibility compliance.
        </p>

        <div className="hero-cta-group">
          {user ? (
            <Link
              to={user.role === 'ADMIN' ? '/admin' : user.role === 'TEACHER' ? '/teacher' : '/student'}
              className="btn btn-primary btn-hero"
            >
              Go to Your Dashboard ({user.role}) →
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-hero">
                Launch Portal Login →
              </Link>
              <a href="#features" className="btn btn-secondary btn-hero">
                Explore Architecture
              </a>
            </>
          )}
        </div>

        {/* Live Metrics Ticker */}
        <div className="hero-stats-bar">
          <div className="hero-stat-item">
            <span className="stat-number">0.4s</span>
            <span className="stat-caption">Average Scan Latency</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-caption">Zero-Proxy Guarantee</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="stat-number">75%</span>
            <span className="stat-caption">University Threshold Alert</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="stat-number">AES/HMAC</span>
            <span className="stat-caption">Cryptographic Security</span>
          </div>
        </div>
      </section>

      {/* Role Access Cards */}
      <section className="portals-section">
        <div className="section-header">
          <h2 className="section-title">Institutional Roles & Access Hub</h2>
          <p className="section-subtitle">Tailored, role-restricted interfaces for university workflow governance</p>
        </div>

        <div className="portal-cards-grid">
          {/* Teacher Portal */}
          <div className="portal-card">
            <div className="portal-icon-box portal-icon-teacher">👨‍🏫</div>
            <h3 className="portal-card-title">Faculty & Teacher Portal</h3>
            <p className="portal-card-desc">
              Generate dynamic, time-limited QR codes projected in the lecture hall.
              Monitor live check-in feeds with instantaneous student roll numbers.
            </p>
            <ul className="portal-feature-list">
              <li>✓ Subject & Section-wise session creator</li>
              <li>✓ 15s Rolling QR code anti-proxy engine</li>
              <li>✓ Live attendee count and CSV export</li>
            </ul>
            <Link to="/login" className="portal-link">Login as Faculty →</Link>
          </div>

          {/* Student Portal */}
          <div className="portal-card featured-portal">
            <div className="portal-badge-featured">Most Active</div>
            <div className="portal-icon-box portal-icon-student">🎓</div>
            <h3 className="portal-card-title">Student Mobile Portal</h3>
            <p className="portal-card-desc">
              Scan classroom QR codes in seconds through any standard mobile browser without installing bulky third-party apps.
            </p>
            <ul className="portal-feature-list">
              <li>✓ In-browser camera QR laser scanner</li>
              <li>✓ Subject-wise percentage & shortage warnings</li>
              <li>✓ "Classes needed for 75%" attendance calculator</li>
            </ul>
            <Link to="/login" className="portal-link">Login as Student →</Link>
          </div>

          {/* Admin Portal */}
          <div className="portal-card">
            <div className="portal-icon-box portal-icon-admin">🏛️</div>
            <h3 className="portal-card-title">Admin Governance Console</h3>
            <p className="portal-card-desc">
              High-level institutional telemetry, department management, curriculum allocation, and audit compliance logging.
            </p>
            <ul className="portal-feature-list">
              <li>✓ Master faculty & student directories</li>
              <li>✓ University eligibility tracking</li>
              <li>✓ Database-level unique constraint audit</li>
            </ul>
            <Link to="/login" className="portal-link">Access Admin Console →</Link>
          </div>
        </div>
      </section>

      {/* Core Engineering Features */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Smart Attendance Beats Biometrics & Paper</h2>
          <p className="section-subtitle">Enterprise-grade engineering solves real-world classroom bottlenecks</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h4 className="feature-card-title">Anti-Proxy Unique Key Constraint</h4>
            <p className="feature-card-desc">
              Enforced at the MySQL engine level with <code>UNIQUE(session_id, student_id)</code>.
              Even if two duplicate requests hit the server in the same millisecond, race conditions are blocked.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h4 className="feature-card-title">Dynamic Rolling QR & TTL</h4>
            <p className="feature-card-desc">
              Sessions auto-expire within a configurable 1–15 minute window.
              Teachers can rotate tokens every 15–20s so students cannot message screenshots to absent peers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4 className="feature-card-title">Mandatory 75% Rule Engine</h4>
            <p className="feature-card-desc">
              Automatically alerts students when attendance dips below 75%.
              Empowers students with exact numbers needed to regain exam hall ticket eligibility.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h4 className="feature-card-title">Zero Installation PWA Standard</h4>
            <p className="feature-card-desc">
              Built on React 18 and HTML5 MediaDevices. Works natively on Android Chrome and iOS Safari
              without downloading heavy .apk files from app stores.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
