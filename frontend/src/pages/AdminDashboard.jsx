import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNumber: '',
    courseId: '',
    semester: 3,
    section: 'A',
    phone: '+91 9876543210'
  });

  // Add Teacher Form State
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    phone: '+91 9800000000',
    password: 'password123'
  });

  // Add Subject Form State
  const [newSubject, setNewSubject] = useState({
    subjectCode: '',
    subjectName: '',
    courseId: '',
    semester: 1,
    credits: 4
  });

  // Report Filter State
  const [reportSubjectFilter, setReportSubjectFilter] = useState('ALL');
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [overviewRes, studentsRes, teachersRes, subjectsRes, coursesRes, reportsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/students'),
        api.get('/admin/teachers'),
        api.get('/admin/subjects'),
        api.get('/admin/courses'),
        api.get('/admin/reports')
      ]);

      if (overviewRes.data?.data) setOverview(overviewRes.data.data);
      if (studentsRes.data?.data) setStudents(studentsRes.data.data);
      if (teachersRes.data?.data) setTeachers(teachersRes.data.data);
      if (subjectsRes.data?.data) setSubjects(subjectsRes.data.data);
      if (coursesRes.data?.data) {
        setCourses(coursesRes.data.data);
        if (coursesRes.data.data.length > 0) {
          setNewStudent(prev => ({ ...prev, courseId: coursesRes.data.data[0].id.toString() }));
          setNewSubject(prev => ({ ...prev, courseId: coursesRes.data.data[0].id.toString() }));
        }
      }
      if (reportsRes.data?.data) setReports(reportsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.post('/admin/students', {
        ...newStudent,
        courseId: Number(newStudent.courseId),
        semester: Number(newStudent.semester)
      });

      if (res.data?.success) {
        setMessage(`Student ${newStudent.name} (${newStudent.rollNumber}) registered and enrolled successfully!`);
        setShowAddModal(false);
        setNewStudent({
          name: '',
          email: '',
          rollNumber: '',
          courseId: courses[0]?.id?.toString() || '',
          semester: 3,
          section: 'A',
          phone: '+91 9876543210'
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student account');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to permanently delete student record: ${studentName}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/students/${studentId}`);
      setMessage(`Student record deleted.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.post('/admin/teachers', newTeacher);

      if (res.data?.success) {
        setMessage(`Teacher ${newTeacher.name} (${newTeacher.employeeId}) added successfully!`);
        setShowAddTeacherModal(false);
        setNewTeacher({
          name: '',
          email: '',
          employeeId: '',
          department: 'Computer Science & Engineering',
          designation: 'Assistant Professor',
          phone: '+91 9800000000',
          password: 'password123'
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher account');
    }
  };

  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (!window.confirm(`Are you sure you want to permanently delete teacher record: ${teacherName}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/teachers/${teacherId}`);
      setMessage(`Teacher record deleted.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.post('/admin/subjects', {
        ...newSubject,
        courseId: Number(newSubject.courseId),
        semester: Number(newSubject.semester),
        credits: Number(newSubject.credits)
      });

      if (res.data?.success) {
        setMessage(`Subject [${newSubject.subjectCode}] ${newSubject.subjectName} added successfully!`);
        setShowAddSubjectModal(false);
        setNewSubject({
          subjectCode: '',
          subjectName: '',
          courseId: courses[0]?.id?.toString() || '',
          semester: 1,
          credits: 4
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete subject: ${subjectName}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/subjects/${subjectId}`);
      setMessage(`Subject deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  const exportReportCSV = () => {
    if (filteredReports.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['Roll Number', 'Student Name', 'Course', 'Semester', 'Subject Code', 'Subject Name', 'Attended', 'Total Classes', 'Percentage', 'Eligibility Status'];
    const rows = filteredReports.map(r => [
      r.rollNumber,
      `"${r.studentName}"`,
      r.course,
      r.semester,
      r.subjectCode,
      `"${r.subjectName}"`,
      r.attended,
      r.total,
      `${r.percentage}%`,
      r.eligible ? 'ELIGIBLE' : 'DEBARRED (<75%)'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Institutional_Attendance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = reports.filter(r => {
    const matchSubject = reportSubjectFilter === 'ALL' || r.subjectCode === reportSubjectFilter;
    const matchStatus = reportStatusFilter === 'ALL' || (reportStatusFilter === 'DEBARRED' && !r.eligible) || (reportStatusFilter === 'ELIGIBLE' && r.eligible);
    return matchSubject && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="role-badge badge-admin">GOVERNANCE CONSOLE</span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.4rem' }}>Institutional Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Student Management, Academic Reports, and Master Audit Controls.</p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>➕</span> Add New Student
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>👥</div>
          <div className="stat-info">
            <div className="stat-value">{overview?.totalStudents || 0}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>👨‍🏫</div>
          <div className="stat-info">
            <div className="stat-value">{overview?.totalTeachers || 0}</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>📖</div>
          <div className="stat-info">
            <div className="stat-value">{overview?.totalSubjects || 0}</div>
            <div className="stat-label">Curriculum Subjects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{overview?.totalAttendanceRecords || 0}</div>
            <div className="stat-label">Verified Check-Ins</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('overview')}>
          Master Overview
        </button>
        <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('students')}>
          Student Directory ({students.length})
        </button>
        <button className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('reports')}>
          📊 Institutional Reports ({reports.length})
        </button>
        <button className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('teachers')}>
          Faculty Directory ({teachers.length})
        </button>
        <button className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('subjects')}>
          Subjects ({subjects.length})
        </button>
      </div>

      {/* Tab: Student Directory with Full Management */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Enrolled Students Directory</h2>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
              + Add Student
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Degree Program</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td><strong style={{ color: '#38bdf8' }}>{s.rollNumber}</strong></td>
                    <td>{s.user?.name}</td>
                    <td>{s.user?.email}</td>
                    <td>{s.course?.courseCode}</td>
                    <td>Sem {s.semester}</td>
                    <td>{s.section}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteStudent(s.id, s.user?.name)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Comprehensive Attendance Reports */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="card-title">Academic Compliance & Eligibility Reports</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Shows attendance percentage across all enrolled students with 75% cutoff status
              </p>
            </div>
            <button onClick={exportReportCSV} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              📥 Export CSV Report
            </button>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Subject</label>
              <select className="form-control" value={reportSubjectFilter} onChange={(e) => setReportSubjectFilter(e.target.value)}>
                <option value="ALL">All Curriculum Subjects</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.subjectCode}>[{sub.subjectCode}] {sub.subjectName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Eligibility (75% Threshold)</label>
              <select className="form-control" value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value)}>
                <option value="ALL">All Students</option>
                <option value="DEBARRED">⚠️ Shortage Only (&lt; 75%)</option>
                <option value="ELIGIBLE">✓ Eligible Only (≥ 75%)</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Attended</th>
                  <th>Total Classes</th>
                  <th>Attendance %</th>
                  <th>Hall Ticket Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No attendance report matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r, i) => (
                    <tr key={i}>
                      <td><code style={{ color: '#38bdf8' }}>{r.rollNumber}</code></td>
                      <td><strong>{r.studentName}</strong></td>
                      <td><code>{r.subjectCode}</code></td>
                      <td>{r.subjectName}</td>
                      <td>{r.attended}</td>
                      <td>{r.total}</td>
                      <td>
                        <strong style={{ color: r.percentage >= 75 ? '#34d399' : '#f87171' }}>
                          {r.percentage}%
                        </strong>
                      </td>
                      <td>
                        <span className={`status-pill ${r.eligible ? 'status-present' : 'status-absent'}`}>
                          {r.eligible ? '✓ ELIGIBLE' : '⚠️ DEBARRED (<75%)'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Teachers Directory */}
      {activeTab === 'teachers' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Faculty Members Directory</h2>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
            >
              + Add Teacher
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Faculty Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td><strong style={{ color: '#a78bfa' }}>{t.employeeId}</strong></td>
                    <td>{t.user?.name}</td>
                    <td>{t.user?.email}</td>
                    <td>{t.department}</td>
                    <td>{t.designation}</td>
                    <td>{t.phone}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteTeacher(t.id, t.user?.name)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Curriculum Subjects */}
      {activeTab === 'subjects' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Curriculum Subjects</h2>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
            >
              + Add Subject
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td><code>{sub.subjectCode}</code></td>
                    <td><strong>{sub.subjectName}</strong></td>
                    <td>{sub.course?.courseCode}</td>
                    <td>Sem {sub.semester}</td>
                    <td>{sub.credits} Credits</td>
                    <td>
                      <button
                        onClick={() => handleDeleteSubject(sub.id, sub.subjectName)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>🛡️ Security & Anti-Proxy Architecture</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <li>✓ <strong>1. Facial Verification:</strong> Real-time selfie snapshot captured directly via video stream.</li>
              <li>✓ <strong>2. GPS Geofence Verification:</strong> Enforces student proximity within campus bounds using the Haversine formula.</li>
              <li>✓ <strong>3. Double-Layer Duplicate Prevention:</strong> In-memory validation + MySQL <code>UNIQUE(session_id, student_id)</code> constraint.</li>
              <li>✓ <strong>4. Dynamic Rolling QR:</strong> Tokens rotate every 15–20s to invalidate remote screenshot sharing.</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>📈 University Compliance & 75% Rule</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Any student with attendance below <strong>75%</strong> is automatically flagged in red as <code>DEBARRED</code> across all student and faculty reports.
            </p>
            <div style={{ padding: '0.85rem', background: '#0f172a', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
              <div><strong>Formula:</strong> <code>(Attended Classes / Total Held Classes) * 100</code></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Student */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">➕ Register & Enroll Student</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Vikramaditya Singh"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="vikram@student.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MCA-2026-005"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Degree Program</label>
                  <select
                    className="form-control"
                    value={newStudent.courseId}
                    onChange={(e) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-control"
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: Number(e.target.value) })}
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create & Auto-Enroll Student
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Teacher */}
      {showAddTeacherModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Faculty Member</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Create faculty account with credentials to host attendance sessions
                </p>
              </div>
              <button onClick={() => setShowAddTeacherModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleAddTeacher}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dr. Ananya Sen"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ananya@smartattendance.edu"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="EMP-104"
                    value={newTeacher.employeeId}
                    onChange={(e) => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Computer Science & Engineering"
                    value={newTeacher.department}
                    onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Associate Professor"
                    value={newTeacher.designation}
                    onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Password</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Teacher Account
                </button>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Subject */}
      {showAddSubjectModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add Curriculum Subject</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Register a new academic course subject for attendance tracking
                </p>
              </div>
              <button onClick={() => setShowAddSubjectModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleAddSubject}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CS405"
                    value={newSubject.subjectCode}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Artificial Intelligence & ML"
                    value={newSubject.subjectName}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Degree Program</label>
                  <select
                    className="form-control"
                    value={newSubject.courseId}
                    onChange={(e) => setNewSubject({ ...newSubject, courseId: e.target.value })}
                    required
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-control"
                    value={newSubject.semester}
                    onChange={(e) => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                  >
                    <option value={1}>Sem 1</option>
                    <option value={2}>Sem 2</option>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-control"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Subject
                </button>
                <button type="button" onClick={() => setShowAddSubjectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
