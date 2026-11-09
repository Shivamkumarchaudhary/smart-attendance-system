package com.smartattendance.smart_attendance.repository;

import com.smartattendance.smart_attendance.entity.AttendanceSession;
import com.smartattendance.smart_attendance.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByTokenHash(String tokenHash);
    Optional<AttendanceSession> findBySessionCode(String sessionCode);
    List<AttendanceSession> findByTeacherIdOrderByStartTimeDesc(Long teacherId);
    List<AttendanceSession> findBySubjectIdOrderByStartTimeDesc(Long subjectId);
    List<AttendanceSession> findByStatus(SessionStatus status);
}
