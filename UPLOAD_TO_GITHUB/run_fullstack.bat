@echo off
title SPIT College Events Management System
echo ========================================================
echo  SPIT College Events Management System - Full Stack
echo ========================================================
echo Starting Express Backend & Serving Frontend UI...
cd /d "%~dp0"
start "SPIT Events Backend" cmd /k "node backend/server.js"
timeout /t 2 /nobreak >nul
start http://localhost:5000
echo.
echo Application opened in default browser at http://localhost:5000
echo ========================================================
