package com.smartattendance.smart_attendance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "roll_number", nullable = false, unique = true, length = 50)
    private String rollNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private int semester;

    @Column(length = 10)
    private String section = "A";

    @Column(length = 20)
    private String phone;

    public Student() {}

    public Student(User user, String rollNumber, Course course, int semester, String section, String phone) {
        this.user = user;
        this.rollNumber = rollNumber;
        this.course = course;
        this.semester = semester;
        this.section = section;
        this.phone = phone;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
