import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Full Stack Java Architecture & REST APIs');
  const [lectureType, setLectureType] = useState('Theory Lecture');
  const [section, setSection] = useState('Section A');
  const [roomNumber, setRoomNumber] = useState('Lab 201 - Advanced Computing');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [activeSession, setActiveSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    return () => {
      clearInterval(pollIntervalRef.current);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [subjectsRes, sessionsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/sessions/teacher/my-sessions')
      ]);

      if (subjectsRes.data?.data && subjectsRes.data.data.length > 0) {
        setSubjects(subjectsRes.data.data);
        setSelectedSubject(subjectsRes.data.data[0].id.toString());
      }

      if (sessionsRes.data?.data) {
        setPastSessions(sessionsRes.data.data);
        const live = sessionsRes.data.data.find(s => s.status === 'ACTIVE' && s.remainingSeconds > 0);
        if (live) {
          loadSessionDetails(live.id);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load subjects or sessions from backend service.');
    }
  };

  const loadSessionDetails = async (sessionId) => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      if (res.data?.data) {
        setActiveSession(res.data.data);
        fetchSessionAttendees(sessionId);
        startPolling(sessionId);
      }
    } catch (err) {
      console.error('Error loading session:', err);
    }
  };

  const fetchSessionAttendees = async (sessionId) => {
    try {
      const res = await api.get(`/sessions/${sessionId}/records`);
      if (res.data?.data) {
        setAttendees(res.data.data);
      }
    } catch (err) {
      console.error('Error loading attendees:', err);
    }
  };

  const startPolling = (sessionId) => {
    clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const [sessionRes, recordsRes] = await Promise.all([
          api.get(`/sessions/${sessionId}`),
          api.get(`/sessions/${sessionId}/records`)
        ]);

        if (sessionRes.data?.data) {
          const updated = sessionRes.data.data;
          setActiveSession(updated);
          if (updated.status !== 'ACTIVE' || updated.remainingSeconds <= 0) {
            clearInterval(pollIntervalRef.current);
          }
        }
        if (recordsRes.data?.data) {
          setAttendees(recordsRes.data.data);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setError('Please select a subject from the curriculum dropdown');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const combinedTitle = `${lectureType} (${section}) - ${sessionTitle}`;
      const res = await api.post('/sessions', {
        subjectId: Number(selectedSubject),
        sessionTitle: combinedTitle,
        roomNumber,
        durationMinutes: Number(durationMinutes)
      });

      if (res.data?.data) {
        setActiveSession(res.data.data);
        setMessage('Attendance session started! Present QR code on classroom projector.');
        startPolling(res.data.data.id);

        const sessionsRes = await api.get('/sessions/teacher/my-sessions');
        if (sessionsRes.data?.data) setPastSessions(sessionsRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleRotateToken = async () => {
    if (!activeSession) return;
    try {
      const res = await api.post(`/sessions/${activeSession.id}/rotate`);
      if (res.data?.data) {
        setActiveSession(res.data.data);
        setMessage('🛡️ QR Token rotated successfully! Previous screenshots/photos are now rejected.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rotate token');
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      const res = await api.patch(`/sessions/${activeSession.id}/close`);
      if (res.data?.data) {
        setActiveSession(null);
        clearInterval(pollIntervalRef.current);
        setMessage('Attendance session ended and finalized.');
        const sessionsRes = await api.get('/sessions/teacher/my-sessions');
        if (sessionsRes.data?.data) setPastSessions(sessionsRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close session');
    }
  };

  const exportToCSV = () => {
    if (attendees.length === 0) {
      alert('No attendance records to export for this session.');
      return;
    }

    const headers = ['Serial No', 'Roll Number', 'Student Name', 'Status', 'Time Marked', 'Device Info'];
    const rows = attendees.map((rec, i) => [
      i + 1,
      rec.rollNumber,
      `"${rec.studentName}"`,
      rec.status,
      new Date(rec.markedAt).toLocaleString(),
      `"${rec.deviceInfo || 'Mobile Browser'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${activeSession?.subjectCode || 'Session'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div>
      {/* Top Faculty Header */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="role-badge badge-teacher">FACULTY INSTRUCTION CONSOLE</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Welcome, {user?.name || 'Faculty Member'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Faculty ID: <strong style={{ color: 'var(--text)' }}>{user?.identifier || 'EMP-T-101'}</strong> • Department of Computer Applications
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="hero-stat-item" style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              <span className="stat-number" style={{ fontSize: '1.4rem' }}>{pastSessions.length}</span>
              <span className="stat-caption">Total Sessions Held</span>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1.1fr 1fr' : '1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Create Session Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span style={{ fontSize: '1.3rem' }}>⚡</span>
              Create Real-Time Attendance Session
            </h2>
          </div>

          <form onSubmit={handleCreateSession}>
            <div className="form-group">
              <label className="form-label">
                Select Curriculum Subject <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-control"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                style={{ fontSize: '1rem', fontWeight: 600, padding: '0.85rem' }}
              >
                {subjects.length === 0 ? (
                  <option value="">Loading curriculum subjects...</option>
                ) : (
                  subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.subjectCode}] {s.subjectName} — Semester {s.semester} ({s.credits} Credits)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Class Section</label>
                <select className="form-control" value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="Section A">Section A (Morning)</option>
                  <option value="Section B">Section B (Afternoon)</option>
                  <option value="Combined All Sections">Combined (All Sections)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Instruction Type</label>
                <select className="form-control" value={lectureType} onChange={(e) => setLectureType(e.target.value)}>
                  <option value="Theory Lecture">Theory Lecture</option>
                  <option value="Practical Lab">Practical Lab Session</option>
                  <option value="Tutorial Session">Tutorial Session</option>
                  <option value="Remedial / Extra Class">Remedial Class</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Lecture Topic / Unit</label>
                <input
                  type="text"
                  className="form-control"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Spring Data JPA Architecture"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room / Lab Facility</label>
                <input
                  type="text"
                  className="form-control"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Lab 201"
                />
              </div>
            </div>

            <div className="form-group" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Dynamic QR Lifetime (TTL): <strong style={{ color: '#38bdf8' }}>{durationMinutes} Minutes</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-expires when timer hits 0</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                <span onClick={() => setDurationMinutes(2)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>2 mins (Rapid Scan)</span>
                <span onClick={() => setDurationMinutes(5)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>5 mins (Standard)</span>
                <span onClick={() => setDurationMinutes(15)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>15 mins (Extended)</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: '0.85rem', fontSize: '1rem' }}>
              {loading ? 'Initializing Session...' : '🚀 Generate Classroom Attendance QR'}
            </button>
          </form>
        </div>

        {/* Live Projected QR Card */}
        {activeSession && (
          <div className="card live-session-glow" style={{ textAlign: 'center', borderColor: '#3b82f6' }}>
            <div className="card-header" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <span className="status-pill status-active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="pulsing-dot" style={{ background: '#60a5fa' }}></span>
                SESSION ACTIVE
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeSession.sessionCode}</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              {activeSession.subjectCode}: {activeSession.subjectName}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {activeSession.sessionTitle} • {activeSession.roomNumber}
            </p>

            {/* QR Viewport */}
            <div className="qr-display-box" style={{ margin: '0 auto', border: '3px solid #3b82f6' }}>
              {activeSession.qrBase64 ? (
                <img src={activeSession.qrBase64} alt="Classroom QR Code" className="qr-image" style={{ width: '290px', height: '290px' }} />
              ) : (
                <div style={{ width: '290px', height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>
                  QR Code Expired
                </div>
              )}
            </div>

            {/* Quick Token Display & Copy for Single-Machine Testing */}
            {activeSession.token && (
              <div style={{ marginTop: '0.9rem', background: '#0f172a', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Session Token:</span>
                <code style={{ color: '#38bdf8', fontSize: '0.8rem', userSelect: 'all' }}>{activeSession.token}</code>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(activeSession.token);
                    alert('Token copied to clipboard! You can paste it on the Student Scanner page.');
                  }}
                >
                  📋 Copy
                </button>
              </div>
            )}

            {/* Remaining Countdown Progress Bar */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <span>Scan Window Timer</span>
                <span style={{ color: activeSession.remainingSeconds < 60 ? '#ef4444' : '#38bdf8' }}>
                  ⏱️ {formatSeconds(activeSession.remainingSeconds)} remaining
                </span>
              </div>
              <div className="progress-bar-container" style={{ height: '10px' }}>
                <div
                  className={`progress-bar-fill ${activeSession.remainingSeconds < 60 ? 'progress-red' : 'progress-green'}`}
                  style={{ width: `${Math.min(100, (activeSession.remainingSeconds / (durationMinutes * 60)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Anti-Proxy Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleRotateToken}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.65rem' }}
                title="Generates a new QR token while keeping session alive. Rejects forwarded screenshots."
              >
                🔄 Rotate Token (Anti-Proxy)
              </button>
              <button
                type="button"
                onClick={handleCloseSession}
                className="btn btn-danger"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.65rem' }}
              >
                ⏹️ Finalize Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Attendees Feed */}
      {activeSession && (
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">
              <span style={{ fontSize: '1.3rem' }}>👥</span>
              Live Verified Check-Ins ({attendees.length} Students Logged)
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>● Telemetry Live</span>
              <button onClick={exportToCSV} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                📥 Export CSV
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Facial Selfie</th>
                  <th>Student Roll No.</th>
                  <th>Student Name</th>
                  <th>GPS Geofence</th>
                  <th>Check-In Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendees.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Awaiting students to scan the projected QR code...
                    </td>
                  </tr>
                ) : (
                  attendees.map((rec, index) => (
                    <tr key={rec.id}>
                      <td>{index + 1}</td>
                      <td>
                        {rec.faceSnapshot ? (
                          <img
                            src={rec.faceSnapshot}
                            alt="Face"
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981', cursor: 'pointer' }}
                            onClick={() => setSelectedPhoto({ photo: rec.faceSnapshot, studentName: rec.studentName, rollNumber: rec.rollNumber })}
                            title="Click to view verified face snapshot"
                          />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👤
                          </div>
                        )}
                      </td>
                      <td><code style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{rec.rollNumber}</code></td>
                      <td><strong>{rec.studentName}</strong></td>
                      <td>
                        <span className="status-pill status-present" style={{ fontSize: '0.75rem' }}>
                          📍 {rec.distanceMeters != null ? `${rec.distanceMeters}m (Campus Zone)` : 'Verified (In Zone)'}
                        </span>
                      </td>
                      <td>{new Date(rec.markedAt).toLocaleTimeString()}</td>
                      <td><span className="status-pill status-present">PRESENT</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session History Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Faculty Attendance Records History</h2>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session Code</th>
                <th>Subject</th>
                <th>Lecture Topic</th>
                <th>Room</th>
                <th>Timestamp</th>
                <th>Attendance Count</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pastSessions.map((s) => (
                <tr key={s.id}>
                  <td><code>{s.sessionCode}</code></td>
                  <td><strong>{s.subjectCode}</strong> - {s.subjectName}</td>
                  <td>{s.sessionTitle}</td>
                  <td>{s.roomNumber}</td>
                  <td>{new Date(s.startTime).toLocaleString()}</td>
                  <td><strong style={{ color: '#38bdf8', fontSize: '1rem' }}>{s.presentCount}</strong> students</td>
                  <td>
                    <span className={`status-pill ${s.status === 'ACTIVE' ? 'status-active' : 'status-closed'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        loadSessionDetails(s.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Face Snapshot Modal */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ maxWidth: '420px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>📸 Verified Face Snapshot</h3>
            <div style={{ margin: '0 auto', maxWidth: '300px' }}>
              <img
                src={typeof selectedPhoto === 'string' ? selectedPhoto : selectedPhoto.photo}
                alt="Student Face"
                style={{
                  width: '100%',
                  maxHeight: '320px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '3px solid #10b981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                }}
              />
            </div>
            {selectedPhoto.studentName && (
              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPhoto.studentName}</h4>
                <p style={{ color: '#38bdf8', fontSize: '0.85rem' }}>Roll: {selectedPhoto.rollNumber}</p>
              </div>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              ✓ Biometrically verified presence during check-in
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

export default TeacherDashboard;
