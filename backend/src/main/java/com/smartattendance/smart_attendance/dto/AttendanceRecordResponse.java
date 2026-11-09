package com.smartattendance.smart_attendance.dto;

import com.smartattendance.smart_attendance.entity.AttendanceStatus;
import java.time.LocalDateTime;

public class AttendanceRecordResponse {
    private Long id;
    private Long sessionId;
    private String sessionTitle;
    private String subjectCode;
    private String subjectName;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private LocalDateTime markedAt;
    private AttendanceStatus status;
    private String deviceInfo;
    private String faceSnapshot;
    private Boolean faceVerified;
    private Double latitude;
    private Double longitude;
    private Double distanceMeters;
    private Boolean locationVerified;

    public AttendanceRecordResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getFaceSnapshot() { return faceSnapshot; }
    public void setFaceSnapshot(String faceSnapshot) { this.faceSnapshot = faceSnapshot; }

    public Boolean isFaceVerified() { return faceVerified != null && faceVerified; }
    public Boolean getFaceVerified() { return faceVerified != null && faceVerified; }
    public void setFaceVerified(Boolean faceVerified) { this.faceVerified = faceVerified; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Boolean isLocationVerified() { return locationVerified != null && locationVerified; }
    public Boolean getLocationVerified() { return locationVerified != null && locationVerified; }
    public void setLocationVerified(Boolean locationVerified) { this.locationVerified = locationVerified; }
}
