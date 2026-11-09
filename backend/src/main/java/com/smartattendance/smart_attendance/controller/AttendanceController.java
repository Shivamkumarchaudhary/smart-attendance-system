package com.smartattendance.smart_attendance.controller;

import com.smartattendance.smart_attendance.dto.ApiResponse;
import com.smartattendance.smart_attendance.dto.AttendanceRecordResponse;
import com.smartattendance.smart_attendance.dto.MarkAttendanceRequest;
import com.smartattendance.smart_attendance.dto.SubjectStatsResponse;
import com.smartattendance.smart_attendance.entity.User;
import com.smartattendance.smart_attendance.service.AttendanceService;
import com.smartattendance.smart_attendance.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AuthService authService;

    public AttendanceController(AttendanceService attendanceService, AuthService authService) {
        this.attendanceService = attendanceService;
        this.authService = authService;
    }

    @PostMapping("/mark")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> markAttendance(
            @Valid @RequestBody MarkAttendanceRequest request,
            HttpServletRequest servletRequest) {

        User user = authService.getCurrentAuthenticatedUser();
        String clientIp = servletRequest.getRemoteAddr();
        AttendanceRecordResponse response = attendanceService.markAttendance(request, user, clientIp);
        return ResponseEntity.ok(ApiResponse.ok("Attendance marked successfully! Status: PRESENT", response));
    }

    @GetMapping("/student/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getStudentHistory() {
        User user = authService.getCurrentAuthenticatedUser();
        List<AttendanceRecordResponse> history = attendanceService.getStudentAttendanceHistory(user);
        return ResponseEntity.ok(ApiResponse.ok("Student attendance history retrieved", history));
    }

    @GetMapping("/student/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<SubjectStatsResponse>>> getStudentStats() {
        User user = authService.getCurrentAuthenticatedUser();
        List<SubjectStatsResponse> stats = attendanceService.getStudentSubjectStats(user);
        return ResponseEntity.ok(ApiResponse.ok("Student subject stats retrieved", stats));
    }
}
