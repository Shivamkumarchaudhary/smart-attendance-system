@echo off
title Smart Attendance - Frontend (React.js)
cd /d "%~dp0frontend"
set PATH=C:\Program Files\nodejs;%PATH%
echo ========================================================
echo   Starting Smart Attendance Frontend (React: 5173)
echo ========================================================
call npm run dev -- --host
pause
