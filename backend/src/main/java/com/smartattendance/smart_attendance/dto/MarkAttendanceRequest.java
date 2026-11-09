package com.smartattendance.smart_attendance.dto;

import jakarta.validation.constraints.NotBlank;

public class MarkAttendanceRequest {

    @NotBlank(message = "QR Token is required")
    private String token;

    private String deviceInfo;
    private Double latitude;
    private Double longitude;
    private String faceImageBase64;
    private String deviceFingerprint;

    public MarkAttendanceRequest() {}

    public MarkAttendanceRequest(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getFaceImageBase64() { return faceImageBase64; }
    public void setFaceImageBase64(String faceImageBase64) { this.faceImageBase64 = faceImageBase64; }

    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String deviceFingerprint) { this.deviceFingerprint = deviceFingerprint; }
}
