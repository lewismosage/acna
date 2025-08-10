# payments/views.py
import stripe
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from .models import Payment
from users.models import User
from django.utils import timezone
from datetime import timedelta
import logging
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Table, TableStyle, Image
from reportlab.lib import colors
from django.http import HttpResponse
from datetime import datetime
from .utils import generate_membership_id
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from datetime import date
from rest_framework.throttling import AnonRateThrottle
from django.core.exceptions import ObjectDoesNotExist


logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSession(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Handle both authenticated and unauthenticated cases
            if request.user.is_authenticated:
                user = request.user
            else:
                user_id = request.data.get('user_id')
                if not user_id:
                    return Response(
                        {'error': 'User ID is required for unauthenticated payments'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response(
                        {'error': 'User not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

            payment_type = request.data.get('payment_type', 'initial')
            new_membership_class = request.data.get('new_membership_class')  # For upgrades
            current_membership_class = request.data.get('current_membership_class')  # For upgrades

            # Price mapping
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

            # Upgrade-specific checks
            if payment_type == 'upgrade':
                if not user.membership_class:
                    return Response(
                        {'error': 'No current membership found for upgrade'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if not new_membership_class:
                    return Response(
                        {'error': 'New membership class is required for upgrade'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if new_membership_class not in price_ids:
                    return Response(
                        {'error': 'Invalid upgrade membership type'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                current_price = self.get_membership_amount(user.membership_class)
                new_price = self.get_membership_amount(new_membership_class)
                if new_price <= current_price:
                    return Response(
                        {'error': 'Cannot upgrade to a lower or equal tier'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Select correct price_id
            membership_for_payment = (
                new_membership_class if payment_type == 'upgrade' else user.membership_class
            )
            price_id = price_ids.get(membership_for_payment)
            if not price_id:
                return Response(
                    {'error': 'Invalid membership type'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create Stripe checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='payment',
                metadata={
                    'membership_type': membership_for_payment,
                    'user_id': user.id,
                    'payment_type': payment_type,
                    'upgrade_from': current_membership_class if payment_type == 'upgrade' else None
                },
                customer_email=user.email,
                success_url=f"{settings.PAYMENT_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=settings.PAYMENT_CANCELED_URL,
            )

            # Create payment record - don't include upgrade_from if not an upgrade
            payment_data = {
                'user': user,
                'amount': self.get_membership_amount(membership_for_payment) / 100,
                'currency': 'usd',
                'stripe_checkout_session_id': session.id,
                'membership_type': membership_for_payment,
                'payment_frequency': 'annual',
                'status': 'pending',
                'payment_type': payment_type,
            }
            
            if payment_type == 'upgrade':
                payment_data['upgrade_from'] = current_membership_class

            Payment.objects.create(**payment_data)

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
                logger.info(f"Processing checkout.session.completed: {session['id']}")
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
            # Get payment by session ID
            logger.info(f"Looking up payment for session: {session.id}")
            payment = Payment.objects.get(
                stripe_checkout_session_id=session.id
            )
            logger.info(f"Found payment: {payment.id} for user: {payment.user.id}")
            user = payment.user

            # Auto-correct payment type if this was actually a renewal
            if payment.payment_type == 'initial' and user.membership_id:
                payment.payment_type = 'renewal'
                logger.info(f"Auto-corrected payment type to renewal for user {user.id}")

            # Mark payment as succeeded
            payment.status = 'succeeded'
            payment.save()

            # Update user membership validity
            user.is_active_member = True
            user.membership_valid_until = timezone.now().date() + timedelta(days=365)

            # Generate membership ID for brand-new members
            if not user.membership_id:
                user.membership_id = generate_membership_id()
                logger.info(f"Assigned new membership ID {user.membership_id} to user {user.id}")

            # If this was an upgrade, update the membership class
            if payment.payment_type == 'upgrade' and payment.membership_type != user.membership_class:
                old_membership = user.membership_class
                user.membership_class = payment.membership_type
                logger.info(f"Upgraded membership for user {user.id} from {old_membership} to {user.membership_class}")

            # Save user updates
            user.save()

            # Send confirmation email
            self.send_payment_confirmation_email(user, payment)

            logger.info(f"Payment {payment.payment_type} succeeded for user {user.id}")

        except Payment.DoesNotExist:
            logger.error(f"Payment not found for session {session.id}")
        except Exception as e:
            logger.error(f"Error handling payment completion: {str(e)}", exc_info=True)

    
    def send_payment_confirmation_email(self, user, payment):
        # Determine the appropriate subject and message based on payment type
        if payment.payment_type == 'initial':
            subject = "Welcome to ACNA - Membership Confirmation"
            action_phrase = "Thank you for joining ACNA. Your membership has been successfully activated."
        elif payment.payment_type == 'renewal':
            subject = "ACNA Membership Renewal Confirmation"
            action_phrase = "Thank you for renewing your ACNA membership."
        else:  # upgrade
            subject = "ACNA Membership Upgrade Confirmation"
            action_phrase = "Thank you for upgrading your ACNA membership."
        
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [user.email]

        valid_until = user.membership_valid_until
        formatted_date = valid_until.strftime('%B %d, %Y') if valid_until else "N/A"
        
        context = {
            'user': user,
            'payment': payment,
            'action_phrase': action_phrase,
            'membership_valid_until': user.membership_valid_until.strftime('%B %d, %Y'),
            'company_name': settings.COMPANY_NAME,
            'payment_type': payment.get_payment_type_display(),
        }
        
        try:
            html_content = render_to_string("payments/emails/payment_confirmation.html", context)
            
            # Dynamic text content based on payment type
            text_content = f"""
            Dear {user.get_full_name() or user.username},
            
            {action_phrase}
            
            Membership ID: {user.membership_id}
            Membership Type: {payment.membership_type}
            Payment Type: {payment.get_payment_type_display()}
            Valid Until: {user.membership_valid_until.strftime('%B %d, %Y')}
            
            You can now enjoy all the benefits of your ACNA membership.
            
            Best regards,
            {settings.COMPANY_NAME}
            """
            
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            logger.info(f"Payment confirmation email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send payment confirmation email: {str(e)}")

class VerifyPayment(APIView):
    permission_classes = [] 

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find payment by session ID only
            payment = Payment.objects.get(
                stripe_checkout_session_id=session_id
            )

            # If payment succeeded but membership not updated, update now
            if payment.status == 'succeeded' and not payment.user.membership_valid_until:
                payment.user.membership_valid_until = timezone.now().date() + timedelta(days=365)
                if not payment.user.membership_id:
                    payment.user.membership_id = generate_membership_id()
                payment.user.save()

            # Retrieve Stripe session
            session = stripe.checkout.Session.retrieve(session_id)

            # Base response
            response_data = {
                'status': 'success',
                'payment_status': payment.status,
                'membership_type': payment.membership_type,
                'amount': float(payment.amount),
                'invoice_number': session.invoice or session.payment_intent,
                'valid_until': payment.user.membership_valid_until,
                'membership_id': payment.user.membership_id,
                'user': {
                    'name': payment.user.get_full_name(),
                    'email': payment.user.email,
                    'join_date': payment.user.date_joined.date()
                }
            }

            # Add upgrade info if applicable
            if payment.payment_type == 'upgrade' and payment.upgrade_from:
                response_data.update({
                    'upgraded_from': payment.upgrade_from,
                    'upgraded_to': payment.membership_type
                })

            return Response(response_data)

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
    permission_classes = []

    def generate_invoice_pdf(self, payment, session):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)

        styles = getSampleStyleSheet()
        title_style, heading_style, normal_style = styles['Title'], styles['Heading2'], styles['BodyText']
        elements = []

        # Logo
        logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'ACNA.jpg')
        if os.path.exists(logo_path):
            elements.append(Image(logo_path, width=100, height=100))
            elements.append(Paragraph("<br/>", normal_style))

        # Header
        elements += [
            Paragraph("ACNA Membership Invoice", title_style),
            Paragraph(f"Invoice #: {session.payment_intent}", heading_style),
            Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", normal_style),
            Paragraph(f"Membership ID: {payment.user.membership_id}", normal_style),
            Paragraph("<br/><br/>", normal_style),
        ]

        # Customer info
        customer_table = Table(
            [[ "Bill To:", ""],
             [payment.user.get_full_name(), ""],
             [payment.user.email, ""],
             ["", ""]],
            colWidths=[300, 200]
        )
        elements += [customer_table, Paragraph("<br/><br/>", normal_style)]

        # Items
        item_table = Table(
            [["Description", "Amount"],
             [f"{payment.membership_type.capitalize()} Membership", f"${payment.amount:.2f}"]],
            colWidths=[350, 150]
        )
        item_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements += [item_table, Paragraph("<br/><br/>", normal_style)]

        # Total
        total_table = Table([["Total:", f"${payment.amount:.2f}"]], colWidths=[350, 150])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
        ]))
        elements += [total_table, Paragraph("<br/><br/>", normal_style)]

        # Footer
        elements += [
            Paragraph("Thank you for your membership!", normal_style),
            Paragraph("ACNA - Professional Association", normal_style),
        ]

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(stripe_checkout_session_id=session_id)
            session = stripe.checkout.Session.retrieve(session_id)
            pdf_buffer = self.generate_invoice_pdf(payment, session)

            return HttpResponse(
                pdf_buffer,
                content_type='application/pdf',
                headers={'Content-Disposition': f'attachment; filename="invoice-{session_id}.pdf"'}
            )

        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Invoice download error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MembershipSearchView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            is_organization = data.get('isOrganization', False)

            # Search logic
            if is_organization:
                if not data.get('organizationName') or not data.get('email'):
                    return Response(
                        {'message': 'Organization name and email are required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user = User.objects.get(
                    organization_name__iexact=data.get('organizationName'),
                    email__iexact=data.get('email'),
                    is_organization=True
                )
            else:
                if not data.get('firstName') or not data.get('lastName') or not data.get('email'):
                    return Response(
                        {'message': 'First name, last name and email are required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user = User.objects.get(
                    first_name__iexact=data.get('firstName'),
                    last_name__iexact=data.get('lastName'),
                    email__iexact=data.get('email'),
                    is_organization=False
                )

            # Membership status
            if not user.membership_valid_until:
                membership_status = 'Inactive'
            elif user.membership_valid_until < date.today():
                membership_status = 'Expired'
            elif (user.membership_valid_until - date.today()).days <= 30:
                membership_status = 'Expiring Soon'
            else:
                membership_status = 'Active'

            # Renewal fee
            renewal_fee = self.get_renewal_fee(user.membership_class)

            # Available upgrades
            available_upgrades = self.get_available_upgrades(user.membership_class)

            # Response
            response_data = {
                'id': str(user.id),
                'membershipId': user.membership_id or '',
                'firstName': user.first_name,
                'lastName': user.last_name if not is_organization else '',
                'email': user.email,
                'phone': user.mobile_number if not is_organization else user.organization_phone,
                'membershipType': user.get_membership_class_display() if user.membership_class else 'Regular',
                'membershipClass': user.membership_class or '',
                'membershipStatus': membership_status,
                'expiryDate': user.membership_valid_until.isoformat() if user.membership_valid_until else '',
                'joinDate': user.date_joined.date().isoformat(),
                'renewalFee': float(renewal_fee),
                'availableUpgrades': available_upgrades,
                'isOrganization': user.is_organization
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response(
                {'message': 'No matching membership record found. Please check your details or contact support.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_renewal_fee(self, membership_class):
        """Calculate renewal fee based on membership class"""
        pricing = {
            'full_professional': 100,
            'associate': 75,
            'student': 50,
            'institutional': 200,
            'affiliate': 60,
            'honorary': 0,
            'corporate': 300,
            'lifetime': 0
        }
        return pricing.get(membership_class, 100)

    def get_available_upgrades(self, current_class):
        """Get available upgrades based on current membership class"""
        pricing = {
            'student': 15,
            'associate': 40,
            'affiliate': 50,
            'full_professional': 80,
            'institutional': 300,
            'corporate': 500,
            'lifetime': 500
        }
        current_fee = pricing.get(current_class, 0)
        upgrades = []
        for tier, fee in pricing.items():
            if fee > current_fee:
                upgrades.append({
                    'key': tier,
                    'name': self.get_tier_display_name(tier),
                    'fee': fee,
                    'upgrade_cost': fee - current_fee
                })
        return upgrades

    def get_tier_display_name(self, tier_key):
        """Map tier keys to display names"""
        names = {
            'student': 'Trainee / Student Member',
            'associate': 'Associate Member',
            'affiliate': 'Affiliate Member',
            'full_professional': 'Full / Professional Member',
            'institutional': 'Institutional Member',
            'corporate': 'Corporate / Partner Member',
            'lifetime': 'Lifetime Member'
        }
        return names.get(tier_key, tier_key)
