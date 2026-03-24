from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.database import get_db
from app.models.database import User
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

# Request/Response Models
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    graduation_year: Optional[int] = None
    user_status: Optional[str] = None  # "student", "employee", "job_seeker", "upskilling"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    graduation_year: Optional[int] = None
    user_status: Optional[str] = None
    onboarding_complete: bool = False
    goal: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    skills: Optional[List[str]] = None
    current_streak: int = 0
    subscription_plan: str = "free"  # "free" or "premium"
    
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        age=req.age,
        graduation_year=req.graduation_year,
        user_status=req.user_status
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate JWT token (sub must be a string)
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login existing user"""
    # Find user by email
    user = db.query(User).filter(User.email == req.email).first()
    
    # Verify credentials
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT token (sub must be a string)
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return UserResponse.from_orm(current_user)

@router.post("/logout")
def logout():
    """Logout (client-side token removal)"""
    return {"message": "Logged out successfully"}


# Onboarding Models
class OnboardingRequest(BaseModel):
    goal: str  # job, internship, skill_upgrade
    target_role: str  # Backend Developer, ML Engineer, etc.
    experience_level: str  # beginner, intermediate, advanced
    skills: Optional[List[str]] = None


@router.put("/onboarding")
def complete_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete user onboarding with goal, role, and experience for current authenticated user"""
    user = db.query(User).filter(User.id == current_user.id).first()
    
    user.goal = req.goal
    user.target_role = req.target_role
    user.experience_level = req.experience_level
    user.skills = req.skills
    user.onboarding_complete = True
    
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "message": "Onboarding completed",
        "user": UserResponse.model_validate(user)
    }


# OAuth Sync Models
class OAuthSyncRequest(BaseModel):
    email: EmailStr
    name: str
    provider: str
    provider_id: str

class OAuthSyncResponse(BaseModel):
    user: UserResponse
    is_new: bool
    access_token: str
    token_type: str

@router.post("/oauth-sync", response_model=OAuthSyncResponse)
def oauth_sync(req: OAuthSyncRequest, db: Session = Depends(get_db)):
    """Create or sync a user from OAuth provider (Google)"""
    import secrets
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    
    if existing_user:
        # User exists, keep profile in sync and auto-verify OAuth email
        needs_update = False
        if existing_user.name != req.name:
            existing_user.name = req.name
            needs_update = True
        if not existing_user.email_verified:
            existing_user.email_verified = True
            needs_update = True

        if needs_update:
            db.commit()
            db.refresh(existing_user)
        
        access_token = create_access_token(data={"sub": str(existing_user.id)})
        return OAuthSyncResponse(
            user=UserResponse.model_validate(existing_user),
            is_new=False,
            access_token=access_token,
            token_type="bearer"
        )
    
    # Create new user with OAuth - use random password hash since they auth via OAuth
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(secrets.token_urlsafe(32)),  # Random password for OAuth users
        email_verified=True,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return OAuthSyncResponse(
        user=UserResponse.model_validate(new_user),
        is_new=True,
        access_token=access_token,
        token_type="bearer"
    )


# ============= OTP & Password Reset Endpoints =============

from datetime import datetime
from app.services.email_service import email_service


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Send OTP to email for verification (registration or resend)"""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    if user.email_verified:
        return {"message": "Email already verified", "verified": True}
    
    # Generate and save OTP
    otp = email_service.generate_otp()
    user.otp_code = otp
    user.otp_expires = email_service.get_otp_expiry(10)  # 10 minutes
    db.commit()
    
    # Send email
    email_service.send_registration_otp(user.email, otp, user.name)
    
    return {"message": "OTP sent to your email", "sent": True}


@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and mark email as verified"""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.email_verified:
        return {"message": "Email already verified", "verified": True}
    
    # Check OTP
    if not user.otp_code or user.otp_code != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check expiry
    if user.otp_expires and datetime.utcnow() > user.otp_expires:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    
    # Mark as verified
    user.email_verified = True
    user.otp_code = None
    user.otp_expires = None
    db.commit()
    
    return {"message": "Email verified successfully", "verified": True}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send OTP for password reset"""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If this email exists, an OTP has been sent", "sent": True}
    
    # Generate and save reset OTP
    otp = email_service.generate_otp()
    user.reset_otp = otp
    user.reset_otp_expires = email_service.get_otp_expiry(10)  # 10 minutes
    db.commit()
    
    # Send email
    email_service.send_password_reset_otp(user.email, otp)
    
    return {"message": "If this email exists, an OTP has been sent", "sent": True}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using OTP"""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check OTP
    if not user.reset_otp or user.reset_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check expiry
    if user.reset_otp_expires and datetime.utcnow() > user.reset_otp_expires:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    
    # Validate password
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update password
    user.password_hash = hash_password(req.new_password)
    user.reset_otp = None
    user.reset_otp_expires = None
    db.commit()
    
    return {"message": "Password reset successfully", "success": True}
