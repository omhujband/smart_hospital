# 🚀 Deployment Guide

## Production Deployment Options

### Backend Deployment

#### Option 1: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up
```

#### Option 2: Render
1. Connect GitHub repo
2. Select backend folder
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment

#### Vercel (Recommended)
```bash
cd frontend
npm install -g vercel
vercel
```

### Database

#### Supabase
1. Create project at supabase.com
2. Get connection string
3. Update DATABASE_URL in backend

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key
ENVIRONMENT=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```
