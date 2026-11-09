-- ========================================================
-- Smart Attendance Management System - Sample Seed Data
-- Passwords for all demo accounts: password123
-- BCrypt Hash: $2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni
-- ========================================================

USE smart_attendance;

-- 1. Insert Core Users
INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES
(1, 'System Administrator', 'admin@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'ADMIN', TRUE),
(2, 'Dr. Rajesh Sharma', 'teacher1@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
(3, 'Prof. Ananya Sen', 'teacher2@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
(8, 'Dr. Priya Sharma', 'teacher3@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
(9, 'Dr. Vikram Malhotra', 'teacher4@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
(10, 'Prof. Neha Gupta', 'teacher5@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
(11, 'Dr. Amitav Banerjee', 'teacher6@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
(12, 'Aarav Patel', 'student1@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(13, 'Diya Sharma', 'student2@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(14, 'Rohan Verma', 'student3@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(15, 'Sneha Kulkarni', 'student4@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(16, 'Suraj Panday', 'student5@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(17, 'Abhishek Singh', 'student6@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(18, 'Kavya Nair', 'student7@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(19, 'Aryan Mehta', 'student8@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(20, 'Pooja Joshi', 'student9@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(21, 'Aditya Rao', 'student10@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(22, 'Riya Kapoor', 'student11@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(23, 'Yash Singhal', 'student12@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(24, 'Tanvi Deshmukh', 'student13@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(25, 'Manav Chopra', 'student14@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(26, 'Ananya Reddy', 'student15@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(27, 'Karthik Iyer', 'student16@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(28, 'Simran Kaur', 'student17@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(29, 'Gaurav Tiwari', 'student18@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(30, 'Isha Choudhury', 'student19@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
(31, 'Varun Bhatia', 'student20@gmail.com', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE);

-- 2. Insert Degree Courses
INSERT INTO courses (id, course_code, course_name, department, total_semesters) VALUES
(1, 'MCA', 'Master of Computer Applications', 'Computer Applications', 4),
(2, 'BTECH-CS', 'B.Tech in Computer Science & Engineering', 'Computer Science', 8);

-- 3. Insert Teachers (6 Teachers)
INSERT INTO teachers (id, user_id, employee_id, department, designation, phone) VALUES
(1, 2, 'EMP-T-101', 'Computer Applications', 'Associate Professor', '+91 9876543210'),
(2, 3, 'EMP-T-102', 'Computer Applications', 'Assistant Professor', '+91 9876543211'),
(3, 8, 'EMP-T-103', 'Computer Science & Engineering', 'Assistant Professor', '+91 9876500001'),
(4, 9, 'EMP-T-104', 'Computer Applications', 'Professor', '+91 9876543213'),
(5, 10, 'EMP-T-105', 'Computer Science', 'Assistant Professor', '+91 9876543214'),
(6, 11, 'EMP-T-106', 'Information Technology', 'Associate Professor', '+91 9876543215');

-- 4. Insert Students (20 Students)
INSERT INTO students (id, user_id, roll_number, course_id, semester, section, phone) VALUES
(1, 12, 'MCA-2026-001', 1, 3, 'A', '+91 9811122233'),
(2, 13, 'MCA-2026-002', 1, 3, 'A', '+91 9811122234'),
(3, 14, 'MCA-2026-003', 1, 3, 'A', '+91 9811122235'),
(4, 15, 'MCA-2026-004', 1, 3, 'A', '+91 9811122236'),
(5, 16, 'MCA-2026-005', 1, 3, 'A', '+91 9811122237'),
(6, 17, 'MCA-2026-006', 1, 3, 'A', '+91 9811122238'),
(7, 18, 'MCA-2026-007', 1, 3, 'A', '+91 9811122239'),
(8, 19, 'MCA-2026-008', 1, 3, 'A', '+91 9811122240'),
(9, 20, 'MCA-2026-009', 1, 3, 'A', '+91 9811122241'),
(10, 21, 'MCA-2026-010', 1, 3, 'A', '+91 9811122242'),
(11, 22, 'MCA-2026-011', 1, 3, 'A', '+91 9811122243'),
(12, 23, 'MCA-2026-012', 1, 3, 'A', '+91 9811122244'),
(13, 24, 'MCA-2026-013', 1, 3, 'A', '+91 9811122245'),
(14, 25, 'MCA-2026-014', 1, 3, 'A', '+91 9811122246'),
(15, 26, 'MCA-2026-015', 1, 3, 'A', '+91 9811122247'),
(16, 27, 'MCA-2026-016', 1, 3, 'A', '+91 9811122248'),
(17, 28, 'MCA-2026-017', 1, 3, 'A', '+91 9811122249'),
(18, 29, 'MCA-2026-018', 1, 3, 'A', '+91 9811122250'),
(19, 30, 'MCA-2026-019', 1, 3, 'A', '+91 9811122251'),
(20, 31, 'MCA-2026-020', 1, 3, 'A', '+91 9811122252');

-- 5. Insert Subjects
INSERT INTO subjects (id, subject_code, subject_name, course_id, semester, credits) VALUES
(1, 'MCA301', 'Cloud Computing & DevOps', 1, 3, 4),
(2, 'MCA302', 'Full Stack Java Development', 1, 3, 4),
(3, 'MCA303', 'Machine Learning & Data Mining', 1, 3, 4),
(4, 'MCA304', 'Mobile Application Development', 1, 3, 3),
(5, 'MCA305', 'Design and Analysis of Algorithm', 1, 3, 4);

-- 6. Assign Teachers to Subjects
INSERT INTO teacher_subjects (id, teacher_id, subject_id, academic_year) VALUES
(1, 1, 1, '2026-2027'),
(2, 1, 2, '2026-2027'),
(3, 2, 3, '2026-2027'),
(4, 2, 4, '2026-2027'),
(5, 3, 5, '2026-2027');

-- 7. Enroll Students in Subjects
INSERT INTO enrollments (student_id, subject_id, academic_year)
SELECT s.id, sub.id, '2026-2027'
FROM students s
CROSS JOIN subjects sub;
