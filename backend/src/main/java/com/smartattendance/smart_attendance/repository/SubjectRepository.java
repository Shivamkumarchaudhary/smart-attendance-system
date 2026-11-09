package com.smartattendance.smart_attendance.repository;

import com.smartattendance.smart_attendance.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    List<Subject> findByCourseId(Long courseId);
    List<Subject> findByCourseIdAndSemester(Long courseId, int semester);
}
