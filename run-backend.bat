@echo off
title Smart Attendance - Backend (Spring Boot)
cd /d "%~dp0backend"
echo ========================================================
echo   Starting Smart Attendance Backend (Spring Boot: 8080)
echo ========================================================
mvnw.cmd spring-boot:run
pause
