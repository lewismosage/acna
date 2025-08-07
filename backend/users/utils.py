from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_verification_email(recipient_email, verification_code):
    subject = "Verify Your ACNA Account"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [recipient_email]

    try:
        html_content = render_to_string("users/emails/verification_email.html", {
            "verification_code": verification_code,
            "company_name": settings.COMPANY_NAME
        })
        text_content = f"Your {settings.COMPANY_NAME} verification code is: {verification_code}"

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return True
    except Exception as e:
        logger.error(f"Error sending verification email to {recipient_email}: {str(e)}")
        return False