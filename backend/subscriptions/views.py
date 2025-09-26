from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import NewsletterSubscriber
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging
from datetime import datetime, timedelta
from rest_framework import status, generics
from rest_framework.views import APIView
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'subscribed_at', 'unsubscribed_at', 'source']
        read_only_fields = ['is_active', 'subscribed_at', 'unsubscribed_at']

class NewsletterSerializer(serializers.Serializer):
    subject = serializers.CharField(required=True)
    content = serializers.CharField(required=True)
    recipients = serializers.CharField(required=False, default='all')

    
class SubscribeToNewsletter(APIView):
  
    def post(self, request):
        serializer = NewsletterSubscriberSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if already subscribed
            subscriber, created = NewsletterSubscriber.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': serializer.validated_data.get('first_name', ''),
                    'last_name': serializer.validated_data.get('last_name', ''),
                    'source': request.data.get('source', 'website')
                }
            )
            
            if not created and subscriber.is_active:
                return Response(
                    {'message': 'You are already subscribed to our newsletter.'},
                    status=status.HTTP_200_OK
                )
            
            # If existing but inactive, reactivate
            if not created and not subscriber.is_active:
                subscriber.is_active = True
                subscriber.unsubscribed_at = None
                subscriber.save()
            
            # Send welcome email
            self.send_welcome_email(subscriber)
            
            return Response(
                {'message': 'Thank you for subscribing to our newsletter!'},
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_welcome_email(self, subscriber):
        subject = "Welcome to ACNA Newsletter"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [subscriber.email]

        context = {
            'subscriber': subscriber,
            'company_name': settings.COMPANY_NAME,
            'unsubscribe_url': f"{settings.FRONTEND_URL}/unsubscribe?email={subscriber.email}"
        }

        try:
            html_content = render_to_string("subscriptions/emails/welcome.html", context)
            text_content = f"""Dear {subscriber.first_name or 'Subscriber'},

Thank you for subscribing to the ACNA newsletter. You'll now receive updates on the latest in child neurology, healthcare equity, research breakthroughs, and advocacy efforts across Africa.

If you wish to unsubscribe, visit: {context['unsubscribe_url']}

Best regards,
The ACNA Team
"""

            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        except Exception as e:
            logger.error(f"Failed to send welcome email to {subscriber.email}: {str(e)}")


class UnsubscribeFromNewsletter(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subscriber = NewsletterSubscriber.objects.get(email=email)
            subscriber.unsubscribe()
            
            # Send confirmation email
            self.send_unsubscribe_confirmation(subscriber)
            
            return Response(
                {'message': 'You have been unsubscribed from our newsletter.'},
                status=status.HTTP_200_OK
            )
        except NewsletterSubscriber.DoesNotExist:
            return Response(
                {'error': 'No subscription found with this email.'},
                status=status.HTTP_404_NOT_FOUND
            )

    def send_unsubscribe_confirmation(self, subscriber):
        subject = "You've been unsubscribed from ACNA Newsletter"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [subscriber.email]

        context = {
            'subscriber': subscriber,
            'company_name': settings.COMPANY_NAME,
            'resubscribe_url': f"{settings.FRONTEND_URL}/newsletter/subscribe"
        }

        try:
            html_content = render_to_string("subscriptions/emails/unsubscribe_confirmation.html", context)
            text_content = f"""Dear {subscriber.first_name or 'Subscriber'},

You have been successfully unsubscribed from the ACNA newsletter. You will no longer receive updates from us.

If this was a mistake, you can resubscribe at: {context['resubscribe_url']}

Best regards,
The ACNA Team
"""

            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        except Exception as e:
            logger.error(f"Failed to send unsubscribe confirmation to {subscriber.email}: {str(e)}")


class SendNewsletter(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewsletterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        subject = validated_data['subject']
        content = validated_data['content']
        recipients = validated_data.get('recipients', 'all')

        # Filter subscribers based on recipients
        if recipients == 'new':
            # Get subscribers from the last 30 days
            from datetime import datetime, timedelta
            thirty_days_ago = datetime.now() - timedelta(days=30)
            active_subscribers = NewsletterSubscriber.objects.filter(
                is_active=True,
                subscribed_at__gte=thirty_days_ago
            )
        else:
            # Default to all active subscribers
            active_subscribers = NewsletterSubscriber.objects.filter(is_active=True)

        sent_count = 0
        for subscriber in active_subscribers:
            try:
                self.send_newsletter_email(subscriber, subject, content)
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send newsletter to {subscriber.email}: {str(e)}")

        return Response(
            {'message': f'Newsletter sent to {sent_count} subscribers.'},
            status=status.HTTP_200_OK
        )

    def send_newsletter_email(self, subscriber, subject, content):
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [subscriber.email]

        context = {
            'subscriber': subscriber,
            'company_name': settings.COMPANY_NAME,
            'content': content,
            'unsubscribe_url': f"{settings.FRONTEND_URL}/unsubscribe?email={subscriber.email}"
        }

        html_content = render_to_string("subscriptions/emails/newsletter.html", context)
        text_content = f"""Dear {subscriber.first_name or 'Subscriber'},

{content}

To unsubscribe from our newsletter, visit: {context['unsubscribe_url']}

Best regards,
The ACNA Team
"""

        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

class SubscriberListView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        subscribers = NewsletterSubscriber.objects.all().order_by('-subscribed_at')
        serializer = NewsletterSubscriberSerializer(subscribers, many=True)
        return Response(serializer.data)

class ContactMessageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save()
            
            # Send confirmation email to sender
            self.send_confirmation_email(message)
            
            # Send notification to admin
            self.send_admin_notification(message)
            
            return Response(
                {'message': 'Your message has been received. We will get back to you soon.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_confirmation_email(self, message):
        subject = f"Thank you for contacting {settings.COMPANY_NAME}"
        message_body = f"""Dear {message.first_name},
        
Thank you for reaching out to us. We have received your message regarding:
"{message.subject}"

Our team will review your inquiry and respond as soon as possible.

Best regards,
The {settings.COMPANY_NAME} Team
"""
        try:
            send_mail(
                subject,
                message_body,
                settings.DEFAULT_FROM_EMAIL,
                [message.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {str(e)}")

    def send_admin_notification(self, message):
        subject = f"New Contact Message: {message.subject}"
        message_body = f"""New message received from {message.first_name} {message.last_name}:
        
Subject: {message.subject}
Email: {message.email}
Message: {message.message}

Please respond via the admin dashboard.
"""
        try:
            send_mail(
                subject,
                message_body,
                settings.DEFAULT_FROM_EMAIL,
                [settings.ADMIN_EMAIL],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send admin notification: {str(e)}")

class ContactMessageListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all().order_by('-created_at')

class ContactMessageDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()

    def perform_update(self, serializer):
        instance = serializer.save()
        
        # If marking as read for the first time
        if 'is_read' in serializer.validated_data and serializer.validated_data['is_read'] and not instance.is_read:
            logger.info(f"Message {instance.id} marked as read")
        
        # If adding response notes
        if 'response_notes' in serializer.validated_data and serializer.validated_data['response_notes']:
            instance.responded = True
            instance.save()

class MessageResponseView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, message_id):
        try:
            message = ContactMessage.objects.get(id=message_id)
        except ContactMessage.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        response_text = request.data.get('response')
        if not response_text:
            return Response(
                {'error': 'Response text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Send the response email
            self.send_response_email(message, response_text, request.user)
            
            # Update the message as responded
            message.responded = True
            message.response_notes = response_text
            message.save()

            return Response(
                {'message': 'Response sent successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to send response: {str(e)}")
            return Response(
                {'error': 'Failed to send response email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def send_response_email(self, message, response_text, admin_user):
        subject = f"Re: {message.subject}"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [message.email]
        
        # Safe admin name handling
        admin_name = "ACNA Admin"
        if admin_user.first_name or admin_user.last_name:
            admin_name = f"{admin_user.first_name or ''} {admin_user.last_name or ''}".strip()

        context = {
            'original_message': message.message,
            'response_text': response_text,
            'admin_name': admin_name,
            'company_name': settings.COMPANY_NAME,
            'contact_email': settings.CONTACT_EMAIL
        }

        try:
            # Text version
            text_content = f"""Dear {message.first_name},

Thank you for contacting {settings.COMPANY_NAME}. Here is our response to your message:

Your original message:
{message.message}

Our response:
{response_text}

Best regards,
{admin_name}
{settings.COMPANY_NAME}
"""

            # HTML version (template)
            html_content = render_to_string("subscriptions/emails/response.html", context)

            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        except Exception as e:
            logger.error(f"Failed to send response email to {message.email}: {str(e)}")
            raise