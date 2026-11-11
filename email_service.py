import logging
from typing import Optional

logger = logging.getLogger("skillorbit.email")

class EmailService:
    async def send_password_reset_email(self, email: str, reset_token: str, reset_url: str):
        """
        Sends password reset link.
        In production, integrates with SendGrid/Resend/AWS SES.
        Logs to console and audit logger for testing.
        """
        link = f"{reset_url}?token={reset_token}&email={email}"
        print(f"\n==========================================")
        print(f" [EMAIL DISPATCH - PASSWORD RESET]")
        print(f" To: {email}")
        print(f" Reset Link: {link}")
        print(f"==========================================\n")
        logger.info(f"Password reset email triggered for {email}")
        return True

    async def send_notification_email(self, email: str, subject: str, body: str):
        print(f"\n[EMAIL NOTIFICATION] To: {email} | Subject: {subject}\n{body}\n")
        return True

email_service = EmailService()
