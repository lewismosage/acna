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

class CreateCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            
            if not user.membership_class:
                return Response(
                    {'error': 'Please select a membership class before payment'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            price_ids = {
                'full_professional': 'price_1RtndZCWhrsZxJu1lm2F17Qz',
                'associate': 'price_1RtneVCWhrsZxJu1qvskBksP',
                'student': 'price_1RtnfVCWhrsZxJu10IQXwPkF',
                'institutional': 'price_1RtngPCWhrsZxJu1OtFAIKps',
                'affiliate': 'price_1RtnhNCWhrsZxJu1r9cTZBxZ',
                'honorary': 'price_1RtniqCWhrsZxJu1ul8eyDEY',
                'corporate': 'price_1RtnkPCWhrsZxJu1EC7h1LlJ',
                'lifetime': 'price_1RtnlYCWhrsZxJu1TAoYgnOY'
            }
            
            price_id = price_ids.get(user.membership_class)
            if not price_id:
                return Response(
                    {'error': 'Invalid membership type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='payment',
                metadata={
                    'membership_type': user.membership_class,
                    'user_id': user.id
                },
                customer_email=user.email,
                success_url=f"{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/payment-canceled",
            )
            
            # Create payment record with all required fields
            Payment.objects.create(
                user=user,
                amount=self.get_membership_amount(user.membership_class)/100,
                currency='usd',
                stripe_checkout_session_id=session.id,
                membership_type=user.membership_class,
                payment_frequency='annual',
                status='pending'
            )
            
            return Response({'sessionId': session.id})
            
        except Exception as e:
            logger.error(f"Checkout error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_membership_amount(self, membership_class):
        """Get amount in cents based on membership class"""
        membership_pricing = {
            'full_professional': 8000,
            'associate': 4000,
            'student': 1500,
            'institutional': 30000,
            'affiliate': 5000,
            'corporate': 50000,
            'lifetime': 50000,
            'honorary': 0
        }
        return membership_pricing.get(membership_class, 0)

class PaymentWebhook(APIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            logger.info(f"Received Stripe event: {event['type']}")
            
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                self.handle_checkout_session_completed(session)
                
            return Response({'status': 'success'}, status=200)
            
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            return Response({'error': str(e)}, status=400)
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            logger.error(f"Webhook error: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=500)

    def handle_checkout_session_completed(self, session):
        try:
            payment = Payment.objects.get(
                stripe_checkout_session_id=session.id
            )
            payment.status = 'succeeded'
            payment.save()
            
            user = payment.user
            user.is_active_member = True
            user.membership_valid_until = timezone.now().date() + timedelta(days=365)
            user.save()
            
            logger.info(f"Payment succeeded for user {user.id}")
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for session {session.id}")
        except Exception as e:
            logger.error(f"Error handling payment: {str(e)}", exc_info=True)
         