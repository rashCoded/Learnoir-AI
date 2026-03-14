"""
Premium Access Control Utilities
Provides decorators and utilities for enforcing premium subscription access
"""

from fastapi import Depends, HTTPException, status
from app.models.database import User
from app.utils.auth import get_current_user


def require_premium(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that enforces premium subscription.
    Use this to protect premium-only endpoints.
    
    Usage:
        @router.get("/premium-feature")
        def premium_feature(user: User = Depends(require_premium)):
            ...
    
    Raises:
        HTTPException 403: If user doesn't have premium subscription
    """
    if current_user.subscription_plan != "premium":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required. Upgrade to access this feature."
        )
    return current_user


def is_premium(user: User) -> bool:
    """
    Helper function to check if user has premium subscription.
    
    Args:
        user: User object
        
    Returns:
        True if user has premium subscription, False otherwise
    """
    return user.subscription_plan == "premium"
