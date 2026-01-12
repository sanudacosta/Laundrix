#!/bin/bash

echo "========================================"
echo "   Laundrix Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL is not installed!"
    echo "Please install MySQL"
    exit 1
fi

echo "MySQL version:"
mysql --version
echo ""

echo "========================================"
echo "Step 1: Setting up Backend"
echo "========================================"
echo ""

cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit backend/.env and update:"
    echo "- DB_PASSWORD with your MySQL password"
    echo "- JWT_SECRET with a random secret key"
    echo "- EMAIL_USER and EMAIL_PASSWORD for email notifications"
    echo ""
    read -p "Press enter to continue..."
fi

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies!"
    exit 1
fi

echo "Backend setup complete!"
echo ""

cd ..

echo "========================================"
echo "Step 2: Setting up Frontend"
echo "========================================"
echo ""

cd frontend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies!"
    exit 1
fi

echo "Frontend setup complete!"
echo ""

cd ..

echo "========================================"
echo "Step 3: Database Setup"
echo "========================================"
echo ""
echo "Please run the following commands in MySQL:"
echo ""
echo "mysql -u root -p"
echo "source $(pwd)/database/schema.sql"
echo "source $(pwd)/database/seed.sql"
echo ""
read -p "Press enter after completing database setup..."

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open browser: http://localhost:5173"
echo ""
echo "Demo Login Credentials:"
echo "- Admin: admin@laundrix.com / Password123!"
echo "- Employee: john.emp@laundrix.com / Password123!"
echo "- Customer: mike@example.com / Password123!"
echo ""
echo "For detailed instructions, see README.md"
echo ""
