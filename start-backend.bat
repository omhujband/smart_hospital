@echo off
echo Starting Hospital Queue System Backend...
echo.

cd backend
call venv\Scripts\activate

echo Backend running on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

python main.py
