# payments/views.py
import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from users.models import User
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntent(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logger.info(f"Payment request from user: {request.user}")
        logger.info(f"Auth header: {request.headers.get('Authorization')}")
        try:
            user = request.user
            
            # Validate user has selected a membership class
            if not user.membership_class:
                return Response(
                    {'error': 'Please select a membership class before payment'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get amount and currency based on membership class
            amount = self.get_membership_amount(user.membership_class)
            currency = 'usd'  # Default currency
            
            # Create PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata={
                    'membership_type': user.membership_class,
                    'payment_frequency': 'annual',  # Default to annual
                    'user_id': user.id
                },
                receipt_email=user.email
            )
            
            # Create payment record
            Payment.objects.create(
                user=user,
                amount=amount/100,  # Convert to dollars
                currency=currency,
                stripe_payment_intent_id=intent.id,
                membership_type=user.membership_class,
                payment_frequency='annual',
                status='pending'
            )
            
            return Response({
                'clientSecret': intent.client_secret,
                'membership_type': user.membership_class,
                'amount': amount,
                'currency': currency
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_membership_amount(self, membership_class):
        """Get amount in cents based on membership class"""
        membership_pricing = {
            'full_professional': 8000,      # $80.00
            'associate': 4000,              # $40.00
            'student': 1500,                # $15.00
            'institutional': 30000,         # $300.00
            'affiliate': 5000,              # $50.00
            'corporate': 50000,             # $500.00
            'lifetime': 50000,              # $500.00
            'honorary': 0                   # $0.00
        }
        return membership_pricing.get(membership_class, 0)

class PaymentWebhook(APIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.constructEvent(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response(status=400)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=400)

        # Handle payment success
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            self.handle_payment_succeeded(payment_intent)
        
        return Response(status=200)

    def handle_payment_succeeded(self, payment_intent):
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent.id
            )
            payment.status = 'succeeded'
            payment.save()
            
            # Activate user membership
            user = payment.user
            user.membership_class = payment_intent.metadata['membership_type']
            user.is_active_member = True
            user.membership_valid_until = timezone.now().date() + timedelta(days=365)
            user.save()
            
        except Payment.DoesNotExist:
            pass

    def handle_payment_failed(self, payment_intent):
        try:
            payment = Payment.objects.get(
                stripe_payment_intent_id=payment_intent.id
            )
            payment.status = 'failed'
            payment.save()
        except Payment.DoesNotExist:
            pass