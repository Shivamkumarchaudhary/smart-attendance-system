package com.smartattendance.smart_attendance.repository;

import com.smartattendance.smart_attendance.entity.Student;
import com.smartattendance.smart_attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByRollNumber(String rollNumber);
    List<Student> findByCourseIdAndSemester(Long courseId, int semester);
}
