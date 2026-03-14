from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Enhanced Profile Fields
    age = Column(Integer, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    user_status = Column(String(50), nullable=True)  # student, employee, job_seeker, upskilling
    is_active = Column(Boolean, default=True)
    
    # Onboarding Fields
    onboarding_complete = Column(Boolean, default=False)
    goal = Column(String(50), nullable=True)  # job, internship, skill_upgrade
    target_role = Column(String(100), nullable=True)  # ML Engineer, Backend Developer, etc.
    experience_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    skills = Column(JSON, nullable=True)  # List of skills (from resume or manual)
    
    # Streak & Activity Tracking
    current_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    
    # Email Verification & OTP
    email_verified = Column(Boolean, default=False)
    otp_code = Column(String(6), nullable=True)
    otp_expires = Column(DateTime, nullable=True)
    reset_otp = Column(String(6), nullable=True)
    reset_otp_expires = Column(DateTime, nullable=True)
    
    # Subscription & Premium
    subscription_plan = Column(String(20), default="free")  # "free" or "premium"
    subscription_started_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    resume_data = relationship("ResumeData", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    coding_submissions = relationship("CodingSubmission", back_populates="user", cascade="all, delete-orphan")
    interview_attempts = relationship("InterviewAttempt", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="roadmaps")
    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"
    
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    tasks = Column(JSON, nullable=False)  # List of task strings
    project = Column(String(255))
    resources = Column(JSON)  # List of resource strings
    completed_tasks = Column(JSON, default=list)  # List of completed task strings
    
    # Relationships
    roadmap = relationship("Roadmap", back_populates="items")

class ResumeData(Base):
    __tablename__ = "resume_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skills = Column(JSON, nullable=False)  # List of skills
    experience = Column(JSON)  # List of experience items
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # PDF storage for AI analysis
    pdf_data = Column(LargeBinary, nullable=True)  # Actual PDF binary data
    pdf_filename = Column(String(255), nullable=True)  # Original filename
    
    # Relationships
    user = relationship("User", back_populates="resume_data")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_name = Column(String(100), nullable=False)  # "First Roadmap", "Week 1 Complete", etc.
    badge_type = Column(String(50), nullable=False)  # "milestone", "streak", "completion"
    description = Column(String(255))
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="achievements")


class CodingProblem(Base):
    """Stores AI-generated coding problems"""
    __tablename__ = "coding_problems"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(20), nullable=False)  # easy, medium, hard
    topic = Column(String(100), nullable=False)  # arrays, strings, dp, etc.
    description = Column(Text, nullable=False)
    examples = Column(JSON, nullable=False)  # List of {input, output, explanation}
    constraints = Column(JSON)  # List of constraint strings
    starter_code = Column(JSON)  # {python: "...", javascript: "..."}
    solution_hint = Column(Text)
    test_cases = Column(JSON)  # [{input: ..., expected: ...}]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    submissions = relationship("CodingSubmission", back_populates="problem", cascade="all, delete-orphan")


class CodingSubmission(Base):
    """Tracks user submissions for coding problems"""
    __tablename__ = "coding_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("coding_problems.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(30), nullable=False)  # python, javascript
    is_correct = Column(Boolean, default=False)
    execution_result = Column(JSON)  # {passed: int, failed: int, feedback: str}
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="coding_submissions")
    problem = relationship("CodingProblem", back_populates="submissions")


class InterviewAttempt(Base):
    """Tracks interview quiz attempts for performance tracking"""
    __tablename__ = "interview_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, default=0)
    score_percent = Column(Integer, default=0)
    attempted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="interview_attempts")


class Payment(Base):
    """Tracks payment transactions for premium subscriptions"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    razorpay_order_id = Column(String(100), nullable=False, index=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    amount = Column(Integer, nullable=False)  # Amount in paise (49900 = ₹499)
    currency = Column(String(10), default="INR")
    status = Column(String(20), default="created")  # created, paid, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
