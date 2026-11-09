# 📱 QR-Based Smart Attendance Management System
**MCA Master Project | React.js, Java Spring Boot 3, MySQL**

---

## 🚀 Quick Start Guide

### 1. Database Setup (MySQL)
1. Ensure your MySQL Server is running (Service: `MySQL2610`).
2. Open your MySQL client or terminal and run:
   ```sql
   source c:/Users/shiva/Downloads/minipr/database/schema.sql;
   source c:/Users/shiva/Downloads/minipr/database/seed_data.sql;
   ```
3. Update your MySQL password in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
   *(Note: If you run Spring Boot on an empty database, our `DataInitializer.java` will automatically create the tables and seed default users!)*

---

### 2. Start the Java Spring Boot Backend
Open PowerShell:
```powershell
cd c:\Users\shiva\Downloads\minipr\backend
.\mvnw.cmd spring-boot:run
```
The backend REST APIs will be live at: **`http://localhost:8080`**

---

### 3. Start the React.js Frontend
Open another PowerShell window:
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
cd c:\Users\shiva\Downloads\minipr\frontend
npm.cmd run dev
```
The React frontend application will launch at: **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials
All accounts are pre-configured with the default password: **`password123`**  
*(You can also click the quick-login demo buttons on the login screen to autofill!)*

| Role | Email Address | Password | Description / Roll No |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartattendance.edu` | `password123` | Institutional Admin (Master Dashboard) |
| **Teacher** | `teacher1@smartattendance.edu` | `password123` | Dr. Rajesh Sharma (Generates Live QR) |
| **Teacher 2** | `teacher2@smartattendance.edu` | `password123` | Prof. Ananya Sen |
| **Student 1** | `aarav@student.edu` | `password123` | Aarav Patel (`MCA-2026-001`) |
| **Student 2** | `diya@student.edu` | `password123` | Diya Sharma (`MCA-2026-002`) |
| **Student 3** | `rohan@student.edu` | `password123` | Rohan Verma (`MCA-2026-003`) |

---

## 📂 Project Structure

```
minipr/
├── backend/
│   ├── src/main/java/com/smartattendance/smart_attendance/
│   │   ├── config/          # JWT Provider, SecurityFilterChain, DataInitializer
│   │   ├── controller/      # Auth, Session, Attendance, Admin REST Controllers
│   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   ├── entity/          # JPA Entities (User, Student, Teacher, Session, Record)
│   │   ├── exception/       # GlobalExceptionHandler, AppException
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   └── service/         # Business Logic, QR Matrix Generation (ZXing)
│   ├── pom.xml              # Maven dependencies (Spring Boot 3.3.4, ZXing, JJWT)
│   └── mvnw.cmd             # Maven Wrapper (Works with Java 26 / 17+)
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext (JWT handling, session state)
│   │   ├── pages/           # Login, Admin, Teacher & Student Dashboards, ScanQR
│   │   ├── services/        # Axios API Client with Bearer Token Interceptor
│   │   └── styles/          # Modern Responsive Dark/Glassmorphic CSS
│   ├── package.json         # React 18, Vite, @zxing/browser
│   └── vite.config.js       # Vite proxy to backend port 8080
├── database/
│   ├── schema.sql           # Complete MySQL DDL with Unique Constraints
│   └── seed_data.sql        # Demo users, courses, subjects, past attendances
└── docs/
    └── MCA_PROJECT_REPORT.md# Complete Project Report, ER Diagram, DFDs & Viva Q&A
```
// Run the frontend
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
 npm.cmd run dev 

 // Run the backend 
 .\mvnw.cmd spring-boot:run 