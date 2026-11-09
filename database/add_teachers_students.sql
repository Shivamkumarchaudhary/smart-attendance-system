USE smart_attendance;

-- 1. Insert 3 More Teachers (Total = 6 Teachers)
INSERT INTO users (name, email, password_hash, role, is_active) VALUES
('Dr. Vikram Malhotra', 'vikram.malhotra@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
('Prof. Neha Gupta', 'neha.gupta@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE),
('Dr. Amitav Banerjee', 'amitav.banerjee@smartattendance.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'TEACHER', TRUE);

INSERT INTO teachers (user_id, employee_id, department, designation, phone)
SELECT id, 'EMP-T-104', 'Computer Applications', 'Professor', '+91 9876543213' FROM users WHERE email = 'vikram.malhotra@smartattendance.edu';

INSERT INTO teachers (user_id, employee_id, department, designation, phone)
SELECT id, 'EMP-T-105', 'Computer Science', 'Assistant Professor', '+91 9876543214' FROM users WHERE email = 'neha.gupta@smartattendance.edu';

INSERT INTO teachers (user_id, employee_id, department, designation, phone)
SELECT id, 'EMP-T-106', 'Information Technology', 'Associate Professor', '+91 9876543215' FROM users WHERE email = 'amitav.banerjee@smartattendance.edu';

-- 2. Insert 14 More Students (Total = 20 Students)
INSERT INTO users (name, email, password_hash, role, is_active) VALUES
('Kavya Nair', 'kavya@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Aryan Mehta', 'aryan@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Pooja Joshi', 'pooja@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Aditya Rao', 'aditya@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Riya Kapoor', 'riya@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Yash Singhal', 'yash@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Tanvi Deshmukh', 'tanvi@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Manav Chopra', 'manav@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Ananya Reddy', 'ananya.r@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Karthik Iyer', 'karthik@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Simran Kaur', 'simran@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Gaurav Tiwari', 'gaurav@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Isha Choudhury', 'isha@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE),
('Varun Bhatia', 'varun@student.edu', '$2a$10$CZhCss6b9rfZT2Ngf5XBceb4huPIumC.Gra.7muji8DzawjIApJni', 'STUDENT', TRUE);

-- Insert into students table
INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-007', 1, 3, 'A', '+91 9811122237' FROM users WHERE email = 'kavya@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-008', 1, 3, 'A', '+91 9811122238' FROM users WHERE email = 'aryan@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-009', 1, 3, 'A', '+91 9811122239' FROM users WHERE email = 'pooja@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-010', 1, 3, 'A', '+91 9811122240' FROM users WHERE email = 'aditya@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-011', 1, 3, 'A', '+91 9811122241' FROM users WHERE email = 'riya@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-012', 1, 3, 'A', '+91 9811122242' FROM users WHERE email = 'yash@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-013', 1, 3, 'A', '+91 9811122243' FROM users WHERE email = 'tanvi@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-014', 1, 3, 'A', '+91 9811122244' FROM users WHERE email = 'manav@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-015', 1, 3, 'A', '+91 9811122245' FROM users WHERE email = 'ananya.r@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-016', 1, 3, 'A', '+91 9811122246' FROM users WHERE email = 'karthik@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-017', 1, 3, 'A', '+91 9811122247' FROM users WHERE email = 'simran@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-018', 1, 3, 'A', '+91 9811122248' FROM users WHERE email = 'gaurav@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-019', 1, 3, 'A', '+91 9811122249' FROM users WHERE email = 'isha@student.edu';

INSERT INTO students (user_id, roll_number, course_id, semester, section, phone)
SELECT id, 'MCA-2026-020', 1, 3, 'A', '+91 9811122250' FROM users WHERE email = 'varun@student.edu';

-- 3. Auto-Enroll All Newly Added Students into MCA Semester 3 Subjects (1, 2, 3, 4, 7)
INSERT INTO enrollments (student_id, subject_id, academic_year)
SELECT s.id, sub.id, '2026-2027'
FROM students s
CROSS JOIN subjects sub
WHERE s.roll_number IN (
    'MCA-2026-007', 'MCA-2026-008', 'MCA-2026-009', 'MCA-2026-010',
    'MCA-2026-011', 'MCA-2026-012', 'MCA-2026-013', 'MCA-2026-014',
    'MCA-2026-015', 'MCA-2026-016', 'MCA-2026-017', 'MCA-2026-018',
    'MCA-2026-019', 'MCA-2026-020'
)
AND sub.id IN (1, 2, 3, 4, 7);
