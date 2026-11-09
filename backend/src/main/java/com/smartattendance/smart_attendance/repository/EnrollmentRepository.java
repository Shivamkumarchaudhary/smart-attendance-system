package com.smartattendance.smart_attendance.repository;

import com.smartattendance.smart_attendance.entity.Enrollment;
import com.smartattendance.smart_attendance.entity.Student;
import com.smartattendance.smart_attendance.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent(Student student);
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findBySubjectId(Long subjectId);
    Optional<Enrollment> findByStudentAndSubject(Student student, Subject subject);
    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);
}
