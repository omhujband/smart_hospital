# 📋 Command Reference

## Setup Commands

### Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE hospital_queue;
\q
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m app.ml.wait_time_predictor
python -m app.database.seed
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Run Commands

### Start Backend
```bash
cd backend
venv\Scripts\activate
python main.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## Development Commands

### Backend
```bash
# Retrain model
python -m app.ml.wait_time_predictor

# Reseed database
python -m app.database.seed

# Run with auto-reload
uvicorn main:app --reload
```

### Frontend
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Testing Commands

### Test API
```bash
curl http://localhost:8000/health
curl http://localhost:8000/ai/analytics
curl http://localhost:8000/doctors
```

## Useful URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
