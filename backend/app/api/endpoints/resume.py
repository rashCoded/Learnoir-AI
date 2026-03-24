from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_parser import ResumeParser
from pydantic import BaseModel
from typing import List
import shutil
import os
import tempfile

router = APIRouter()
parser = ResumeParser()

class CareerRole(BaseModel):
    name: str
    match_score: int
    missing_skills: List[str]

class ResumeAnalysisResponse(BaseModel):
    skills: List[str]
    roles: List[CareerRole]
    experience: List[str]  # NEW: Include experience

# Rule-based skill requirements for each role
ROLE_SKILLS = {
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind CSS"],
    "Backend Developer": ["Python", "Django", "FastAPI", "SQL", "Docker", "REST API"],
    "Data Scientist": ["Python", "SQL", "Pandas", "NumPy", "Machine Learning", "TensorFlow"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Bash"],
    "Full Stack Engineer": ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"]
}

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    try:
        # Parse resume to structured JSON
        parse_result = parser.parse(temp_file_path)
        extracted_skills = parse_result.get("current_skills", [])
        experience = parse_result.get("experience", [])
        
        # Fallback if parser finds nothing
        if not extracted_skills:
            extracted_skills = ["Communication", "Problem Solving"]

        roles = []
        user_skills_lower = set(s.lower() for s in extracted_skills)

        # Calculate match scores and missing skills
        for role_name, required_skills in ROLE_SKILLS.items():
            required_set = set(s.lower() for s in required_skills)
            matched_skills = user_skills_lower.intersection(required_set)
            
            match_count = len(matched_skills)
            total_required = len(required_skills)
            
            match_score = int((match_count / total_required) * 100) if total_required > 0 else 0
            
            missing_skills = [s for s in required_skills if s.lower() not in user_skills_lower]

            roles.append(CareerRole(
                name=role_name,
                match_score=match_score,
                missing_skills=missing_skills
            ))

        # Sort by match score descending
        roles.sort(key=lambda x: x.match_score, reverse=True)

        return ResumeAnalysisResponse(
            skills=extracted_skills, 
            roles=roles[:4],  # Top 4 roles
            experience=experience
        )

    except Exception as e:
        print(f"Error in analyze_resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

class ResumeFeedback(BaseModel):
    ats_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]

@router.post("/feedback", response_model=ResumeFeedback)
async def get_resume_feedback(file: UploadFile = File(...)):
    """Get AI-powered resume feedback and ATS score"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    try:
        # Extract text from PDF
        text = parser.extract_text_from_pdf(temp_file_path)
        
        # Get AI feedback
        from app.services.gemini_service import GeminiService
        gemini = GeminiService()
        feedback = gemini.analyze_resume(text)
        
        return ResumeFeedback(**feedback)
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


class ParsedResumeResponse(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    skills: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    projects: List[dict] = []
    certifications: List[str] = []
    raw_text: str = ""  # Full extracted text from PDF


@router.post("/parse", response_model=ParsedResumeResponse)
async def parse_resume(file: UploadFile = File(...)):
    """Parse a resume PDF and return structured data for display"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    try:
        # Extract raw text from PDF first
        raw_text = parser.extract_text_from_pdf(temp_file_path)
        
        # Parse resume to structured JSON
        parse_result = parser.parse(temp_file_path)
        
        return ParsedResumeResponse(
            name=parse_result.get("name", ""),
            email=parse_result.get("email", ""),
            phone=parse_result.get("phone", ""),
            location=parse_result.get("location", ""),
            summary=parse_result.get("summary", ""),
            skills=parse_result.get("current_skills", []),
            experience=parse_result.get("experience", []),
            education=parse_result.get("education", []),
            projects=parse_result.get("projects", []),
            certifications=parse_result.get("certifications", []),
            raw_text=raw_text  # Include full PDF text
        )

    except Exception as e:
        print(f"Error parsing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


class ResumeTextInput(BaseModel):
    resume_text: str


class AIFeedbackResponse(BaseModel):
    ats_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]


@router.post("/ai-feedback-pdf", response_model=AIFeedbackResponse)
async def get_ai_feedback_from_pdf(file: UploadFile = File(...)):
    """Get detailed AI-powered resume feedback by analyzing the PDF directly with Gemini"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    try:
        from app.services.gemini_service import GeminiService
        
        gemini = GeminiService()
        
        # Use direct PDF analysis with Gemini
        feedback = gemini.analyze_resume_pdf(temp_file_path)
        
        return AIFeedbackResponse(
            ats_score=min(100, max(0, int(feedback.get("ats_score", 70)))),
            strengths=feedback.get("strengths", ["Analysis completed"])[:10],
            weaknesses=feedback.get("weaknesses", ["No major issues found"])[:10],
            suggestions=feedback.get("suggestions", ["Continue improving your resume"])[:12]
        )
        
    except Exception as e:
        print(f"Error in PDF AI feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@router.post("/ai-feedback", response_model=AIFeedbackResponse)
async def get_ai_feedback(input_data: ResumeTextInput):
    """Get detailed AI-powered resume feedback using Gemini"""
    try:
        from app.services.gemini_service import GeminiService
        import json
        
        gemini = GeminiService()
        
        prompt = f"""Analyze this resume and provide detailed, actionable feedback. Be specific and thorough.

RESUME:
{input_data.resume_text}

Provide your analysis in EXACTLY this JSON format (no markdown, just pure JSON):
{{
    "ats_score": <number 0-100 based on ATS compatibility>,
    "strengths": [
        "<specific strength 1 with explanation>",
        "<specific strength 2 with explanation>",
        "<specific strength 3 with explanation>",
        "<add more as needed, at least 5 strengths>"
    ],
    "weaknesses": [
        "<specific weakness 1 with explanation>",
        "<specific weakness 2 with explanation>",
        "<specific weakness 3 with explanation>",
        "<add more as needed, at least 5 weaknesses>"
    ],
    "suggestions": [
        "<detailed actionable suggestion 1>",
        "<detailed actionable suggestion 2>",
        "<detailed actionable suggestion 3>",
        "<detailed actionable suggestion 4>",
        "<detailed actionable suggestion 5>",
        "<add more as needed, at least 8 suggestions>"
    ]
}}

Be brutally honest but constructive. Focus on:
- ATS keyword optimization
- Impact statements and quantification
- Skills presentation and relevance
- Experience description quality
- Missing sections or information
- Formatting and structure issues
- Industry-specific recommendations"""

        response = gemini.generate(prompt)
        
        # Clean up response - remove markdown code blocks if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()
        
        # Parse JSON
        feedback_data = json.loads(cleaned)
        
        return AIFeedbackResponse(
            ats_score=min(100, max(0, int(feedback_data.get("ats_score", 70)))),
            strengths=feedback_data.get("strengths", ["Analysis completed"])[:10],
            weaknesses=feedback_data.get("weaknesses", ["No major issues found"])[:10],
            suggestions=feedback_data.get("suggestions", ["Continue improving your resume"])[:12]
        )
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        # Return a fallback response
        return AIFeedbackResponse(
            ats_score=70,
            strengths=["Resume received", "Unable to parse detailed analysis"],
            weaknesses=["AI response format issue"],
            suggestions=["Please try again or contact support"]
        )
    except Exception as e:
        print(f"Error in AI feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= PDF Storage Endpoints =============

from fastapi import Depends, Response
from sqlalchemy.orm import Session
from app.models.database import ResumeData, User
from app.database import get_db
from app.utils.auth import get_current_user


@router.post("/save-pdf")
async def save_resume_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save resume PDF to database for current authenticated user"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # Read PDF content
    pdf_content = await file.read()
    
    # Check for existing resume data for this user
    existing = db.query(ResumeData).filter(ResumeData.user_id == user.id).first()
    
    if existing:
        # Update existing record
        existing.pdf_data = pdf_content
        existing.pdf_filename = file.filename
    else:
        # Create new record
        resume_record = ResumeData(
            user_id=user.id,
            skills=[],
            experience=[],
            pdf_data=pdf_content,
            pdf_filename=file.filename
        )
        db.add(resume_record)
    
    db.commit()
    return {"message": "Resume PDF saved successfully", "filename": file.filename}


@router.get("/get-pdf")
async def get_resume_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get saved resume PDF for current authenticated user"""
    user = db.query(User).filter(User.id == current_user.id).first()
    
    resume = db.query(ResumeData).filter(ResumeData.user_id == user.id).first()
    
    if not resume or not resume.pdf_data:
        raise HTTPException(status_code=404, detail="No saved resume PDF found")
    
    return Response(
        content=resume.pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={resume.pdf_filename or 'resume.pdf'}"}
    )


@router.post("/analyze-saved-pdf", response_model=AIFeedbackResponse)
async def analyze_saved_resume_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze the saved resume PDF for current authenticated user using AI"""
    user = db.query(User).filter(User.id == current_user.id).first()
    
    resume = db.query(ResumeData).filter(ResumeData.user_id == user.id).first()
    
    if not resume or not resume.pdf_data:
        raise HTTPException(status_code=404, detail="No saved resume PDF found. Please upload a resume first.")
    
    # Write PDF to temp file for Gemini analysis
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(resume.pdf_data)
        temp_file_path = temp_file.name
    
    try:
        from app.services.gemini_service import GeminiService
        
        gemini = GeminiService()
        feedback = gemini.analyze_resume_pdf(temp_file_path)
        
        return AIFeedbackResponse(
            ats_score=min(100, max(0, int(feedback.get("ats_score", 70)))),
            strengths=feedback.get("strengths", ["Analysis completed"])[:10],
            weaknesses=feedback.get("weaknesses", ["No major issues found"])[:10],
            suggestions=feedback.get("suggestions", ["Continue improving your resume"])[:12]
        )
        
    except Exception as e:
        print(f"Error analyzing saved PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
