@echo off
echo ========================================
echo    Laundrix Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo Node.js version:
node --version
echo.

REM Check if MySQL is installed
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL is not installed!
    echo Please install MySQL from https://dev.mysql.com/downloads/mysql/
    pause
    exit /b
)

echo MySQL version:
mysql --version
echo.

echo ========================================
echo Step 1: Setting up Backend
echo ========================================
echo.

cd backend

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and update:
    echo - DB_PASSWORD with your MySQL password
    echo - JWT_SECRET with a random secret key
    echo - EMAIL_USER and EMAIL_PASSWORD for email notifications
    echo.
    pause
)

echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b
)

echo Backend setup complete!
echo.

cd ..

echo ========================================
echo Step 2: Setting up Frontend
echo ========================================
echo.

cd frontend

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
)

echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b
)

echo Frontend setup complete!
echo.

cd ..

echo ========================================
echo Step 3: Database Setup
echo ========================================
echo.
echo Please run the following SQL scripts in MySQL:
echo.
echo 1. Open MySQL Workbench or MySQL Command Line
echo 2. Run: source %CD%\database\schema.sql
echo 3. Run: source %CD%\database\seed.sql
echo.
echo Or copy and paste the contents of schema.sql and seed.sql
echo into MySQL Workbench and execute them.
echo.
pause

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Backend:
echo    cd backend
echo    npm run dev
echo.
echo 2. Frontend (in a new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:5173
echo.
echo Demo Login Credentials:
echo - Admin: admin@laundrix.com / Password123!
echo - Employee: john.emp@laundrix.com / Password123!
echo - Customer: mike@example.com / Password123!
echo.
echo For detailed instructions, see README.md
echo.
pause
