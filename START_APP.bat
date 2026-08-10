@echo off
title Dental Clinic AI - Launcher
color 0A
echo.
echo  ============================================
echo   DENTAL CLINIC AI - FULL STACK LAUNCHER
echo  ============================================
echo.

echo  [1/3] Starting MySQL Server...
echo.

REM Kill any stuck mysqld
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 2 >nul

REM Check if port 3306 is already in use
netstat -ano | findstr ":3306 " >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo  [OK] MySQL is already running on port 3306.
) else (
    start "MySQL Server" /MIN "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\Users\tejas\Downloads\final version 6.o\my.ini" --standalone
    echo  [OK] MySQL starting... waiting 6 seconds...
    timeout /t 6 >nul
)

echo.
echo  [2/3] Starting Backend (Node.js on port 4000)...
start "Dental Backend" /MIN cmd /c "cd /d "C:\Users\tejas\Downloads\final version 6.o\Backend" && node server.js"
timeout /t 2 >nul

echo.
echo  [3/3] Starting Frontend (Vite on port 5173)...
start "Dental Frontend" /MIN cmd /c "cd /d "C:\Users\tejas\Downloads\final version 6.o\Frontend" && npm run dev"
timeout /t 3 >nul

echo.
echo  ============================================
echo   ALL SERVICES STARTED!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:4000
echo   MySQL:     localhost:3306
echo  ============================================
echo.
echo  Opening browser...
timeout /t 2 >nul
start "" http://localhost:5173

echo.
echo  Press any key to close this window (servers keep running in background)
pause >nul
