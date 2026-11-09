package com.smartattendance.smart_attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "student_id"}, name = "uk_session_student")
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "marked_at", updatable = false)
    private LocalDateTime markedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Lob
    @Column(name = "face_snapshot", columnDefinition = "LONGTEXT")
    private String faceSnapshot;

    @Column(name = "is_face_verified")
    private Boolean faceVerified = true;

    @Column(name = "distance_meters")
    private Double distanceMeters;

    @Column(name = "is_location_verified")
    private Boolean locationVerified = true;

    @Column(name = "device_fingerprint", length = 120)
    private String deviceFingerprint;

    @Column(length = 255)
    private String remarks;

    public AttendanceRecord() {}

    public AttendanceRecord(AttendanceSession session, Student student, AttendanceStatus status,
                            String deviceInfo, String ipAddress, Double latitude, Double longitude, String remarks) {
        this.session = session;
        this.student = student;
        this.status = status;
        this.deviceInfo = deviceInfo;
        this.ipAddress = ipAddress;
        this.latitude = latitude;
        this.longitude = longitude;
        this.remarks = remarks;
        this.markedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AttendanceSession getSession() { return session; }
    public void setSession(AttendanceSession session) { this.session = session; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getFaceSnapshot() { return faceSnapshot; }
    public void setFaceSnapshot(String faceSnapshot) { this.faceSnapshot = faceSnapshot; }

    public Boolean getFaceVerified() { return faceVerified != null && faceVerified; }
    public Boolean isFaceVerified() { return faceVerified != null && faceVerified; }
    public void setFaceVerified(Boolean faceVerified) { this.faceVerified = faceVerified; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Boolean getLocationVerified() { return locationVerified != null && locationVerified; }
    public Boolean isLocationVerified() { return locationVerified != null && locationVerified; }
    public void setLocationVerified(Boolean locationVerified) { this.locationVerified = locationVerified; }

    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String deviceFingerprint) { this.deviceFingerprint = deviceFingerprint; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
