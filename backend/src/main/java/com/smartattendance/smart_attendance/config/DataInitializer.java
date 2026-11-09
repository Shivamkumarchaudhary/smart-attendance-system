package com.smartattendance.smart_attendance.config;

import com.smartattendance.smart_attendance.entity.*;
import com.smartattendance.smart_attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CourseRepository courseRepository,
                           TeacherRepository teacherRepository,
                           StudentRepository studentRepository,
                           SubjectRepository subjectRepository,
                           EnrollmentRepository enrollmentRepository,
                           AttendanceSessionRepository sessionRepository,
                           AttendanceRecordRepository attendanceRecordRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.sessionRepository = sessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        System.out.println(">>> Initializing default demo data for Smart Attendance System...");

        String defaultPass = passwordEncoder.encode("password123");

        // 1. Course
        Course mcaCourse = new Course("MCA", "Master of Computer Applications", "Computer Applications", 4);
        courseRepository.save(mcaCourse);

        // 2. Admin User
        User adminUser = new User("System Administrator", "admin@smartattendance.edu", defaultPass, Role.ADMIN);
        userRepository.save(adminUser);

        // 3. Teacher User & Profile
        User teacherUser1 = new User("Dr. Rajesh Sharma", "teacher1@smartattendance.edu", defaultPass, Role.TEACHER);
        userRepository.save(teacherUser1);
        Teacher teacher1 = new Teacher(teacherUser1, "EMP-T-101", "Computer Applications", "Associate Professor", "+91 9876543210");
        teacherRepository.save(teacher1);

        User teacherUser2 = new User("Prof. Ananya Sen", "teacher2@smartattendance.edu", defaultPass, Role.TEACHER);
        userRepository.save(teacherUser2);
        Teacher teacher2 = new Teacher(teacherUser2, "EMP-T-102", "Computer Applications", "Assistant Professor", "+91 9876543211");
        teacherRepository.save(teacher2);

        // 4. Student Users & Profiles
        User studentUser1 = new User("Aarav Patel", "aarav@student.edu", defaultPass, Role.STUDENT);
        userRepository.save(studentUser1);
        Student student1 = new Student(studentUser1, "MCA-2026-001", mcaCourse, 3, "A", "+91 9811122233");
        studentRepository.save(student1);

        User studentUser2 = new User("Diya Sharma", "diya@student.edu", defaultPass, Role.STUDENT);
        userRepository.save(studentUser2);
        Student student2 = new Student(studentUser2, "MCA-2026-002", mcaCourse, 3, "A", "+91 9811122234");
        studentRepository.save(student2);

        User studentUser3 = new User("Rohan Verma", "rohan@student.edu", defaultPass, Role.STUDENT);
        userRepository.save(studentUser3);
        Student student3 = new Student(studentUser3, "MCA-2026-003", mcaCourse, 3, "A", "+91 9811122235");
        studentRepository.save(student3);

        // 5. Subjects
        Subject sub1 = new Subject("MCA301", "Cloud Computing & DevOps", mcaCourse, 3, 4);
        Subject sub2 = new Subject("MCA302", "Full Stack Java Development", mcaCourse, 3, 4);
        Subject sub3 = new Subject("MCA303", "Machine Learning & Data Mining", mcaCourse, 3, 4);
        Subject sub4 = new Subject("MCA304", "Mobile Application Development", mcaCourse, 3, 3);
        subjectRepository.save(sub1);
        subjectRepository.save(sub2);
        subjectRepository.save(sub3);
        subjectRepository.save(sub4);

        // 6. Enrollments
        enrollmentRepository.save(new Enrollment(student1, sub1, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student1, sub2, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student1, sub3, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student1, sub4, "2026-2027"));

        enrollmentRepository.save(new Enrollment(student2, sub1, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student2, sub2, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student2, sub3, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student2, sub4, "2026-2027"));

        enrollmentRepository.save(new Enrollment(student3, sub1, "2026-2027"));
        enrollmentRepository.save(new Enrollment(student3, sub2, "2026-2027"));

        // 7. Sample Past Sessions and Attendance
        AttendanceSession pastSession1 = new AttendanceSession(
                "SES-PAST-01", sub2, teacher1, "past-token-01", "Spring Boot MVC Deep Dive", "Lab 201",
                LocalDateTime.now().minusDays(2), LocalDateTime.now().minusDays(2).plusMinutes(15)
        );
        pastSession1.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(pastSession1);

        attendanceRecordRepository.save(new AttendanceRecord(
                pastSession1, student1, AttendanceStatus.PRESENT, "Chrome / Android", "192.168.1.101", 12.9716, 77.5946, "Verified QR"
        ));
        attendanceRecordRepository.save(new AttendanceRecord(
                pastSession1, student2, AttendanceStatus.PRESENT, "Safari / iOS", "192.168.1.102", 12.9716, 77.5946, "Verified QR"
        ));

        // 8. Sample Active Session for instant testing
        AttendanceSession liveSession = new AttendanceSession(
                "SES-LIVE-NOW", sub2, teacher1, UUID.randomUUID().toString(), "Spring Boot RESTful APIs & QR Engine", "Room 302",
                LocalDateTime.now(), LocalDateTime.now().plusHours(2)
        );
        sessionRepository.save(liveSession);

        System.out.println(">>> Default demo users and records initialized successfully!");
    }
}
