@echo off
title SPIT DBMS Database Setup
echo ================================================================
echo Executing MySQL 3NF Database Setup & Seed Script
echo ================================================================
cd /d "%~dp0backend"
node setup_db.js
pause
