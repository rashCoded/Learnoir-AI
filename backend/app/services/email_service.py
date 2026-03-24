"""
Email Service for sending OTP emails via Resend
"""
import random
import string
from datetime import datetime, timedelta
import os
import importlib
from typing import Any


class EmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY", "")
        self.from_email = "onboarding@resend.dev"
        self.resend: Any = None

        if self.api_key:
            try:
                self.resend = importlib.import_module("resend")
                self.resend.api_key = self.api_key
                self.enabled = True
            except Exception as e:
                self.enabled = False
                print(f"⚠️ Email service disabled - failed to load resend: {e}")
        else:
            self.enabled = False
        
        if not self.enabled:
            print("⚠️ Email service disabled - RESEND_API_KEY not set")
            print("📧 OTPs will be printed to console for testing")
    
    def generate_otp(self, length: int = 6) -> str:
        """Generate a random numeric OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def get_otp_expiry(self, minutes: int = 10) -> datetime:
        """Get OTP expiry time (default 10 minutes from now)"""
        return datetime.utcnow() + timedelta(minutes=minutes)
    
    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """Send email via Resend"""
        if not self.enabled:
            return False
        
        try:
            result = self.resend.Emails.send({
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            })

            # Handle Resend response pattern: { data, error }
            if isinstance(result, dict):
                data = result.get("data")
                error = result.get("error")
            elif isinstance(result, tuple) and len(result) == 2:
                data, error = result
            else:
                data = getattr(result, "data", None)
                error = getattr(result, "error", None)

            if error:
                print(f"❌ Failed to send email via Resend: {error}")
                return False

            if data is None:
                print("❌ Failed to send email via Resend: empty response data")
                return False

            print(f"✅ Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Failed to send email via Resend: {e}")
            return False
    
    def send_registration_otp(self, to_email: str, otp: str, name: str = "there") -> bool:
        """Send OTP for registration verification"""
        subject = "🔐 Verify Your Learnoir AI Account"
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: white; margin: 0;">Learnoir AI</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333;">Hi {name}! 👋</h2>
                <p style="color: #666; font-size: 16px;">Thank you for signing up. Use the OTP below to verify your email:</p>
                <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; text-align: center; letter-spacing: 8px; margin: 20px 0;">
                    {otp}
                </div>
                <p style="color: #999; font-size: 14px;">This OTP expires in 10 minutes. Don't share it with anyone.</p>
            </div>
        </div>
        """
        sent = self.send_email(to_email, subject, html_body)
        if not sent:
            email = to_email
            otp_code = otp
            print(f"OTP for {email}: {otp_code}")
        return sent
    
    def send_password_reset_otp(self, to_email: str, otp: str) -> bool:
        """Send OTP for password reset"""
        subject = "🔑 Reset Your Learnoir AI Password"
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px;">You requested to reset your password. Use this OTP:</p>
                <div style="background: #f5576c; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; text-align: center; letter-spacing: 8px; margin: 20px 0;">
                    {otp}
                </div>
                <p style="color: #999; font-size: 14px;">This OTP expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
        </div>
        """
        sent = self.send_email(to_email, subject, html_body)
        if not sent:
            email = to_email
            otp_code = otp
            print(f"OTP for {email}: {otp_code}")
        return sent


# Global instance
email_service = EmailService()
