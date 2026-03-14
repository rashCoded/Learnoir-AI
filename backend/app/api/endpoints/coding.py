from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.services.gemini_service import GeminiService
from app.database import get_db
from app.models.database import User, CodingProblem, CodingSubmission
from app.utils.premium import require_premium

router = APIRouter()
gemini_service = GeminiService()


class GenerateProblemRequest(BaseModel):
    difficulty: str = "easy"  # easy, medium, hard
    topic: str = "arrays"  # arrays, strings, dp, trees, graphs, etc.


class EvaluateCodeRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "python"
    user_email: str


class ProblemResponse(BaseModel):
    id: Optional[int] = None
    title: str
    difficulty: str
    topic: str
    description: str
    examples: List[Dict[str, str]]
    constraints: List[str]
    starter_code: Dict[str, str]
    solution_hint: Optional[str] = None


class EvaluationResponse(BaseModel):
    is_correct: bool
    passed_tests: int
    total_tests: int
    feedback: str
    suggestions: List[str]
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None


class UserStatsResponse(BaseModel):
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    streak: int
    best_streak: int


@router.post("/generate", response_model=ProblemResponse)
async def generate_problem(
    request: GenerateProblemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_premium)  # Premium feature
):
    """Generate a new coding problem using AI [PREMIUM FEATURE]"""
    try:
        # Generate problem using Gemini
        problem_data = gemini_service.generate_coding_problem(
            difficulty=request.difficulty,
            topic=request.topic
        )
        
        # Save to database
        new_problem = CodingProblem(
            title=problem_data.get("title", "Untitled"),
            difficulty=request.difficulty,
            topic=request.topic,
            description=problem_data.get("description", ""),
            examples=problem_data.get("examples", []),
            constraints=problem_data.get("constraints", []),
            starter_code=problem_data.get("starter_code", {}),
            solution_hint=problem_data.get("solution_hint", ""),
            test_cases=problem_data.get("test_cases", [])
        )
        db.add(new_problem)
        db.commit()
        db.refresh(new_problem)
        
        return ProblemResponse(
            id=new_problem.id,
            title=new_problem.title,
            difficulty=new_problem.difficulty,
            topic=new_problem.topic,
            description=new_problem.description,
            examples=new_problem.examples,
            constraints=new_problem.constraints,
            starter_code=new_problem.starter_code,
            solution_hint=new_problem.solution_hint
        )
        
    except Exception as e:
        print(f"Error generating problem: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_code(
    request: EvaluateCodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_premium)  # Premium feature
):
    """Evaluate user's code solution using AI [PREMIUM FEATURE]"""
    try:
        # Get problem from database
        problem = db.query(CodingProblem).filter(CodingProblem.id == request.problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        # Get user
        user = db.query(User).filter(User.email == request.user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare problem data for evaluation
        problem_data = {
            "title": problem.title,
            "description": problem.description,
            "test_cases": problem.test_cases or []
        }
        
        # Evaluate using Gemini
        evaluation = gemini_service.evaluate_code(
            problem=problem_data,
            user_code=request.code,
            language=request.language
        )
        
        # Save submission
        submission = CodingSubmission(
            user_id=user.id,
            problem_id=problem.id,
            code=request.code,
            language=request.language,
            is_correct=evaluation.get("is_correct", False),
            execution_result=evaluation
        )
        db.add(submission)
        db.commit()
        
        return EvaluationResponse(
            is_correct=evaluation.get("is_correct", False),
            passed_tests=evaluation.get("passed_tests", 0),
            total_tests=evaluation.get("total_tests", 0),
            feedback=evaluation.get("feedback", ""),
            suggestions=evaluation.get("suggestions", []),
            time_complexity=evaluation.get("time_complexity"),
            space_complexity=evaluation.get("space_complexity")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error evaluating code: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{user_email}")
async def get_user_history(user_email: str, db: Session = Depends(get_db)):
    """Get user's coding problem history"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return {"submissions": [], "stats": {"total_solved": 0}}
    
    submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == user.id
    ).order_by(CodingSubmission.submitted_at.desc()).limit(20).all()
    
    # Get unique solved problems
    solved_problems = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == user.id,
        CodingSubmission.is_correct == True
    ).distinct(CodingSubmission.problem_id).all()
    
    # Count by difficulty
    stats = {
        "total_solved": len(solved_problems),
        "easy_solved": 0,
        "medium_solved": 0,
        "hard_solved": 0
    }
    
    for sub in solved_problems:
        problem = db.query(CodingProblem).filter(CodingProblem.id == sub.problem_id).first()
        if problem:
            if problem.difficulty == "easy":
                stats["easy_solved"] += 1
            elif problem.difficulty == "medium":
                stats["medium_solved"] += 1
            elif problem.difficulty == "hard":
                stats["hard_solved"] += 1
    
    return {
        "submissions": [
            {
                "id": s.id,
                "problem_id": s.problem_id,
                "language": s.language,
                "is_correct": s.is_correct,
                "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None
            } for s in submissions
        ],
        "stats": stats
    }


@router.get("/problems")
async def get_recent_problems(db: Session = Depends(get_db)):
    """Get recently generated problems"""
    problems = db.query(CodingProblem).order_by(
        CodingProblem.created_at.desc()
    ).limit(10).all()
    
    return {
        "problems": [
            {
                "id": p.id,
                "title": p.title,
                "difficulty": p.difficulty,
                "topic": p.topic
            } for p in problems
        ],
        "count": len(problems)
    }
