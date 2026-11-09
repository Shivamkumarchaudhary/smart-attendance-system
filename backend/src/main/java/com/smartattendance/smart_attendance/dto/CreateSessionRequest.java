package com.smartattendance.smart_attendance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateSessionRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private String sessionTitle = "Regular Lecture";
    private String roomNumber = "Classroom";

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int durationMinutes = 5;

    public CreateSessionRequest() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
}
