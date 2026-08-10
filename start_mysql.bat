@echo off
echo ========================================
echo   Starting MySQL for Dental Clinic AI
echo ========================================

REM Check if already running
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqladmin.exe" -u root -h 127.0.0.1 -P 3306 ping 2>nul
if %ERRORLEVEL% == 0 (
    echo MySQL is already running!
    goto :done
)

REM Start MySQL with the project's my.ini
echo Starting MySQL Server...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\Users\tejas\Downloads\final version 6.o\my.ini" --standalone --console

:done
echo Done.
pause
