package com.smartattendance.smart_attendance.service;

import com.smartattendance.smart_attendance.dto.CreateSessionRequest;
import com.smartattendance.smart_attendance.dto.SessionResponse;
import com.smartattendance.smart_attendance.entity.*;
import com.smartattendance.smart_attendance.exception.AppException;
import com.smartattendance.smart_attendance.repository.AttendanceRecordRepository;
import com.smartattendance.smart_attendance.repository.AttendanceSessionRepository;
import com.smartattendance.smart_attendance.repository.SubjectRepository;
import com.smartattendance.smart_attendance.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final AttendanceSessionRepository sessionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final QrCodeService qrCodeService;

    public SessionService(AttendanceSessionRepository sessionRepository,
                          SubjectRepository subjectRepository,
                          TeacherRepository teacherRepository,
                          AttendanceRecordRepository attendanceRecordRepository,
                          QrCodeService qrCodeService) {
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request, User currentUser) {
        Teacher teacher = teacherRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException("Teacher profile not found", HttpStatus.FORBIDDEN));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new AppException("Subject not found", HttpStatus.NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(request.getDurationMinutes());
        String token = UUID.randomUUID().toString();
        String sessionCode = "SES-" + System.currentTimeMillis();

        AttendanceSession session = new AttendanceSession(
                sessionCode,
                subject,
                teacher,
                token,
                request.getSessionTitle(),
                request.getRoomNumber(),
                now,
                expiresAt
        );

        AttendanceSession saved = sessionRepository.save(session);
        return mapToResponse(saved, true);
    }

    @Transactional
    public SessionResponse rotateToken(Long sessionId, User currentUser) {
        AttendanceSession session = getSessionById(sessionId);
        validateSessionOwner(session, currentUser);

        if (session.getStatus() != SessionStatus.ACTIVE || session.isExpired()) {
            session.setStatus(SessionStatus.EXPIRED);
            sessionRepository.save(session);
            throw new AppException("Cannot rotate token for expired or closed session", HttpStatus.BAD_REQUEST);
        }

        // New rotating token for live QR refresh anti-proxy
        String newToken = UUID.randomUUID().toString();
        session.setTokenHash(newToken);
        AttendanceSession updated = sessionRepository.save(session);

        return mapToResponse(updated, true);
    }

    @Transactional
    public SessionResponse closeSession(Long sessionId, User currentUser) {
        AttendanceSession session = getSessionById(sessionId);
        validateSessionOwner(session, currentUser);

        session.setStatus(SessionStatus.CLOSED);
        AttendanceSession closed = sessionRepository.save(session);
        return mapToResponse(closed, false);
    }

    public SessionResponse getSessionDetails(Long sessionId) {
        AttendanceSession session = getSessionById(sessionId);
        checkAndUpdateExpiry(session);
        return mapToResponse(session, true);
    }

    public List<SessionResponse> getTeacherSessions(User currentUser) {
        Teacher teacher = teacherRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException("Teacher profile not found", HttpStatus.FORBIDDEN));

        return sessionRepository.findByTeacherIdOrderByStartTimeDesc(teacher.getId()).stream()
                .map(s -> {
                    checkAndUpdateExpiry(s);
                    return mapToResponse(s, false);
                })
                .collect(Collectors.toList());
    }

    public AttendanceSession getSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Session not found with id: " + sessionId, HttpStatus.NOT_FOUND));
    }

    private void validateSessionOwner(AttendanceSession session, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) return;
        Teacher teacher = teacherRepository.findByUser(currentUser)
                .orElseThrow(() -> new AppException("Teacher profile not found", HttpStatus.FORBIDDEN));
        if (!session.getTeacher().getId().equals(teacher.getId())) {
            throw new AppException("You are not authorized to modify this attendance session", HttpStatus.FORBIDDEN);
        }
    }

    private void checkAndUpdateExpiry(AttendanceSession session) {
        if (session.getStatus() == SessionStatus.ACTIVE && session.isExpired()) {
            session.setStatus(SessionStatus.EXPIRED);
            sessionRepository.save(session);
        }
    }

    private SessionResponse mapToResponse(AttendanceSession session, boolean includeQr) {
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setSessionCode(session.getSessionCode());
        response.setSubjectId(session.getSubject().getId());
        response.setSubjectCode(session.getSubject().getSubjectCode());
        response.setSubjectName(session.getSubject().getSubjectName());
        response.setTeacherName(session.getTeacher().getUser().getName());
        response.setSessionTitle(session.getSessionTitle());
        response.setRoomNumber(session.getRoomNumber());
        response.setToken(session.getTokenHash());
        response.setStartTime(session.getStartTime());
        response.setExpiresAt(session.getExpiresAt());
        response.setStatus(session.getStatus());

        long count = attendanceRecordRepository.countBySessionId(session.getId());
        response.setPresentCount(count);

        LocalDateTime now = LocalDateTime.now();
        long remaining = session.getExpiresAt().isAfter(now) && session.getStatus() == SessionStatus.ACTIVE
                ? Duration.between(now, session.getExpiresAt()).getSeconds()
                : 0L;
        response.setRemainingSeconds(remaining);

        if (includeQr && session.getStatus() == SessionStatus.ACTIVE && remaining > 0) {
            response.setQrBase64(qrCodeService.generateQrCodeBase64(session.getTokenHash(), 320, 320));
        }

        return response;
    }
}
