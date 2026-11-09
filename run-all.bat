@echo off
title Smart Attendance - One Click Launcher
echo ========================================================
echo   Launching Smart Attendance System (Backend + Frontend)
echo ========================================================

echo 1. Launching Spring Boot Backend (Port 8080)...
start "Smart Attendance - Backend (8080)" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

timeout /t 3 /nobreak >nul

echo 2. Launching React Frontend (Port 5173)...
start "Smart Attendance - Frontend (5173)" cmd /k "cd /d %~dp0frontend && set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev -- --host"

echo ========================================================
echo   All servers started in separate windows!
echo   Open your browser at: http://localhost:5173
echo ========================================================
pause
