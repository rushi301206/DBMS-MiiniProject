@echo off
title SPIT DBMS Backend Server
echo ================================================================
echo Starting SPIT College Clubs & Committees Event Management Backend
echo ================================================================
cd /d "%~dp0backend"
node server.js
pause
