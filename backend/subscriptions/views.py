from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import NewsletterSubscriber
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging
from datetime import datetime, timedelta

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