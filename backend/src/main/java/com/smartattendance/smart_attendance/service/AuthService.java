package com.smartattendance.smart_attendance.service;

import com.smartattendance.smart_attendance.config.JwtTokenProvider;
import com.smartattendance.smart_attendance.dto.LoginRequest;
import com.smartattendance.smart_attendance.dto.LoginResponse;
import com.smartattendance.smart_attendance.entity.Role;
import com.smartattendance.smart_attendance.entity.Student;
import com.smartattendance.smart_attendance.entity.Teacher;
import com.smartattendance.smart_attendance.entity.User;
import com.smartattendance.smart_attendance.exception.AppException;
import com.smartattendance.smart_attendance.repository.StudentRepository;
import com.smartattendance.smart_attendance.repository.TeacherRepository;
import com.smartattendance.smart_attendance.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       TeacherRepository teacherRepository,
                       JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (!user.isActive()) {
            throw new AppException("User account is inactive. Please contact administrator.", HttpStatus.FORBIDDEN);
        }

        Long roleEntityId = null;
        String identifier = null;

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new AppException("Student profile not linked to user account", HttpStatus.NOT_FOUND));
            roleEntityId = student.getId();
            identifier = student.getRollNumber();
        } else if (user.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser(user)
                    .orElseThrow(() -> new AppException("Teacher profile not linked to user account", HttpStatus.NOT_FOUND));
            roleEntityId = teacher.getId();
            identifier = teacher.getEmployeeId();
        } else {
            identifier = "ADMIN";
        }

        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), roleEntityId, identifier);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AppException("Unauthenticated user", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }
}
