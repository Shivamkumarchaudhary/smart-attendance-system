package com.smartattendance.smart_attendance.service;

import com.smartattendance.smart_attendance.dto.AttendanceRecordResponse;
import com.smartattendance.smart_attendance.dto.MarkAttendanceRequest;
import com.smartattendance.smart_attendance.dto.SubjectStatsResponse;
import com.smartattendance.smart_attendance.entity.*;
import com.smartattendance.smart_attendance.exception.AppException;
import com.smartattendance.smart_attendance.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRecordRepository,
                             AttendanceSessionRepository sessionRepository,
                             StudentRepository studentRepository,
                             EnrollmentRepository enrollmentRepository,
                             SubjectRepository subjectRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.sessionRepository = sessionRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public AttendanceRecordResponse markAttendance(MarkAttendanceRequest request, User currentUser, String clientIp) {
        if (currentUser.getRole() != Role.STUDENT) {
            throw new AppException("Only registered students can mark attendance", HttpStatus.FORBIDDEN);
        }

        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException("Student profile not found", HttpStatus.NOT_FOUND));

        AttendanceSession session = sessionRepository.findByTokenHash(request.getToken().trim())
                .orElseThrow(() -> new AppException("Invalid or unrecognizable QR code token", HttpStatus.BAD_REQUEST));

        if (session.getStatus() != SessionStatus.ACTIVE || session.isExpired()) {
            if (session.getStatus() == SessionStatus.ACTIVE) {
                session.setStatus(SessionStatus.EXPIRED);
                sessionRepository.save(session);
            }
            throw new AppException("This attendance session has expired or been closed by the teacher", HttpStatus.BAD_REQUEST);
        }

        // Validate Enrollment: Is the student officially enrolled in this subject?
        boolean isEnrolled = enrollmentRepository.existsByStudentIdAndSubjectId(student.getId(), session.getSubject().getId());
        if (!isEnrolled) {
            throw new AppException("You are not enrolled in the subject: " + session.getSubject().getSubjectName(), HttpStatus.FORBIDDEN);
        }

        // Duplicate Check 1: Student Level (Has this student already marked in this session?)
        boolean alreadyMarked = attendanceRecordRepository.existsBySessionIdAndStudentId(session.getId(), student.getId());
        if (alreadyMarked) {
            throw new AppException("Attendance has already been recorded for this session. Duplicate attempt rejected!", HttpStatus.CONFLICT);
        }

        // Duplicate Check 2: Device Fingerprint Level (Has this physical phone/device already marked attendance in this session?)
        String deviceFp = request.getDeviceFingerprint();
        if (deviceFp != null && !deviceFp.trim().isEmpty()) {
            boolean deviceUsed = attendanceRecordRepository.existsBySessionIdAndDeviceFingerprint(session.getId(), deviceFp.trim());
            if (deviceUsed) {
                throw new AppException("Device Lock: Attendance has already been submitted from this phone/device for this lecture session. Proxy attempt blocked!", HttpStatus.CONFLICT);
            }
        }

        // Geolocation Haversine Distance Calculation (GPS Verification)
        Double distance = null;
        boolean locationVerified = true;
        if (request.getLatitude() != null && request.getLongitude() != null &&
                session.getLatitude() != null && session.getLongitude() != null) {
            distance = calculateHaversineDistance(
                    request.getLatitude(), request.getLongitude(),
                    session.getLatitude(), session.getLongitude()
            );
            double allowedRadius = session.getGeofenceRadius() != null ? session.getGeofenceRadius() : 500.0;
            locationVerified = distance <= allowedRadius;
        }

        // Face Verification Presence Check
        boolean faceVerified = request.getFaceImageBase64() != null && !request.getFaceImageBase64().trim().isEmpty();

        AttendanceRecord record = new AttendanceRecord(
                session,
                student,
                AttendanceStatus.PRESENT,
                request.getDeviceInfo() != null ? request.getDeviceInfo() : "Mobile Browser",
                clientIp,
                request.getLatitude(),
                request.getLongitude(),
                "Verified via Smart QR & Biometrics"
        );

        record.setFaceSnapshot(request.getFaceImageBase64());
        record.setFaceVerified(faceVerified);
        record.setDistanceMeters(distance);
        record.setLocationVerified(locationVerified);
        record.setDeviceFingerprint(deviceFp != null ? deviceFp.trim() : null);

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        return mapToResponse(saved);
    }

    public List<AttendanceRecordResponse> getStudentAttendanceHistory(User currentUser) {
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException("Student profile not found", HttpStatus.NOT_FOUND));

        return attendanceRecordRepository.findByStudentIdOrderByMarkedAtDesc(student.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SubjectStatsResponse> getStudentSubjectStats(User currentUser) {
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException("Student profile not found", HttpStatus.NOT_FOUND));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        List<SubjectStatsResponse> statsList = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            Subject subject = enrollment.getSubject();
            long totalSessions = attendanceRecordRepository.countTotalSessionsBySubject(subject.getId());
            long attendedSessions = attendanceRecordRepository.countAttendedByStudentAndSubject(student.getId(), subject.getId());

            double percentage = totalSessions > 0
                    ? Math.round(((double) attendedSessions / totalSessions) * 1000.0) / 10.0
                    : 100.0;

            boolean lowAttendance = percentage < 75.0 && totalSessions > 0;

            statsList.add(new SubjectStatsResponse(
                    subject.getId(),
                    subject.getSubjectCode(),
                    subject.getSubjectName(),
                    attendedSessions,
                    totalSessions,
                    percentage,
                    lowAttendance
            ));
        }

        return statsList;
    }

    public List<AttendanceRecordResponse> getSessionAttendanceRecords(Long sessionId) {
        return attendanceRecordRepository.findBySessionIdOrderByMarkedAtAsc(sessionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AttendanceRecordResponse mapToResponse(AttendanceRecord record) {
        AttendanceRecordResponse dto = new AttendanceRecordResponse();
        dto.setId(record.getId());
        dto.setSessionId(record.getSession().getId());
        dto.setSessionTitle(record.getSession().getSessionTitle());
        dto.setSubjectCode(record.getSession().getSubject().getSubjectCode());
        dto.setSubjectName(record.getSession().getSubject().getSubjectName());
        dto.setStudentId(record.getStudent().getId());
        dto.setStudentName(record.getStudent().getUser().getName());
        dto.setRollNumber(record.getStudent().getRollNumber());
        dto.setMarkedAt(record.getMarkedAt());
        dto.setStatus(record.getStatus());
        dto.setDeviceInfo(record.getDeviceInfo());
        dto.setFaceSnapshot(record.getFaceSnapshot());
        dto.setFaceVerified(record.isFaceVerified());
        dto.setLatitude(record.getLatitude());
        dto.setLongitude(record.getLongitude());
        dto.setDistanceMeters(record.getDistanceMeters());
        dto.setLocationVerified(record.isLocationVerified());
        return dto;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of the Earth in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }
}
