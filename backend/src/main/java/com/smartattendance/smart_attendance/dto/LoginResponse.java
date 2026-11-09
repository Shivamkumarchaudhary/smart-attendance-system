package com.smartattendance.smart_attendance.dto;

import com.smartattendance.smart_attendance.entity.Role;

public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private Long roleEntityId; // studentId or teacherId
    private String identifier; // rollNumber or employeeId

    public LoginResponse() {}

    public LoginResponse(String token, Long userId, String name, String email, Role role, Long roleEntityId, String identifier) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.roleEntityId = roleEntityId;
        this.identifier = identifier;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getRoleEntityId() { return roleEntityId; }
    public void setRoleEntityId(Long roleEntityId) { this.roleEntityId = roleEntityId; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
}
