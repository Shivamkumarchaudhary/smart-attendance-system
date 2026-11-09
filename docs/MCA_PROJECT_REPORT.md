# MCA Master Project Report & Technical Specification
## QR-Based Smart Attendance Management System
**Academic Year:** 2026–2027  
**Technology Stack:** React.js, Java Spring Boot 3, MySQL, HTML5, CSS3, JavaScript (ES6+), ZXing  

---

## 1. Abstract
Attendance tracking in educational institutions and corporate training environments is a mandatory operational requirement for compliance, grading, and academic eligibility. Traditional approaches rely on paper roll-call registers or manual signatures, which waste 10–15 minutes of instructional lecture time per hour, are susceptible to buddy-punching (proxy attendance), and introduce high transcription error rates.

This project delivers a **QR-Based Smart Attendance System** engineered with a **React.js Single Page Application (SPA)** frontend, a **Java Spring Boot 3 RESTful micro-service** backend, and a **MySQL Relational Database**. The system enables faculty members to generate time-bound, cryptographically random, rolling QR codes displayed in the classroom. Students authenticate through their mobile browser, scan the projected QR code, and mark their attendance. The backend implements atomic transactions with database-level uniqueness constraints `(session_id, student_id)`, dynamic TTL expiration, and enrollment verification to prevent duplicates and eliminate attendance fraud.

---

## 2. Problem Statement & Objectives

### 2.1 Problem Statement
- **Time Inefficiency:** Manual calling of 60+ student names consumes 15–20% of class duration.
- **Proxy Attendance (Buddy Punching):** Students sign paper sheets for absent peers or mark attendance without physical presence.
- **Data Fragmentation & Errors:** Paper logs are vulnerable to damage, loss, illegible handwriting, and inaccurate manual percentage calculations.
- **Delayed Visibility:** Students only discover they are below the mandatory 75% attendance threshold at the end of the semester when exam hall tickets are blocked.

### 2.2 System Objectives
1. **Automate Attendance:** Reduce check-in latency to under 3 seconds per student.
2. **Eliminate Duplicate & Proxy Records:** Guarantee single-scan per student per session via MySQL `UNIQUE(session_id, student_id)` and rotating QR tokens.
3. **Dynamic Session Expiry:** Enforce strict time-to-live (TTL) of 1–10 minutes per attendance session.
4. **Real-Time Analytics:** Automatically compute subject-wise percentages `(Attended / Total * 100)` and flag low attendance (< 75%) with warning badges.
5. **Role-Based Access Control (RBAC):** Distinct interfaces and API authorization for `ADMIN`, `TEACHER`, and `STUDENT`.

---

## 3. Technology Stack Justification

| Technology | Layer | Role in Project | Technical Justification |
| :--- | :--- | :--- | :--- |
| **React 18** | Frontend UI | Single Page Application (SPA) | Component reusability, virtual DOM performance, reactive state updates. |
| **HTML5 / CSS3 / JS** | Frontend Core | Structure & Styling | Modern CSS grid, flexbox, glassmorphic UI, responsive mobile compatibility. |
| **@zxing/browser** | Frontend Scanner | Client-side camera QR decoding | Real-time QR frame decoding directly in browser without server roundtrip. |
| **Java 17+ / Spring Boot 3** | Backend Core | RESTful Microservice | Enterprise robustness, dependency injection, type safety, multi-threading. |
| **Spring Security & JJWT** | Security | Authentication & Authorization | Stateless JWT bearer tokens, BCrypt password hashing, RBAC filter chain. |
| **Spring Data JPA / Hibernate**| ORM | Data Persistence | Object-Relational Mapping, query abstraction, automated schema creation. |
| **ZXing (Zebra Crossing)** | Backend QR Engine | QR Generation | High-speed, high-density matrix barcode generation into Base64 PNG. |
| **MySQL 8+** | Database | Relational Storage | ACID compliance, referential integrity, unique constraints, transactional safety. |

---

## 4. System Architecture

```mermaid
graph TD
    subgraph Client_Tier["Client Tier (Mobile / Desktop Browser)"]
        UI_Login["Login & Auth View"]
        UI_Admin["Admin Analytics Dashboard"]
        UI_Teacher["Teacher Session & Live QR"]
        UI_Student["Student Dashboard & History"]
        UI_Scanner["ZXing Camera QR Scanner"]
    end

    subgraph API_Gateway["Security & Transport Tier"]
        CORS["CORS Filter"]
        JWT_Filter["JwtAuthenticationFilter"]
        Sec_Config["Spring Security FilterChain (RBAC)"]
    end

    subgraph Service_Tier["Spring Boot 3 Application Tier"]
        AuthCtrl["AuthController"]
        SessCtrl["SessionController"]
        AttCtrl["AttendanceController"]
        AdminCtrl["AdminController"]

        AuthServ["AuthService"]
        SessServ["SessionService"]
        AttServ["AttendanceService"]
        QrServ["QrCodeService (ZXing)"]
    end

    subgraph Data_Tier["Persistence Tier (MySQL)"]
        Repo["Spring Data JPA Repositories"]
        DB[("MySQL Database: smart_attendance")]
    end

    UI_Login --> CORS
    UI_Teacher --> CORS
    UI_Student --> CORS
    UI_Scanner --> CORS

    CORS --> JWT_Filter --> Sec_Config
    Sec_Config --> AuthCtrl & SessCtrl & AttCtrl & AdminCtrl

    AuthCtrl --> AuthServ
    SessCtrl --> SessServ
    AttCtrl --> AttServ
    AdminCtrl --> SessServ & AttServ
    SessServ --> QrServ

    AuthServ & SessServ & AttServ --> Repo
    Repo --> DB
```

---

## 5. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "has profile"
    USERS ||--o| TEACHERS : "has profile"
    COURSES ||--o{ STUDENTS : "enrolled in"
    COURSES ||--o{ SUBJECTS : "contains"
    TEACHERS ||--o{ ATTENDANCE_SESSIONS : "creates"
    SUBJECTS ||--o{ ATTENDANCE_SESSIONS : "held for"
    STUDENTS ||--o{ ENROLLMENTS : "registers"
    SUBJECTS ||--o{ ENROLLMENTS : "includes"
    ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_RECORDS : "contains"
    STUDENTS ||--o{ ATTENDANCE_RECORDS : "records"

    USERS {
        BIGINT id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password_hash
        ENUM role "ADMIN, TEACHER, STUDENT"
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    COURSES {
        BIGINT id PK
        VARCHAR course_code UK
        VARCHAR course_name
        VARCHAR department
        INT total_semesters
    }

    TEACHERS {
        BIGINT id PK
        BIGINT user_id FK,UK
        VARCHAR employee_id UK
        VARCHAR department
        VARCHAR designation
        VARCHAR phone
    }

    STUDENTS {
        BIGINT id PK
        BIGINT user_id FK,UK
        VARCHAR roll_number UK
        BIGINT course_id FK
        INT semester
        VARCHAR section
        VARCHAR phone
    }

    SUBJECTS {
        BIGINT id PK
        VARCHAR subject_code UK
        VARCHAR subject_name
        BIGINT course_id FK
        INT semester
        INT credits
    }

    ENROLLMENTS {
        BIGINT id PK
        BIGINT student_id FK
        BIGINT subject_id FK
        VARCHAR academic_year
        TIMESTAMP enrolled_at
    }

    ATTENDANCE_SESSIONS {
        BIGINT id PK
        VARCHAR session_code UK
        BIGINT subject_id FK
        BIGINT teacher_id FK
        VARCHAR token_hash
        VARCHAR session_title
        VARCHAR room_number
        DATETIME start_time
        DATETIME expires_at
        ENUM status "ACTIVE, EXPIRED, CLOSED"
    }

    ATTENDANCE_RECORDS {
        BIGINT id PK
        BIGINT session_id FK
        BIGINT student_id FK
        TIMESTAMP marked_at
        ENUM status "PRESENT, ABSENT, LATE"
        VARCHAR device_info
        VARCHAR ip_address
        DECIMAL latitude
        DECIMAL longitude
    }
```

---

## 6. Data Flow Diagrams (DFD)

### 6.1 DFD Level 0 (Context Diagram)

```mermaid
flowchart TD
    Teacher["Faculty / Teacher"]
    Student["Student"]
    Admin["Institutional Administrator"]
    System["Smart Attendance System"]

    Teacher -->|"1. Login, Create Session, Config TTL"| System
    System -->|"2. Display Dynamic QR Code & Live Feed"| Teacher

    Student -->|"3. Scan QR Code & Submit Token"| System
    System -->|"4. Return Attendance Status & Real-time %"| Student

    Admin -->|"5. Manage Master Records (Users, Courses)"| System
    System -->|"6. Institutional Reports & Attendance Analytics"| Admin
```

### 6.2 DFD Level 1 (Detailed Subsystem Data Flow)

```mermaid
flowchart TD
    T["Teacher"] -->|"Credentials"| P1["1.0 Authentication & RBAC"]
    S["Student"] -->|"Credentials"| P1
    P1 -->|"Issue JWT Token"| T
    P1 -->|"Issue JWT Token"| S

    T -->|"Subject ID, Duration, Room"| P2["2.0 Session Management"]
    P2 -->|"Write Session"| D1[("attendance_sessions")]
    P2 -->|"Generate Matrix"| P3["3.0 QR Generator (ZXing)"]
    P3 -->|"Base64 PNG Image"| T

    S -->|"Scanned Token + Device Data"| P4["4.0 Attendance Verification"]
    P4 -->|"Check Token & Expiry"| D1
    P4 -->|"Check Student Enrollment"| D2[("enrollments")]
    P4 -->|"Check Previous Scan (UK)"| D3[("attendance_records")]
    P4 -->|"Store Record (PRESENT)"| D3
    P4 -->|"Confirmation Response"| S

    S -->|"Request Subject Summary"| P5["5.0 Analytics Engine"]
    D3 -->|"Read History"| P5
    D1 -->|"Read Total Sessions"| P5
    P5 -->|"Subject % & Warning Flags"| S
```

---

## 7. Anti-Proxy Security Strategy

| Threat Vector | Attack Scenario | Implemented Defense Mechanism |
| :--- | :--- | :--- |
| **Duplicate Check-in** | Student clicks "Scan" multiple times rapidly or submits multiple HTTP requests. | **MySQL Unique Constraint:** `UNIQUE(session_id, student_id)`. The secondary insert fails with HTTP 409 Conflict. |
| **Remote Photo Sharing** | Student inside class snaps photo of QR and sends it to an absent friend via WhatsApp. | **1. Short Dynamic TTL:** Session expires in 2–5 minutes.<br>**2. Rolling QR:** Teacher clicks "Rotate Token" which invalidates the old token every 20 seconds. |
| **Unenrolled Access** | Student from a different branch or semester scans QR to gain attendance. | **Enrollment Validation:** Backend joins `enrollments` table verifying `student_id` is registered for `subject_id`. |
| **Token Guessing / Brute Force**| Student writes a script to guess tokens. | Cryptographically strong 128-bit UUID (`UUID.randomUUID()`) having $3.4 \times 10^{38}$ possible values. |
| **API Impersonation** | Student crafts raw POST requests using curl or Postman without logging in. | **Spring Security Stateless JWT:** Authorization header validated on each request; student identity extracted directly from verified JWT claims. |

---

## 8. Mathematical Attendance Percentage Formulation

For any student $i$ enrolled in subject $j$:
$$\text{Attendance Percentage } (P_{i,j}) = \left( \frac{\sum \text{Attended Sessions}_{i,j}}{\text{Total Sessions Held}_j} \right) \times 100$$

### University Criteria Condition:
$$\text{Eligibility Status} = \begin{cases} 
\text{ELIGIBLE (Good)}, & \text{if } P_{i,j} \ge 85\% \\ 
\text{WARNING (Borderline)}, & \text{if } 75\% \le P_{i,j} < 85\% \\ 
\text{DEBARRED (Critical Shortage)}, & \text{if } P_{i,j} < 75\% 
\end{cases}$$

---

## 9. Comprehensive Viva Voce Questions & High-Scoring Answers

### Q1: What makes your attendance system "Smart" compared to biometric thumb scanners?
**Answer:** Biometric thumb scanners create physical bottlenecks at classroom doorways (60 students taking 10 seconds each = 10 minutes delay) and suffer hardware degradation. Our Smart Attendance system is decentralized: the teacher displays one screen, and 60+ students scan concurrently on their own devices within seconds without physical contact or specialized hardware.

### Q2: How does the system prevent a student from marking attendance twice?
**Answer:** We enforce duplicate prevention across two layers:
1. **Application Layer:** `attendanceRecordRepository.existsBySessionIdAndStudentId(...)` checks prior to insertion.
2. **Database Engine Layer:** `UNIQUE KEY uk_session_student (session_id, student_id)` on the `attendance_records` table. Even if two concurrent multi-threaded requests arrive in the exact same millisecond, MySQL serializes the transaction and throws a `DataIntegrityViolationException`, which our `GlobalExceptionHandler` converts into an informative HTTP 409 response.

### Q3: How do you prevent a student in the classroom from sending a picture of the QR code to an absent friend?
**Answer:** We mitigate this through:
1. **Short TTL:** Sessions are configured with short countdowns (e.g., 2 minutes).
2. **Dynamic Rolling QR (Token Rotation):** The teacher interface allows 20-second rolling token updates; when refreshed, the previous token hash is replaced in the database. A forwarded screenshot taken 30 seconds ago is immediately rejected as invalid.
3. **Audit Fields:** We record client IP, browser user-agent, and optional geolocation coordinates.

### Q4: Why did you choose JWT over HTTP Session cookies?
**Answer:** HTTP Sessions store state in server RAM, making horizontal scaling difficult. JSON Web Tokens (JWT) are stateless: all authentication claims and signatures reside in the token carried by the client. The backend verifies the HMAC-SHA256 signature using `io.jsonwebtoken` without querying session storage, reducing server memory usage to zero.

### Q5: How does the camera scan work in the browser without an external app?
**Answer:** The frontend uses HTML5 `navigator.mediaDevices.getUserMedia` wrapped by the `@zxing/browser` library (`BrowserQRCodeReader`). It accesses the device's back camera stream directly in the DOM, processes video frames onto an HTML5 canvas, and extracts the QR matrix payload using computer vision algorithms in real time.

---

## 10. Test Scenarios & Results

| Test Case ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Valid Student Scan | Active QR token, enrolled student | HTTP 200, Status: PRESENT, count increments | Attendance recorded instantly | **PASS** |
| **TC-02** | Duplicate Scan | Re-scanning same token for same student | HTTP 409 Conflict, "Attendance already recorded" | Duplicate blocked | **PASS** |
| **TC-03** | Expired QR Token | Scanning token after TTL timer expires | HTTP 400 Bad Request, "Session has expired" | Scan rejected | **PASS** |
| **TC-04** | Unenrolled Student | Student not enrolled in subject scans code | HTTP 403 Forbidden, "Not enrolled in subject" | Scan rejected | **PASS** |
| **TC-05** | Unauthorized API Access | Student attempts to call `/api/sessions` (teacher API) | HTTP 403 Forbidden | Access denied | **PASS** |
| **TC-06** | Manual Token Fallback | Typing token string via keyboard | HTTP 200, Status: PRESENT | Attendance marked successfully | **PASS** |
