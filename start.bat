@echo off
echo Starting Laundrix - Laundry Management System...
echo.

echo Starting Backend Server...
start "Laundrix Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Laundrix Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul