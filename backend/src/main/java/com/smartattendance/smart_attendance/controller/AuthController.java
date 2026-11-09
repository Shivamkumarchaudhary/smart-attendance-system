package com.smartattendance.smart_attendance.controller;

import com.smartattendance.smart_attendance.dto.ApiResponse;
import com.smartattendance.smart_attendance.dto.LoginRequest;
import com.smartattendance.smart_attendance.dto.LoginResponse;
import com.smartattendance.smart_attendance.entity.User;
import com.smartattendance.smart_attendance.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.ok("Authenticated user retrieved", user));
    }
}
