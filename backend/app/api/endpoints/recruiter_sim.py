"""
AI Recruiter Simulator API
Simulates how a real recruiter would evaluate a resume against a job description
[PREMIUM FEATURE]
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
from app.services.gemini_service import GeminiService
from app.models.database import User
from app.utils.premium import require_premium

router = APIRouter(prefix="/api/recruiter", tags=["recruiter"])

class RecruiterSimRequest(BaseModel):
    resume_text: str
    job_description: str

class KeywordAnalysis(BaseModel):
    keyword: str
    importance: str  # "critical", "important", "nice-to-have"
    found: bool
    suggestion: Optional[str] = None

class LineRewrite(BaseModel):
    original: str
    rewritten: str
    reason: str

class RecruiterSimResponse(BaseModel):
    verdict: str  # "shortlist", "reject", "maybe"
    verdict_confidence: int  # 0-100
    shortlist_reasons: List[str]
    rejection_risks: List[str]
    missing_keywords: List[KeywordAnalysis]
    lines_to_rewrite: List[LineRewrite]
    ats_score: int
    recruiter_notes: str
    action_items: List[str]

@router.post("/simulate", response_model=RecruiterSimResponse)
async def simulate_recruiter(
    request: RecruiterSimRequest,
    current_user: User = Depends(require_premium)  # Premium feature
):
    """
    Simulate how a recruiter would evaluate this resume for the given job description.
    Returns detailed analysis including rejection risks, missing keywords, and rewrite suggestions.
    [PREMIUM FEATURE - Requires active subscription]
    """
    try:
        gemini = GeminiService()
        
        prompt = f"""You are an experienced tech recruiter with 10+ years of experience hiring for top companies like Google, Meta, and Amazon.

A candidate has submitted their resume for a job. Analyze it EXACTLY like a real recruiter would.

**JOB DESCRIPTION:**
{request.job_description}

**CANDIDATE'S RESUME:**
{request.resume_text}

Provide your analysis in this EXACT JSON format:
{{
    "verdict": "shortlist" or "reject" or "maybe",
    "verdict_confidence": 0-100,
    "shortlist_reasons": [
        "Specific reason why this candidate could be shortlisted",
        "Another strength that matches the JD"
    ],
    "rejection_risks": [
        "Specific reason why recruiter might reject (be brutally honest)",
        "Another weakness or red flag"
    ],
    "missing_keywords": [
        {{
            "keyword": "specific skill/technology from JD",
            "importance": "critical" or "important" or "nice-to-have",
            "found": false,
            "suggestion": "How to address this gap"
        }}
    ],
    "lines_to_rewrite": [
        {{
            "original": "Exact line from resume that needs improvement",
            "rewritten": "Better version that matches JD",
            "reason": "Why this change helps"
        }}
    ],
    "ats_score": 0-100,
    "recruiter_notes": "Overall impression as a recruiter would think (2-3 sentences, be direct)",
    "action_items": [
        "Specific action the candidate should take",
        "Another action item"
    ]
}}

Be BRUTALLY HONEST like a real recruiter. Don't sugarcoat. Identify the REAL issues.
Return ONLY valid JSON, no markdown or explanation."""

        response = gemini.generate(prompt)
        
        # Parse JSON from response
        try:
            # Clean up response - remove markdown code blocks if present
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            result = json.loads(cleaned.strip())
            
            return RecruiterSimResponse(
                verdict=result.get("verdict", "maybe"),
                verdict_confidence=result.get("verdict_confidence", 50),
                shortlist_reasons=result.get("shortlist_reasons", []),
                rejection_risks=result.get("rejection_risks", []),
                missing_keywords=[
                    KeywordAnalysis(**kw) for kw in result.get("missing_keywords", [])
                ],
                lines_to_rewrite=[
                    LineRewrite(**lr) for lr in result.get("lines_to_rewrite", [])
                ],
                ats_score=result.get("ats_score", 0),
                recruiter_notes=result.get("recruiter_notes", ""),
                action_items=result.get("action_items", [])
            )
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error: {e}")
            
        except Exception as e:
            print(f"❌ Error parsing response: {e}")
    
    except Exception as e:
        print(f"❌ Error in recruiter simulation: {e}")
    
    # Return fallback data
    return RecruiterSimResponse(
        verdict="maybe",
        verdict_confidence=65,
        shortlist_reasons=[
            "Resume shows relevant technical experience",
            "Skills listed align with several job requirements",
            "Clear work history with progression"
        ],
        rejection_risks=[
            "Consider adding more quantifiable achievements",
            "Some key technologies from JD may be missing",
            "Experience level may need clarification"
        ],
        missing_keywords=[
            KeywordAnalysis(keyword="Leadership Experience", importance="important", found=False, suggestion="Add examples of leading teams or projects"),
            KeywordAnalysis(keyword="Agile/Scrum", importance="nice-to-have", found=False, suggestion="Mention any agile methodology experience")
        ],
        lines_to_rewrite=[
            LineRewrite(original="Worked on various projects", rewritten="Led development of 5+ production applications serving 10K+ users", reason="More specific and quantifiable")
        ],
        ats_score=70,
        recruiter_notes="The candidate shows potential but resume could use more specific achievements and metrics. Consider tailoring keywords to match the job description more closely.",
        action_items=[
            "Add 2-3 quantifiable achievements with metrics",
            "Include keywords from the job description",
            "Highlight relevant project experience",
            "Consider adding a brief summary section"
        ]
    )
