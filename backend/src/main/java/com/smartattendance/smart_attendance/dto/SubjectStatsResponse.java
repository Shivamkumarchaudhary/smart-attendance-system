package com.smartattendance.smart_attendance.dto;

public class SubjectStatsResponse {
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private long attendedClasses;
    private long totalClasses;
    private double attendancePercentage;
    private boolean lowAttendanceWarning; // true if < 75%

    public SubjectStatsResponse() {}

    public SubjectStatsResponse(Long subjectId, String subjectCode, String subjectName,
                                long attendedClasses, long totalClasses, double attendancePercentage,
                                boolean lowAttendanceWarning) {
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.attendedClasses = attendedClasses;
        this.totalClasses = totalClasses;
        this.attendancePercentage = attendancePercentage;
        this.lowAttendanceWarning = lowAttendanceWarning;
    }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public long getAttendedClasses() { return attendedClasses; }
    public void setAttendedClasses(long attendedClasses) { this.attendedClasses = attendedClasses; }

    public long getTotalClasses() { return totalClasses; }
    public void setTotalClasses(long totalClasses) { this.totalClasses = totalClasses; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public boolean isLowAttendanceWarning() { return lowAttendanceWarning; }
    public void setLowAttendanceWarning(boolean lowAttendanceWarning) { this.lowAttendanceWarning = lowAttendanceWarning; }
}
