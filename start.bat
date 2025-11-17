@echo off
REM EventYukk - Quick Start Script (Windows)
REM Script untuk menjalankan project dengan mudah

echo.
echo 🚀 EventYukk - Starting Application...
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js tidak ditemukan!
    echo    Install Node.js v18+ dari https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

echo 📦 Checking dependencies...
echo.

REM Check backend dependencies
if not exist "server\node_modules" (
    echo ⚠️  Backend dependencies belum terinstall
    echo    Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

REM Check frontend dependencies
if not exist "frontend\node_modules" (
    echo ⚠️  Frontend dependencies belum terinstall
    echo    Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo ✅ Dependencies OK
echo.

REM Check config.env
if not exist "server\config.env" (
    echo ❌ File server\config.env tidak ditemukan!
    echo    Buat file config.env dari contoh di README.md
    pause
    exit /b 1
)

echo ✅ Config file OK
echo.

REM Ask which to run
echo Pilih yang ingin dijalankan:
echo   1) Backend only (port 3000)
echo   2) Frontend only (port 5173)
echo   3) Both (Backend + Frontend) - Recommended
echo.
set /p choice="Pilihan [1/2/3] (default: 3): "

if "%choice%"=="" set choice=3

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting Backend Server...
    cd server
    call npm run dev
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🚀 Starting Frontend Server...
    cd frontend
    call npm run dev
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 🚀 Starting Both Servers...
    echo.
    echo Terminal 1: Backend (Port 3000)
    echo Terminal 2: Frontend (Port 5173)
    echo.
    echo Opening in new windows...
    echo.
    
    REM Start backend in new window
    start "EventYukk - Backend" cmd /k "cd /d %~dp0server && npm run dev"
    
    REM Wait a bit
    timeout /t 2 /nobreak >nul
    
    REM Start frontend in new window
    start "EventYukk - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
    
    echo ✅ Both servers started in separate windows
    echo.
    pause
    goto end
)

echo ❌ Pilihan tidak valid
pause
exit /b 1

:end

