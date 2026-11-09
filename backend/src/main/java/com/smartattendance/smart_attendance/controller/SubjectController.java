package com.smartattendance.smart_attendance.controller;

import com.smartattendance.smart_attendance.dto.ApiResponse;
import com.smartattendance.smart_attendance.entity.Course;
import com.smartattendance.smart_attendance.entity.Subject;
import com.smartattendance.smart_attendance.repository.CourseRepository;
import com.smartattendance.smart_attendance.repository.SubjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;

    public SubjectController(SubjectRepository subjectRepository, CourseRepository courseRepository) {
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Subjects retrieved successfully", subjects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> getSubjectById(@PathVariable Long id) {
        return subjectRepository.findById(id)
                .map(sub -> ResponseEntity.ok(ApiResponse.ok("Subject found", sub)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByCourse(@PathVariable Long courseId) {
        List<Subject> subjects = subjectRepository.findByCourseId(courseId);
        return ResponseEntity.ok(ApiResponse.ok("Course subjects retrieved", subjects));
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved", courses));
    }
}
