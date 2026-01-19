@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

REM ===================================================
REM   MyTree Journal - Professional Startup Script
REM   Version: 1.1.1
REM   Features: Auto-detect venv, dependency check
REM ===================================================

REM Navigate to script directory
cd /d "%~dp0"
set "PROJECT_DIR=%CD%"

cls
echo.
echo   ╔═══════════════════════════════════════════════════════╗
echo   ║          🌳 MyTree Journal - Startup Script           ║
echo   ╚═══════════════════════════════════════════════════════╝
echo.
echo   📁 Project: %PROJECT_DIR%
echo.

REM ===================================================
REM   DEPENDENCY CHECKS
REM ===================================================
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   [0/2] Checking Dependencies...
echo.

REM Check Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   ❌ Python not found! Please install Python 3.11+
    goto :error_exit
) else (
    for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set "PYTHON_VER=%%v"
    echo   ✓ Python !PYTHON_VER!
)

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   ❌ Node.js not found! Please install Node.js 22+
    goto :error_exit
) else (
    for /f "tokens=1 delims= " %%v in ('node --version 2^>^&1') do set "NODE_VER=%%v"
    echo   ✓ Node.js !NODE_VER!
)

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   ❌ npm not found! Please install npm
    goto :error_exit
) else (
    for /f "tokens=1 delims= " %%v in ('npm --version 2^>^&1') do set "NPM_VER=%%v"
    echo   ✓ npm !NPM_VER!
)

echo.
echo   ✓ All dependencies satisfied!
echo.

REM ===================================================
REM   [1/2] BACKEND (Django)
REM ===================================================
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   [1/2] Starting Backend (Django)...

REM Auto-detect virtual environment
set "VENV_PATH="
for /d %%D in ("%PROJECT_DIR%\*") do (
    if exist "%%D\Scripts\activate.bat" (
        set "VENV_PATH=%%D"
        for %%F in ("%%D") do set "VENV_NAME=%%~nxF"
        goto :venv_found
    )
)

:venv_found
if defined VENV_PATH (
    echo   ✓ Virtual Environment: !VENV_NAME!
    start "MyTree Backend" cmd /k "title MyTree Backend && cd /d "%PROJECT_DIR%" && call "%VENV_PATH%\Scripts\activate.bat" && python manage.py runserver"
) else (
    echo   ⚠ No virtual environment found
    echo     Using system Python...
    start "MyTree Backend" cmd /k "title MyTree Backend && cd /d "%PROJECT_DIR%" && python manage.py runserver"
)

echo   ✓ Django server starting on http://localhost:8000
echo.

REM ===================================================
REM   [2/2] FRONTEND (Next.js)
REM ===================================================
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   [2/2] Starting Frontend (Next.js)...

set "FRONTEND_DIR=%PROJECT_DIR%\mytree-frontend"
if exist "%FRONTEND_DIR%\package.json" (
    REM Check if node_modules exists
    if not exist "%FRONTEND_DIR%\node_modules" (
        echo   ⚠ node_modules not found, running npm install...
        echo.
        cd /d "%FRONTEND_DIR%"
        call npm install
        cd /d "%PROJECT_DIR%"
    )
    start "MyTree Frontend" cmd /k "title MyTree Frontend && cd /d "%FRONTEND_DIR%" && npm run dev"
    echo   ✓ Next.js server starting on http://localhost:3000
) else (
    echo   ❌ Frontend not found at: %FRONTEND_DIR%
    goto :error_exit
)

echo.
echo   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   ╔═══════════════════════════════════════════════════════╗
echo   ║              ✨ All servers started! ✨               ║
echo   ╠═══════════════════════════════════════════════════════╣
echo   ║  🔧 Backend:  http://localhost:8000                   ║
echo   ║  🌐 Frontend: http://localhost:3000                   ║
echo   ╚═══════════════════════════════════════════════════════╝
echo.
echo   Press any key to close this window...
pause >nul
goto :end

:error_exit
echo.
echo   ╔═══════════════════════════════════════════════════════╗
echo   ║           ❌ Startup Failed - Check Above ❌            ║
echo   ╚═══════════════════════════════════════════════════════╝
echo.
pause
goto :end

:end
endlocal
exit /b 0
