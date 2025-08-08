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
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from django.http import HttpResponse
from datetime import datetime




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
                success_url=f"{settings.PAYMENT_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=settings.PAYMENT_CANCELED_URL,
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

class VerifyPayment(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Retrieve payment record
            payment = Payment.objects.get(
                stripe_checkout_session_id=session_id,
                user=request.user
            )
            
            # Retrieve Stripe session
            session = stripe.checkout.Session.retrieve(session_id)
            
            return Response({
                'status': 'success',
                'payment_status': payment.status,
                'membership_type': payment.membership_type,
                'amount': float(payment.amount),
                'invoice_number': session.invoice or session.payment_intent,
                'valid_until': payment.user.membership_valid_until,
                'user': {
                    'name': payment.user.get_full_name(),
                    'email': payment.user.email,
                    'join_date': payment.user.date_joined.date()
                }
            })
            
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Payment verification error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class DownloadInvoice(APIView):
    permission_classes = [IsAuthenticated]

    def generate_invoice_pdf(self, payment, session):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        
        # Create styles
        styles = getSampleStyleSheet()
        title_style = styles['Title']
        heading_style = styles['Heading2']
        normal_style = styles['BodyText']
        
        # Invoice content
        elements = []
        
        # Header
        elements.append(Paragraph("ACNA Membership Invoice", title_style))
        elements.append(Paragraph(f"Invoice #: {session.payment_intent}", heading_style))
        elements.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", normal_style))
        elements.append(Paragraph("<br/><br/>", normal_style))
        
        # Customer Info
        customer_info = [
            ["Bill To:", ""],
            [payment.user.get_full_name(), ""],
            [payment.user.email, ""],
            ["", ""],
        ]
        
        customer_table = Table(customer_info, colWidths=[300, 200])
        elements.append(customer_table)
        elements.append(Paragraph("<br/><br/>", normal_style))
        
        # Invoice Items
        item_data = [
            ["Description", "Amount"],
            [
                f"{payment.membership_type.capitalize()} Membership", 
                f"${payment.amount:.2f}"
            ]
        ]
        
        item_table = Table(item_data, colWidths=[350, 150])
        item_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(item_table)
        elements.append(Paragraph("<br/><br/>", normal_style))
        
        # Total
        total_data = [
            ["Total:", f"${payment.amount:.2f}"]
        ]
        total_table = Table(total_data, colWidths=[350, 150])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
        ]))
        elements.append(total_table)
        
        # Footer
        elements.append(Paragraph("<br/><br/>", normal_style))
        elements.append(Paragraph("Thank you for your membership!", normal_style))
        elements.append(Paragraph("ACNA - Professional Association", normal_style))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer

        # Add logo at the top
        logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png')
        if os.path.exists(logo_path):
            logo = Image(logo_path, width=200, height=50)
            elements.insert(0, logo)
            elements.insert(1, Paragraph("<br/>", normal_style))

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify payment belongs to user
            payment = Payment.objects.get(
                stripe_checkout_session_id=session_id,
                user=request.user
            )
            
            # Retrieve Stripe session
            session = stripe.checkout.Session.retrieve(session_id)
            
            # Generate custom invoice
            pdf_buffer = self.generate_invoice_pdf(payment, session)
            
            return HttpResponse(
                pdf_buffer,
                content_type='application/pdf',
                headers={
                    'Content-Disposition': f'attachment; filename="invoice-{session_id}.pdf"'
                }
            )
            
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Invoice download error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )