@echo off
echo ========================================
echo Smart Hospital Queue System - Setup
echo ========================================
echo.

echo [1/5] Setting up Backend...
cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Training AI model...
python -m app.ml.wait_time_predictor

echo Seeding database...
python -m app.database.seed

echo.
echo [2/5] Backend setup complete!
echo.

cd ..

echo [3/5] Setting up Frontend...
cd frontend

echo Installing Node dependencies...
call npm install

echo.
echo [4/5] Frontend setup complete!
echo.

cd ..

echo ========================================
echo [5/5] Setup Complete!
echo ========================================
echo.
echo To start the system:
echo.
echo 1. Backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python main.py
echo.
echo 2. Frontend (new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:3000
echo.
echo ========================================
pause
