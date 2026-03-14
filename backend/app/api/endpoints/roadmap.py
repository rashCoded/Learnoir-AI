from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.services.gemini_service import GeminiService
from app.database import get_db
from app.models.database import User, Roadmap, RoadmapItem

router = APIRouter()
gemini_service = GeminiService()

class RoadmapRequest(BaseModel):
    target_role: str
    current_skills: List[str]
    skill_gaps: List[str]
    experience: Optional[List[str]] = []
    time_commitment: Optional[str] = "2 hours/day"
    duration_weeks: Optional[int] = 8
    user_email: str  # Email from NextAuth session

class UpdateProgressRequest(BaseModel):
    user_email: str
    week_idx: int
    task_name: str
    status: bool

class GetRoadmapRequest(BaseModel):
    user_email: str

@router.post("/generate")
async def generate_roadmap(request: RoadmapRequest, db: Session = Depends(get_db)):
    """Generate a roadmap and save to database"""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == request.user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Build learner profile
        learner_profile = {
            "target_role": request.target_role,
            "current_skills": request.current_skills,
            "missing_skills": request.skill_gaps,
            "experience": request.experience,
            "time_commitment": request.time_commitment
        }
        
        # Generate roadmap using AI
        roadmap_data = gemini_service.generate_roadmap(
            learner_profile=learner_profile,
            duration_weeks=request.duration_weeks or 8
        )
        
        # Deactivate old roadmaps for this user
        db.query(Roadmap).filter(
            Roadmap.user_id == user.id,
            Roadmap.is_active == True
        ).update({"is_active": False})
        
        # Create new roadmap in database
        new_roadmap = Roadmap(
            user_id=user.id,
            role=request.target_role,
            duration_weeks=len(roadmap_data.get("items", []))
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)
        
        # Add roadmap items to database
        for item_data in roadmap_data.get("items", []):
            roadmap_item = RoadmapItem(
                roadmap_id=new_roadmap.id,
                week_number=item_data.get("week", 1),
                title=item_data.get("title", "Week"),
                tasks=item_data.get("tasks", []),
                project=item_data.get("project", ""),
                resources=item_data.get("resources", []),
                completed_tasks=[]
            )
            db.add(roadmap_item)
        
        db.commit()
        print(f"✅ Saved roadmap {new_roadmap.id} for user {user.email}")
        
        # Return the saved roadmap
        return format_roadmap_response(new_roadmap, db)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/active")
async def get_active_roadmap(request: GetRoadmapRequest, db: Session = Depends(get_db)):
    """Get user's active roadmap from database"""
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        return None
    
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user.id,
        Roadmap.is_active == True
    ).first()
    
    if not roadmap:
        return None
    
    return format_roadmap_response(roadmap, db)

@router.get("/active/{user_email}")
async def get_active_roadmap_get(user_email: str, db: Session = Depends(get_db)):
    """Get active roadmap by email (GET version)"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return None
    
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user.id,
        Roadmap.is_active == True
    ).first()
    
    if not roadmap:
        return None
    
    return format_roadmap_response(roadmap, db)

@router.post("/progress")
async def update_progress(request: UpdateProgressRequest, db: Session = Depends(get_db)):
    """Update task completion status in database"""
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find active roadmap
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user.id,
        Roadmap.is_active == True
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap found")
    
    # Find the roadmap item by week index
    items = db.query(RoadmapItem).filter(
        RoadmapItem.roadmap_id == roadmap.id
    ).order_by(RoadmapItem.week_number).all()
    
    if request.week_idx >= len(items):
        raise HTTPException(status_code=404, detail="Week not found")
    
    item = items[request.week_idx]
    
    # Update completed tasks
    completed_tasks = item.completed_tasks or []
    
    if request.status and request.task_name not in completed_tasks:
        completed_tasks.append(request.task_name)
    elif not request.status and request.task_name in completed_tasks:
        completed_tasks.remove(request.task_name)
    
    item.completed_tasks = completed_tasks
    db.commit()
    
    print(f"✅ Updated progress for user {user.email}, week {request.week_idx}, task: {request.task_name}")
    
    return {"success": True, "completed_tasks": completed_tasks}

def format_roadmap_response(roadmap: Roadmap, db: Session):
    """Format roadmap for API response"""
    items = db.query(RoadmapItem).filter(
        RoadmapItem.roadmap_id == roadmap.id
    ).order_by(RoadmapItem.week_number).all()
    
    # Calculate progress
    total_tasks = sum(len(item.tasks or []) for item in items)
    completed_tasks = sum(len(item.completed_tasks or []) for item in items)
    progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    
    return {
        "id": roadmap.id,
        "role": roadmap.role,
        "duration_weeks": roadmap.duration_weeks,
        "progress": progress,
        "items": [
            {
                "id": item.id,
                "week": item.week_number,
                "title": item.title,
                "tasks": item.tasks or [],
                "project": item.project or "",
                "resources": item.resources or [],
                "tasks_status": {task: task in (item.completed_tasks or []) for task in (item.tasks or [])}
            } for item in items
        ]
    }

@router.get("/{user_id}")
async def get_roadmap_legacy(user_id: str):
    """Legacy endpoint"""
    return {"message": "Use /active/{user_email} instead"}
