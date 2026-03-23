from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from app.api.endpoints import resume, recommendation, roadmap, interview, auth, gamification, coding, recruiter_sim, project_builder, job_matching, skill_learning, payments
from app.services.gemini_service import GeminiService
from app.services.razorpay_service import razorpay_service
from app.database import init_db

app = FastAPI(title="Learnoir AI API")

@app.on_event("startup")
async def startup_event():
    # Initialize database
    init_db()
    
    # Check AI service
    service = GeminiService()
    if service.model:
        print(f"✅ AI Service Initialized with Model: {service.model.model_name}")
    else:
        print("⚠️ AI Service running in MOCK mode (No API Key found)")
    
    # Check Razorpay service
    if razorpay_service.client:
        print("✅ Razorpay Payment Service Initialized")
    else:
        print("⚠️ Razorpay not configured - add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"
                  "https://learnoir-ai.vercel.app"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    allow_origin_regex=r"http://localhost(:[0-9]+)?$",
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(recommendation.router, prefix="/api/recommendation", tags=["recommendation"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["gamification"])
app.include_router(coding.router, prefix="/api/coding", tags=["coding"])
app.include_router(recruiter_sim.router)
app.include_router(project_builder.router)
app.include_router(job_matching.router)
app.include_router(skill_learning.router)
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Learnoir AI API"}
