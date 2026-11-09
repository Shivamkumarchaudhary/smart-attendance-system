package com.smartattendance.smart_attendance.controller;

import com.smartattendance.smart_attendance.dto.ApiResponse;
import com.smartattendance.smart_attendance.dto.CreateStudentRequest;
import com.smartattendance.smart_attendance.dto.CreateSubjectRequest;
import com.smartattendance.smart_attendance.dto.CreateTeacherRequest;
import com.smartattendance.smart_attendance.entity.*;
import com.smartattendance.smart_attendance.exception.AppException;
import com.smartattendance.smart_attendance.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           StudentRepository studentRepository,
                           TeacherRepository teacherRepository,
                           SubjectRepository subjectRepository,
                           CourseRepository courseRepository,
                           AttendanceSessionRepository sessionRepository,
                           AttendanceRecordRepository recordRepository,
                           EnrollmentRepository enrollmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalTeachers", teacherRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalSubjects", subjectRepository.count());
        stats.put("totalSessions", sessionRepository.count());
        stats.put("totalAttendanceRecords", recordRepository.count());

        return ResponseEntity.ok(ApiResponse.ok("System overview stats retrieved", stats));
    }

    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        return ResponseEntity.ok(ApiResponse.ok("Subjects retrieved", subjectRepository.findAll()));
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Teacher>>> getAllTeachers() {
        return ResponseEntity.ok(ApiResponse.ok("Teachers retrieved", teacherRepository.findAll()));
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.ok("Students retrieved", studentRepository.findAll()));
    }

    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved", courseRepository.findAll()));
    }

    @PostMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Student>> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email is already registered: " + request.getEmail(), HttpStatus.BAD_REQUEST);
        }
        if (studentRepository.findByRollNumber(request.getRollNumber()).isPresent()) {
            throw new AppException("Roll number already exists: " + request.getRollNumber(), HttpStatus.BAD_REQUEST);
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException("Course not found with id: " + request.getCourseId(), HttpStatus.NOT_FOUND));

        String encodedPass = passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "password123");
        User user = new User(request.getName(), request.getEmail(), encodedPass, Role.STUDENT);
        User savedUser = userRepository.save(user);

        Student student = new Student(savedUser, request.getRollNumber(), course, request.getSemester(), request.getSection(), request.getPhone());
        Student savedStudent = studentRepository.save(student);

        // Auto enroll in all subjects for this course and semester
        List<Subject> subjects = subjectRepository.findByCourseIdAndSemester(course.getId(), request.getSemester());
        for (Subject sub : subjects) {
            enrollmentRepository.save(new Enrollment(savedStudent, sub, "2026-2027"));
        }

        return ResponseEntity.ok(ApiResponse.ok("Student created and enrolled in subjects successfully", savedStudent));
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new AppException("Student not found", HttpStatus.NOT_FOUND));

        User user = student.getUser();
        studentRepository.delete(student);
        if (user != null) {
            userRepository.delete(user);
        }

        return ResponseEntity.ok(ApiResponse.ok("Student removed successfully"));
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Teacher>> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email is already registered: " + request.getEmail(), HttpStatus.BAD_REQUEST);
        }
        if (teacherRepository.findByEmployeeId(request.getEmployeeId()).isPresent()) {
            throw new AppException("Employee ID already exists: " + request.getEmployeeId(), HttpStatus.BAD_REQUEST);
        }

        String encodedPass = passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "password123");
        User user = new User(request.getName(), request.getEmail(), encodedPass, Role.TEACHER);
        User savedUser = userRepository.save(user);

        Teacher teacher = new Teacher(
                savedUser,
                request.getEmployeeId(),
                request.getDepartment(),
                request.getDesignation() != null ? request.getDesignation() : "Assistant Professor",
                request.getPhone()
        );
        Teacher savedTeacher = teacherRepository.save(teacher);

        return ResponseEntity.ok(ApiResponse.ok("Teacher account created successfully", savedTeacher));
    }

    @DeleteMapping("/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException("Teacher not found with id: " + id, HttpStatus.NOT_FOUND));

        User user = teacher.getUser();
        teacherRepository.delete(teacher);
        if (user != null) {
            userRepository.delete(user);
        }

        return ResponseEntity.ok(ApiResponse.ok("Teacher removed successfully"));
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Subject>> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        if (subjectRepository.findBySubjectCode(request.getSubjectCode()).isPresent()) {
            throw new AppException("Subject code already exists: " + request.getSubjectCode(), HttpStatus.BAD_REQUEST);
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException("Course not found with id: " + request.getCourseId(), HttpStatus.NOT_FOUND));

        Subject subject = new Subject(
                request.getSubjectCode().trim().toUpperCase(),
                request.getSubjectName().trim(),
                course,
                request.getSemester(),
                request.getCredits()
        );
        Subject savedSubject = subjectRepository.save(subject);

        // Auto-enroll existing students of that course and semester in this new subject
        List<Student> students = studentRepository.findByCourseIdAndSemester(course.getId(), request.getSemester());
        for (Student st : students) {
            enrollmentRepository.save(new Enrollment(st, savedSubject, "2026-2027"));
        }

        return ResponseEntity.ok(ApiResponse.ok("Subject created and students enrolled successfully", savedSubject));
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new AppException("Subject not found with id: " + id, HttpStatus.NOT_FOUND));

        subjectRepository.delete(subject);
        return ResponseEntity.ok(ApiResponse.ok("Subject removed successfully"));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInstitutionalReport() {
        List<Student> students = studentRepository.findAll();
        List<Subject> subjects = subjectRepository.findAll();
        List<Map<String, Object>> reports = new ArrayList<>();

        for (Student st : students) {
            for (Subject sub : subjects) {
                long totalHeld = recordRepository.countTotalSessionsBySubject(sub.getId());
                long attended = recordRepository.countAttendedByStudentAndSubject(st.getId(), sub.getId());
                double pct = totalHeld > 0 ? Math.round(((double) attended / totalHeld) * 1000.0) / 10.0 : 100.0;

                Map<String, Object> row = new HashMap<>();
                row.put("studentId", st.getId());
                row.put("studentName", st.getUser().getName());
                row.put("rollNumber", st.getRollNumber());
                row.put("course", st.getCourse().getCourseCode());
                row.put("semester", st.getSemester());
                row.put("subjectId", sub.getId());
                row.put("subjectCode", sub.getSubjectCode());
                row.put("subjectName", sub.getSubjectName());
                row.put("attended", attended);
                row.put("total", totalHeld);
                row.put("percentage", pct);
                row.put("eligible", pct >= 75.0);
                reports.add(row);
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Institutional reports generated", reports));
    }
}
