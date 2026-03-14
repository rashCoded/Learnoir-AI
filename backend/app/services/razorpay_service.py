"""
Razorpay Payment Service
Handles payment order creation and verification
"""

import razorpay
import hmac
import hashlib
import os
from typing import Optional, Dict, Any


class RazorpayService:
    """Service class for Razorpay payment integration"""
    
    # Premium plan pricing (in paise - 49900 = ₹499)
    PREMIUM_AMOUNT = 49900
    CURRENCY = "INR"
    
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        
        if self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
            print(f"✅ Razorpay initialized (Key: {self.key_id[:15]}...)")
        else:
            self.client = None
            print("⚠️ Razorpay not configured - missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET")
    
    def create_order(self, amount: int = None, currency: str = None, receipt: str = None) -> Optional[Dict[str, Any]]:
        """
        Create a Razorpay order for payment
        
        Args:
            amount: Amount in paise (default: PREMIUM_AMOUNT)
            currency: Currency code (default: INR)
            receipt: Unique receipt ID
            
        Returns:
            Order details dict or None if failed
        """
        if not self.client:
            print("❌ Razorpay client not initialized")
            return None
        
        try:
            order_data = {
                "amount": amount or self.PREMIUM_AMOUNT,
                "currency": currency or self.CURRENCY,
                "receipt": receipt or f"receipt_{os.urandom(8).hex()}",
                "notes": {
                    "plan": "premium",
                    "duration": "1_year"
                }
            }
            
            order = self.client.order.create(data=order_data)
            print(f"✅ Razorpay order created: {order.get('id')}")
            return order
            
        except Exception as e:
            print(f"❌ Error creating Razorpay order: {e}")
            return None
    
    def verify_payment_signature(
        self, 
        razorpay_order_id: str, 
        razorpay_payment_id: str, 
        razorpay_signature: str
    ) -> bool:
        """
        Verify the Razorpay payment signature to ensure payment authenticity
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            True if signature is valid, False otherwise
        """
        if not self.key_secret:
            print("❌ Cannot verify signature - missing key secret")
            return False
        
        try:
            # Generate expected signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                self.key_secret.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            is_valid = hmac.compare_digest(expected_signature, razorpay_signature)
            
            if is_valid:
                print(f"✅ Payment signature verified: {razorpay_payment_id}")
            else:
                print(f"❌ Invalid payment signature for: {razorpay_payment_id}")
            
            return is_valid
            
        except Exception as e:
            print(f"❌ Error verifying signature: {e}")
            return False
    
    def get_payment_details(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Payment details dict or None
        """
        if not self.client:
            return None
        
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            print(f"❌ Error fetching payment: {e}")
            return None


# Singleton instance
razorpay_service = RazorpayService()
