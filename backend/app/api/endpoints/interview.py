from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.gemini_service import GeminiService
from app.database import get_db
from app.models.database import User, InterviewAttempt

router = APIRouter()
gemini_service = GeminiService()


class InterviewRequest(BaseModel):
    target_role: str
    difficulty: str = "intermediate"  # beginner, intermediate, advanced


class InterviewQuestion(BaseModel):
    category: str  # "technical" or "behavioral"
    question: str
    tips: str


class InterviewResponse(BaseModel):
    role: str
    questions: List[InterviewQuestion]


class SaveAttemptRequest(BaseModel):
    user_email: str
    role: str
    total_questions: int
    correct_answers: int


class StatsResponse(BaseModel):
    total_attempts: int
    average_score: float
    questions_practiced: int
    best_score: int
    recent_attempts: List[Dict[str, Any]]


@router.post("/generate", response_model=InterviewResponse)
async def generate_interview_questions(request: InterviewRequest):
    """Generate AI-powered interview questions for a specific role"""
    try:
        questions_data = gemini_service.generate_interview_questions(
            role=request.target_role,
            difficulty=request.difficulty
        )
        
        # Convert to Pydantic models
        questions = [
            InterviewQuestion(**q) for q in questions_data
        ]
        
        return InterviewResponse(
            role=request.target_role,
            questions=questions
        )
    except Exception as e:
        print(f"Error generating interview questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# MCQ Models
class MCQQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str


class MCQResponse(BaseModel):
    role: str
    questions: List[MCQQuestion]


class MCQRequest(BaseModel):
    target_role: str
    difficulty: str = "intermediate"
    count: int = 10


@router.post("/generate-mcq", response_model=MCQResponse)
async def generate_mcq_questions(request: MCQRequest):
    """Generate MCQ questions with 4 options for a specific role"""
    try:
        questions_data = gemini_service.generate_mcq_questions(
            role=request.target_role,
            difficulty=request.difficulty,
            count=request.count
        )
        
        # Convert to Pydantic models
        questions = [
            MCQQuestion(**q) for q in questions_data
        ]
        
        return MCQResponse(
            role=request.target_role,
            questions=questions
        )
    except Exception as e:
        print(f"Error generating MCQ questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-attempt")
async def save_interview_attempt(request: SaveAttemptRequest, db: Session = Depends(get_db)):
    """Save an interview quiz attempt for tracking"""
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    score_percent = int((request.correct_answers / request.total_questions) * 100) if request.total_questions > 0 else 0
    
    attempt = InterviewAttempt(
        user_id=user.id,
        role=request.role,
        total_questions=request.total_questions,
        correct_answers=request.correct_answers,
        score_percent=score_percent
    )
    db.add(attempt)
    db.commit()
    
    return {"success": True, "score_percent": score_percent}


@router.get("/stats/{user_email}", response_model=StatsResponse)
async def get_interview_stats(user_email: str, db: Session = Depends(get_db)):
    """Get interview practice stats for a user"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return StatsResponse(
            total_attempts=0,
            average_score=0,
            questions_practiced=0,
            best_score=0,
            recent_attempts=[]
        )
    
    attempts = db.query(InterviewAttempt).filter(
        InterviewAttempt.user_id == user.id
    ).order_by(InterviewAttempt.attempted_at.desc()).all()
    
    if not attempts:
        return StatsResponse(
            total_attempts=0,
            average_score=0,
            questions_practiced=0,
            best_score=0,
            recent_attempts=[]
        )
    
    total_attempts = len(attempts)
    total_questions = sum(a.total_questions for a in attempts)
    avg_score = sum(a.score_percent for a in attempts) / total_attempts
    best_score = max(a.score_percent for a in attempts)
    
    recent = [
        {
            "id": a.id,
            "role": a.role,
            "score": a.score_percent,
            "questions": a.total_questions,
            "correct": a.correct_answers,
            "date": a.attempted_at.isoformat() if a.attempted_at else None
        } for a in attempts[:10]
    ]
    
    return StatsResponse(
        total_attempts=total_attempts,
        average_score=round(avg_score, 1),
        questions_practiced=total_questions,
        best_score=best_score,
        recent_attempts=recent
    )

