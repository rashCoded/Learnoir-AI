"""
Email Service for sending OTP emails via Gmail SMTP
"""
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os


class EmailService:
    def __init__(self):
        # Gmail SMTP configuration - set these in environment variables
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv("GMAIL_EMAIL", "")
        self.sender_password = os.getenv("GMAIL_APP_PASSWORD", "")  # Use App Password, not regular password
        self.enabled = bool(self.sender_email and self.sender_password)
        
        if not self.enabled:
            print("⚠️ Email service disabled - GMAIL_EMAIL and GMAIL_APP_PASSWORD not set")
            print("📧 OTPs will be printed to console for testing")
    
    def generate_otp(self, length: int = 6) -> str:
        """Generate a random numeric OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def get_otp_expiry(self, minutes: int = 10) -> datetime:
        """Get OTP expiry time (default 10 minutes from now)"""
        return datetime.utcnow() + timedelta(minutes=minutes)
    
    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """Send email via Gmail SMTP"""
        if not self.enabled:
            print(f"📧 [MOCK EMAIL] To: {to_email}")
            print(f"   Subject: {subject}")
            print(f"   Body: {html_body}")
            return True
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Learnoir AI <{self.sender_email}>"
            msg["To"] = to_email
            
            html_part = MIMEText(html_body, "html")
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, msg.as_string())
            
            print(f"✅ Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
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
        return self.send_email(to_email, subject, html_body)
    
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
        return self.send_email(to_email, subject, html_body)


# Global instance
email_service = EmailService()
