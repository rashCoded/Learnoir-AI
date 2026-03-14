"""
Payment API Endpoints
Handles premium subscription payments via Razorpay
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.database import User, Payment
from app.utils.auth import get_current_user
from app.services.razorpay_service import razorpay_service


router = APIRouter()


# ============= Request/Response Models =============

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    key_id: str  # Razorpay key ID for frontend


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerifyResponse(BaseModel):
    success: bool
    plan: str
    message: str


class SubscriptionStatusResponse(BaseModel):
    subscription_plan: str
    subscription_started_at: Optional[datetime] = None
    is_premium: bool


class AdminUpgradeRequest(BaseModel):
    user_email: str
    admin_secret: str  # Simple admin authentication


# ============= Endpoints =============

@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Razorpay order for premium subscription.
    User must be authenticated.
    """
    # Check if already premium
    if current_user.subscription_plan == "premium":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a premium subscription"
        )
    
    # Check Razorpay configuration
    if not razorpay_service.client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured"
        )
    
    # Create Razorpay order
    receipt = f"user_{current_user.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    order = razorpay_service.create_order(receipt=receipt)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order"
        )
    
    # Save payment record
    payment = Payment(
        user_id=current_user.id,
        razorpay_order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        status="created"
    )
    db.add(payment)
    db.commit()
    
    return CreateOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=razorpay_service.key_id
    )


@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    request: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify Razorpay payment signature and activate premium subscription.
    This is called after successful payment on frontend.
    """
    # Find the payment record
    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == request.razorpay_order_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment order not found"
        )
    
    if payment.status == "paid":
        return PaymentVerifyResponse(
            success=True,
            plan="premium",
            message="Payment already verified"
        )
    
    # Verify signature
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=request.razorpay_order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_signature=request.razorpay_signature
    )
    
    if not is_valid:
        # Mark as failed
        payment.status = "failed"
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed - invalid signature"
        )
    
    # Update payment record
    payment.razorpay_payment_id = request.razorpay_payment_id
    payment.razorpay_signature = request.razorpay_signature
    payment.status = "paid"
    payment.paid_at = datetime.utcnow()
    
    # Activate premium subscription
    current_user.subscription_plan = "premium"
    current_user.subscription_started_at = datetime.utcnow()
    
    db.commit()
    
    print(f"✅ Premium activated for user: {current_user.email}")
    
    return PaymentVerifyResponse(
        success=True,
        plan="premium",
        message="Payment verified! Premium subscription activated."
    )


@router.get("/status", response_model=SubscriptionStatusResponse)
def get_subscription_status(current_user: User = Depends(get_current_user)):
    """
    Get current user's subscription status.
    """
    return SubscriptionStatusResponse(
        subscription_plan=current_user.subscription_plan or "free",
        subscription_started_at=current_user.subscription_started_at,
        is_premium=current_user.subscription_plan == "premium"
    )


@router.post("/admin-upgrade")
def admin_upgrade_user(
    request: AdminUpgradeRequest,
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to manually upgrade a user to premium.
    For demo/testing purposes.
    """
    import os
    
    # Simple admin secret check
    admin_secret = os.getenv("ADMIN_SECRET", "learnoir_admin_2025")
    if request.admin_secret != admin_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin credentials"
        )
    
    # Find user
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Upgrade to premium
    user.subscription_plan = "premium"
    user.subscription_started_at = datetime.utcnow()
    db.commit()
    
    print(f"✅ Admin upgraded user to premium: {user.email}")
    
    return {
        "success": True,
        "message": f"User {user.email} upgraded to premium",
        "subscription_plan": "premium"
    }
