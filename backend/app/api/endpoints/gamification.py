from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import random

from app.database import get_db
from app.models.database import User, Achievement, Roadmap, RoadmapItem, CodingSubmission

router = APIRouter()

# Daily learning tips pool
DAILY_TIPS = [
    {
        "tip": "💡 Spend 30 minutes on coding challenges today!",
        "category": "practice",
        "action": "Try LeetCode or HackerRank"
    },
    {
        "tip": "📚 Read one technical article related to your target role.",
        "category": "learning",
        "action": "Check Medium, Dev.to, or HashNode"
    },
    {
        "tip": "🎯 Review your roadmap and mark completed tasks.",
        "category": "progress",
        "action": "Update your progress in the dashboard"
    },
    {
        "tip": "🤝 Connect with someone in your target industry on LinkedIn.",
        "category": "networking",
        "action": "Send a personalized connection request"
    },
    {
        "tip": "🔨 Build a small project to practice new skills.",
        "category": "project",
        "action": "Start with a simple CRUD app or API"
    },
    {
        "tip": "🎓 Watch a tutorial on a skill you're learning.",
        "category": "learning",
        "action": "YouTube, Udemy, or freeCodeCamp"
    },
    {
        "tip": "✍️ Write about what you learned this week.",
        "category": "reflection",
        "action": "Start a dev blog or LinkedIn post"
    },
    {
        "tip": "🧠 Take a break! Rest is part of learning.",
        "category": "wellness",
        "action": "Go for a walk or do some stretching"
    }
]

# Badge definitions
BADGE_DEFINITIONS = {
    "first_roadmap": {"name": "🚀 First Steps", "type": "milestone", "description": "Generated your first learning roadmap"},
    "week_1_complete": {"name": "📅 Week 1 Champion", "type": "progress", "description": "Completed Week 1 of your roadmap"},
    "halfway_there": {"name": "⚡ Halfway Hero", "type": "progress", "description": "Completed 50% of your roadmap"},
    "roadmap_complete": {"name": "🏆 Roadmap Master", "type": "completion", "description": "Completed your entire roadmap"},
    "first_code": {"name": "💻 First Code", "type": "milestone", "description": "Submitted your first coding solution"},
    "problem_solver": {"name": "🧩 Problem Solver", "type": "milestone", "description": "Solved 5 coding problems"},
    "code_warrior": {"name": "⚔️ Code Warrior", "type": "milestone", "description": "Solved 10 coding problems"},
    "streak_3": {"name": "🔥 3-Day Streak", "type": "streak", "description": "Maintained a 3-day learning streak"},
    "streak_7": {"name": "🔥 Week Warrior", "type": "streak", "description": "Maintained a 7-day learning streak"}
}


@router.get("/daily")
async def get_daily_tip():
    """Get a random daily learning tip - no auth required"""
    tip = random.choice(DAILY_TIPS)
    return tip


@router.get("/achievements/{user_email}")
async def get_user_achievements(user_email: str, db: Session = Depends(get_db)):
    """Get user's earned achievements from database"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return {"achievements": [], "total_count": 0}
    
    achievements = db.query(Achievement).filter(Achievement.user_id == user.id).all()
    
    return {
        "achievements": [
            {
                "id": a.id,
                "badge_name": a.badge_name,
                "badge_type": a.badge_type,
                "description": a.description,
                "earned_at": a.earned_at.isoformat() if a.earned_at else None
            } for a in achievements
        ],
        "total_count": len(achievements)
    }


@router.post("/achievements/check/{user_email}")
async def check_and_award_achievements(user_email: str, db: Session = Depends(get_db)):
    """Check user progress and award any new achievements"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return {"new_achievements": [], "message": "User not found"}
    
    new_achievements = []
    existing_badges = {a.badge_name for a in db.query(Achievement).filter(Achievement.user_id == user.id).all()}
    
    # Check for roadmap-based achievements
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user.id).all()
    
    if roadmaps and BADGE_DEFINITIONS["first_roadmap"]["name"] not in existing_badges:
        new_achievements.append(_award_badge(db, user.id, "first_roadmap"))
    
    # Check active roadmap progress
    active_roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user.id,
        Roadmap.is_active == True
    ).first()
    
    if active_roadmap:
        items = db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == active_roadmap.id).all()
        total_tasks = sum(len(item.tasks or []) for item in items)
        completed_tasks = sum(len(item.completed_tasks or []) for item in items)
        
        if total_tasks > 0:
            progress = (completed_tasks / total_tasks) * 100
            
            # Week 1 complete (check if first week has all tasks done)
            if items and len(items[0].completed_tasks or []) == len(items[0].tasks or []):
                if BADGE_DEFINITIONS["week_1_complete"]["name"] not in existing_badges:
                    new_achievements.append(_award_badge(db, user.id, "week_1_complete"))
            
            # Halfway there
            if progress >= 50 and BADGE_DEFINITIONS["halfway_there"]["name"] not in existing_badges:
                new_achievements.append(_award_badge(db, user.id, "halfway_there"))
            
            # Roadmap complete
            if progress >= 100 and BADGE_DEFINITIONS["roadmap_complete"]["name"] not in existing_badges:
                new_achievements.append(_award_badge(db, user.id, "roadmap_complete"))
    
    # Check coding achievements
    coding_submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == user.id,
        CodingSubmission.is_correct == True
    ).count()
    
    if coding_submissions >= 1 and BADGE_DEFINITIONS["first_code"]["name"] not in existing_badges:
        new_achievements.append(_award_badge(db, user.id, "first_code"))
    
    if coding_submissions >= 5 and BADGE_DEFINITIONS["problem_solver"]["name"] not in existing_badges:
        new_achievements.append(_award_badge(db, user.id, "problem_solver"))
    
    if coding_submissions >= 10 and BADGE_DEFINITIONS["code_warrior"]["name"] not in existing_badges:
        new_achievements.append(_award_badge(db, user.id, "code_warrior"))
    
    db.commit()
    
    return {
        "new_achievements": new_achievements,
        "message": f"Awarded {len(new_achievements)} new achievement(s)!" if new_achievements else "No new achievements earned."
    }


def _award_badge(db: Session, user_id: int, badge_key: str) -> dict:
    """Helper to award a badge to user"""
    badge_def = BADGE_DEFINITIONS.get(badge_key, {})
    
    new_achievement = Achievement(
        user_id=user_id,
        badge_name=badge_def.get("name", "Unknown Badge"),
        badge_type=badge_def.get("type", "milestone"),
        description=badge_def.get("description", "")
    )
    db.add(new_achievement)
    
    return {
        "badge_name": new_achievement.badge_name,
        "badge_type": new_achievement.badge_type,
        "description": new_achievement.description
    }


@router.get("/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    """Get achievements leaderboard (top users by badge count)"""
    # Get users with most achievements
    users = db.query(User).all()
    
    leaderboard = []
    for user in users:
        badge_count = db.query(Achievement).filter(Achievement.user_id == user.id).count()
        if badge_count > 0:
            leaderboard.append({
                "name": user.name,
                "badges": badge_count
            })
    
    # Sort by badge count descending
    leaderboard.sort(key=lambda x: x["badges"], reverse=True)
    
    return {"leaderboard": leaderboard[:10]}  # Top 10

