package com.smartattendance.smart_attendance.controller;

import com.smartattendance.smart_attendance.dto.ApiResponse;
import com.smartattendance.smart_attendance.dto.AttendanceRecordResponse;
import com.smartattendance.smart_attendance.dto.CreateSessionRequest;
import com.smartattendance.smart_attendance.dto.SessionResponse;
import com.smartattendance.smart_attendance.entity.User;
import com.smartattendance.smart_attendance.service.AttendanceService;
import com.smartattendance.smart_attendance.service.AuthService;
import com.smartattendance.smart_attendance.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final AttendanceService attendanceService;
    private final AuthService authService;

    public SessionController(SessionService sessionService,
                             AttendanceService attendanceService,
                             AuthService authService) {
        this.sessionService = sessionService;
        this.attendanceService = attendanceService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(@Valid @RequestBody CreateSessionRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        SessionResponse response = sessionService.createSession(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Attendance session created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(@PathVariable Long id) {
        SessionResponse response = sessionService.getSessionDetails(id);
        return ResponseEntity.ok(ApiResponse.ok("Session details retrieved", response));
    }

    @PostMapping("/{id}/rotate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> rotateSessionToken(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        SessionResponse response = sessionService.rotateToken(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Session QR token rotated successfully", response));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> closeSession(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        SessionResponse response = sessionService.closeSession(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Session closed successfully", response));
    }

    @GetMapping("/{id}/records")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getSessionRecords(@PathVariable Long id) {
        List<AttendanceRecordResponse> records = attendanceService.getSessionAttendanceRecords(id);
        return ResponseEntity.ok(ApiResponse.ok("Session attendance records retrieved", records));
    }

    @GetMapping("/teacher/my-sessions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getTeacherSessions() {
        User user = authService.getCurrentAuthenticatedUser();
        List<SessionResponse> sessions = sessionService.getTeacherSessions(user);
        return ResponseEntity.ok(ApiResponse.ok("Teacher sessions retrieved", sessions));
    }
}
