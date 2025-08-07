# services/email_services.py

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

def send_verification_email(recipient_email, verification_code):
    subject = "Verify Your ACNA Account"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [recipient_email]

    html_content = render_to_string("emails/verification_email.html", {
        "verification_code": verification_code
    })
    text_content = f"Your ACNA verification code is: {verification_code}"

    msg = EmailMultiAlternatives(subject, text_content, from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
