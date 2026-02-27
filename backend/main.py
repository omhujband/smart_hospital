from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base

# 1. Import the newly segregated routes
from app.routes.receptionist import patients as rec_patients
from app.routes.receptionist import appointments as rec_appointments
from app.routes.receptionist import doctors as rec_doctors
from app.routes.doctor import consultations as doc_consultations
from app.routes.doctor import profile as doc_profile
from app.routes import ai

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Hospital Queue System (Segregated)",
    description="AI-powered hospital appointment optimization",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Register Receptionist Domain Routes
app.include_router(rec_patients.router)
app.include_router(rec_appointments.router)
app.include_router(rec_doctors.router)

# 3. Register Doctor Domain Routes
app.include_router(doc_consultations.router)
app.include_router(doc_profile.router)

# Register Shared Routes
app.include_router(ai.router)

@app.get("/")
def root():
    return {"status": "running", "version": "2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)