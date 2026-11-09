package com.smartattendance.smart_attendance.repository;

import com.smartattendance.smart_attendance.entity.AttendanceRecord;
import com.smartattendance.smart_attendance.entity.AttendanceSession;
import com.smartattendance.smart_attendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    
    Optional<AttendanceRecord> findBySessionAndStudent(AttendanceSession session, Student student);
    
    boolean existsBySessionIdAndStudentId(Long sessionId, Long studentId);

    boolean existsBySessionIdAndDeviceFingerprint(Long sessionId, String deviceFingerprint);
    
    List<AttendanceRecord> findBySessionIdOrderByMarkedAtAsc(Long sessionId);
    
    List<AttendanceRecord> findByStudentIdOrderByMarkedAtDesc(Long studentId);
    
    @Query("SELECT r FROM AttendanceRecord r WHERE r.student.id = :studentId AND r.session.subject.id = :subjectId")
    List<AttendanceRecord> findByStudentIdAndSubjectId(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);
    
    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.session.id = :sessionId")
    long countBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.student.id = :studentId AND r.session.subject.id = :subjectId")
    long countAttendedByStudentAndSubject(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);

    @Query("SELECT COUNT(s) FROM AttendanceSession s WHERE s.subject.id = :subjectId")
    long countTotalSessionsBySubject(@Param("subjectId") Long subjectId);
}
