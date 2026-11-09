import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [subjectStats, setSubjectStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get('/attendance/student/stats'),
        api.get('/attendance/student/history')
      ]);

      if (statsRes.data?.data) setSubjectStats(statsRes.data.data);
      if (historyRes.data?.data) setHistory(historyRes.data.data);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallPercentage = () => {
    if (subjectStats.length === 0) return 100;
    const totalAttended = subjectStats.reduce((sum, s) => sum + s.attendedClasses, 0);
    const totalClasses = subjectStats.reduce((sum, s) => sum + s.totalClasses, 0);
    if (totalClasses === 0) return 100;
    return Math.round((totalAttended / totalClasses) * 1000) / 10;
  };

  /**
   * Real-World University 75% Rule Forecaster:
   * Returns:
   * - If < 75%: "Need to attend X consecutive classes to reach 75%"
   * - If >= 75%: "Can safely miss Y classes without falling below 75%"
   */
  const getEligibilityForecast = (attended, total) => {
    if (total === 0) return { status: 'safe', text: 'No lectures held yet' };
    const currentPct = (attended / total) * 100;

    if (currentPct < 75) {
      // Formula to find required consecutive attendances x: (attended + x)/(total + x) >= 0.75
      // attended + x >= 0.75*total + 0.75*x
      // 0.25*x >= 0.75*total - attended
      // x >= (3*total - 4*attended)
      const needed = Math.max(1, Math.ceil((3 * total - 4 * attended)));
      return {
        status: 'critical',
        text: `⚠️ Must attend next ${needed} class${needed > 1 ? 'es' : ''} continuously to reach 75%!`
      };
    } else {
      // Formula to find safe absences y: attended / (total + y) >= 0.75
      // 0.75*(total + y) <= attended => total + y <= attended / 0.75 => y <= (4*attended - 3*total) / 3
      const canMiss = Math.floor((4 * attended - 3 * total) / 3);
      if (canMiss <= 0) {
        return { status: 'borderline', text: '⚡ On borderline! Cannot miss the next lecture.' };
      }
      return {
        status: 'safe',
        text: `🛡️ On track: You can safely miss up to ${canMiss} class${canMiss > 1 ? 'es' : ''}.`
      };
    }
  };

  const overall = calculateOverallPercentage();

  return (
    <div>
      {/* Student Profile Card */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="role-badge badge-student">AUTHENTICATED STUDENT</span>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Semester 3 (2025–2027)</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              University Roll No: <strong style={{ color: '#f8fafc' }}>{user?.identifier || 'MCA-2026-001'}</strong> • Master of Computer Applications
            </p>
          </div>

          <Link
            to="/scan"
            className="btn btn-primary"
            style={{
              padding: '0.9rem 1.8rem',
              fontSize: '1.05rem',
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>📷</span>
            <strong>Scan Classroom QR Code</strong>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: overall >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: overall >= 75 ? '#34d399' : '#f87171' }}>
            📊
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: overall >= 75 ? '#34d399' : '#f87171' }}>
              {overall}%
            </div>
            <div className="stat-label">Aggregate Attendance Average</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            📚
          </div>
          <div className="stat-info">
            <div className="stat-value">{subjectStats.length}</div>
            <div className="stat-label">Registered Subjects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
            🎓
          </div>
          <div className="stat-info">
            <div className="stat-value">{overall >= 75 ? 'ELIGIBLE' : 'DEBARRED'}</div>
            <div className="stat-label">Exam Hall Ticket Status</div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Analytics & Forecast */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Curriculum Attendance & Forecast Engine</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Calculated dynamically against the institutional 75% minimum semester requirement
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {subjectStats.map((sub) => {
            const isCritical = sub.lowAttendanceWarning;
            const forecast = getEligibilityForecast(sub.attendedClasses, sub.totalClasses);
            const progressColor = sub.attendancePercentage >= 85 ? 'progress-green' : sub.attendancePercentage >= 75 ? 'progress-amber' : 'progress-red';

            return (
              <div
                key={sub.subjectId}
                className="card"
                style={{
                  borderLeft: isCritical ? '4px solid #ef4444' : '4px solid #10b981',
                  background: 'linear-gradient(145deg, #1e293b, #0f172a)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                    {sub.subjectCode}
                  </span>
                  {isCritical ? (
                    <span className="status-pill status-absent" style={{ fontSize: '0.7rem' }}>
                      ⚠️ SHORTAGE (&lt;75%)
                    </span>
                  ) : (
                    <span className="status-pill status-present" style={{ fontSize: '0.7rem' }}>
                      ✓ QUALIFIED
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {sub.subjectName}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Attended: <strong>{sub.attendedClasses}</strong> / {sub.totalClasses} Lectures
                  </span>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: sub.attendancePercentage >= 75 ? '#34d399' : '#f87171'
                    }}
                  >
                    {sub.attendancePercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-container" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar-fill ${progressColor}`}
                    style={{ width: `${Math.min(100, sub.attendancePercentage)}%` }}
                  ></div>
                </div>

                {/* Real-World Forecaster Pill */}
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: forecast.status === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(51, 65, 85, 0.4)',
                    color: forecast.status === 'critical' ? '#fca5a5' : '#cbd5e1',
                    border: forecast.status === 'critical' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(51, 65, 85, 0.6)'
                  }}
                >
                  {forecast.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Check-In History Log */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Personal Attendance History</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Immutable ledger verified via Smart QR</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Face Selfie</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>GPS Geofence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No attendance records logged yet. Use the scan button above during class!
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.markedAt).toLocaleString()}</td>
                    <td>
                      {item.faceSnapshot ? (
                        <img
                          src={item.faceSnapshot}
                          alt="Face"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981', cursor: 'pointer' }}
                          onClick={() => setSelectedPhoto(item.faceSnapshot)}
                          title="Click to view verified selfie"
                        />
                      ) : (
                        <span style={{ fontSize: '1.2rem' }}>👤</span>
                      )}
                    </td>
                    <td><strong style={{ color: '#38bdf8' }}>{item.subjectCode}</strong></td>
                    <td>{item.subjectName}</td>
                    <td>
                      <span className="status-pill status-present" style={{ fontSize: '0.75rem' }}>
                        📍 {item.distanceMeters != null ? `${item.distanceMeters}m (Campus Zone)` : 'Verified (In Zone)'}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-present">PRESENT</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selfie Preview Modal */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>🤳 My Verified Attendance Selfie</h3>
            <div style={{ margin: '0 auto', maxWidth: '280px' }}>
              <img
                src={selectedPhoto}
                alt="My Face Selfie"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '3px solid #10b981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
              ✓ Biometrically verified in real-time
            </p>
            <button onClick={() => setSelectedPhoto(null)} className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
