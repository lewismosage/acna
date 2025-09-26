# workshops/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.http import HttpResponse
import os
import uuid
import json
import stripe
import io
import logging
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from rest_framework import serializers
from django.http import JsonResponse
from .models import Workshop, CollaborationSubmission, WorkshopPayment
from .serializers import (
    WorkshopSerializer, CreateWorkshopSerializer,
    CollaborationSubmissionSerializer, CreateCollaborationSerializer,
    WorkshopRegistrationSerializer, CreateWorkshopRegistrationSerializer, WorkshopRegistration,
    WorkshopPaymentSerializer
)

import logging

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateWorkshopSerializer
        return WorkshopSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating workshop with data: {request.data}")
            
            # Make a mutable copy of the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Handle empty prerequisites and materials arrays
            if 'prerequisites' not in data or not data['prerequisites']:
                data['prerequisites'] = []
            if 'materials' not in data or not data['materials']:
                data['materials'] = []
            
            # Ensure prerequisites and materials are lists
            if isinstance(data.get('prerequisites'), str):
                data['prerequisites'] = [data['prerequisites']] if data['prerequisites'] else []
            if isinstance(data.get('materials'), str):
                data['materials'] = [data['materials']] if data['materials'] else []
            
            # Handle empty venue and price
            if data.get('venue') == '':
                data['venue'] = None
            if data.get('price') == '' or data.get('price') == 'undefined':
                data['price'] = None
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            workshop = serializer.save()
            
            # Return the created workshop using the read serializer
            read_serializer = WorkshopSerializer(workshop, context={'request': request})
            logger.info(f"Workshop created successfully: {workshop.id}")
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating workshop: {e.detail}")
            return Response(
                {'error': 'Validation error', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating workshop: {str(e)}")
            return Response(
                {'error': f'Failed to create workshop: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Make a mutable copy of the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Handle empty prerequisites and materials arrays
            if 'prerequisites' in data and not data['prerequisites']:
                data['prerequisites'] = []
            if 'materials' in data and not data['materials']:
                data['materials'] = []
            
            # Handle empty venue and price
            if data.get('venue') == '':
                data['venue'] = None
            if data.get('price') == '' or data.get('price') == 'undefined':
                data['price'] = None
            
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            workshop = serializer.save()
            
            # Return the updated workshop using the read serializer
            read_serializer = WorkshopSerializer(workshop, context={'request': request})
            return Response(read_serializer.data)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error updating workshop: {e.detail}")
            return Response(
                {'error': 'Validation error', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error updating workshop: {str(e)}")
            return Response(
                {'error': f'Failed to update workshop: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by type if provided
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(instructor__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset.order_by('-date', '-time')
    
    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Upload an image and return the URL"""
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image = request.FILES['image']
        
        # Validate file type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_extension = os.path.splitext(image.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {'error': 'Invalid file type. Allowed types: jpg, jpeg, png, gif, webp'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (limit to 10MB)
        if image.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 10MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('workshops', 'images', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(image.read()))
            file_url = default_storage.url(saved_path)
            
            # Return full URL if needed
            if request:
                file_url = request.build_absolute_uri(file_url)
            
            return Response({
                'url': file_url,
                'filename': filename,
                'path': saved_path
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to upload image: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get comprehensive workshop analytics data"""
        from django.db.models import Count, Sum
        
        # Basic counts
        total_workshops = Workshop.objects.count()
        planning_count = Workshop.objects.filter(status='Planning').count()
        registration_open_count = Workshop.objects.filter(status='Registration Open').count()
        in_progress_count = Workshop.objects.filter(status='In Progress').count()
        completed_count = Workshop.objects.filter(status='Completed').count()
        cancelled_count = Workshop.objects.filter(status='Cancelled').count()
        
        # Registration analytics
        total_registrations = Workshop.objects.aggregate(total=Sum('registered'))['total'] or 0
        
        # Monthly registrations (registrations from workshops in the last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_registrations = Workshop.objects.filter(
            date__gte=thirty_days_ago
        ).aggregate(total=Sum('registered'))['total'] or 0
        
        # Revenue analytics - calculate from actual payments
        total_revenue = WorkshopPayment.objects.filter(
            status='succeeded'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Workshops by type
        workshops_by_type = {
            'Online': Workshop.objects.filter(type='Online').count(),
            'In-Person': Workshop.objects.filter(type='In-Person').count(),
            'Hybrid': Workshop.objects.filter(type='Hybrid').count(),
        }
        
        # Top workshops by registration count
        top_workshops = []
        workshops_with_counts = Workshop.objects.filter(
            registered__gt=0
        ).order_by('-registered')[:5]
        
        for workshop in workshops_with_counts:
            top_workshops.append({
                'id': workshop.id,
                'title': workshop.title,
                'date': workshop.date.strftime('%Y-%m-%d') if workshop.date else '',
                'registered': workshop.registered
            })
        
        return Response({
            'total': total_workshops,
            'planning': planning_count,
            'registrationOpen': registration_open_count,
            'inProgress': in_progress_count,
            'completed': completed_count,
            'cancelled': cancelled_count,
            'totalRegistrations': total_registrations,
            'monthlyRegistrations': monthly_registrations,
            'totalRevenue': float(total_revenue),
            'workshopsByType': workshops_by_type,
            'topWorkshops': top_workshops,
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured workshops"""
        featured_workshops = Workshop.objects.filter(
            status__in=['Registration Open', 'In Progress']
        ).order_by('-date', '-time')[:10]
        
        serializer = self.get_serializer(featured_workshops, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming workshops"""
        upcoming_workshops = Workshop.objects.filter(
            status__in=['Planning', 'Registration Open', 'In Progress']
        ).order_by('date', 'time')[:10]
        
        serializer = self.get_serializer(upcoming_workshops, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a workshop"""
        workshop = self.get_object()
        # Add is_featured field to model if it doesn't exist
        if hasattr(workshop, 'is_featured'):
            workshop.is_featured = not workshop.is_featured
            workshop.save()
        
        serializer = self.get_serializer(workshop)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a workshop"""
        workshop = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Planning', 'Registration Open', 'In Progress', 'Completed', 'Cancelled']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workshop.status = new_status
        workshop.save()
        
        serializer = self.get_serializer(workshop)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def instructors(self, request):
        """Get distinct workshop instructors"""
        instructors = Workshop.objects.order_by('instructor').values_list('instructor', flat=True).distinct()
        return Response(list(instructors))
    
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """Get distinct workshop locations"""
        locations = Workshop.objects.order_by('location').values_list('location', flat=True).distinct()
        return Response(list(locations))

class CollaborationViewSet(viewsets.ModelViewSet):
    queryset = CollaborationSubmission.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateCollaborationSerializer
        return CollaborationSubmissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(project_title__icontains=search) |
                Q(project_description__icontains=search) |
                Q(institution__icontains=search) |
                Q(project_lead__icontains=search)
            )
        
        return queryset.order_by('-submitted_at')
    
    def create(self, request, *args, **kwargs):
        try:
            # Make a mutable copy of the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Handle skillsNeeded array
            if 'skillsNeeded' not in data or not data['skillsNeeded']:
                data['skillsNeeded'] = []
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            collaboration = serializer.save()
            
            # Return the created collaboration using the read serializer
            read_serializer = CollaborationSubmissionSerializer(collaboration, context={'request': request})
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create collaboration: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a collaboration submission"""
        collaboration = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Pending', 'Approved', 'Rejected', 'Needs Info']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        collaboration.status = new_status
        collaboration.save()
        
        serializer = self.get_serializer(collaboration)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comments_and_notify(self, request, pk=None):
        """Add comments and send notification to submitter"""
        collaboration = self.get_object()
        comments = request.data.get('comments', '')
        
        # Update comments if provided
        if comments.strip():
            collaboration.additional_notes = comments
            collaboration.save()
        
        try:
            # Send email notification
            subject = f"Collaboration Request Update: {collaboration.project_title}"
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [collaboration.contact_email]
            
            context = {
                'collaboration': collaboration,
                'comments': comments,
            }
            
            html_content = render_to_string('workshops/emails/collaboration_notification.html', context)
            text_content = render_to_string('workshops/emails/collaboration_notification.txt', context)
            
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            serializer = self.get_serializer(collaboration)
            return Response({
                'success': True,
                'message': f'Comments updated and notification sent to {collaboration.contact_email}',
                'data': serializer.data
            })
            
        except TemplateDoesNotExist as e:
            logger.error(f"Email template not found: {str(e)}")
            return Response({
                'success': False,
                'error': 'Email template configuration error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send notification. Please check email configuration.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class WorkshopRegistrationViewSet(viewsets.ModelViewSet):
    queryset = WorkshopRegistration.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateWorkshopRegistrationSerializer
        return WorkshopRegistrationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by workshop ID if provided
        workshop_id = self.request.query_params.get('workshop_id')
        if workshop_id:
            queryset = queryset.filter(workshop_id=workshop_id)
        
        # Filter by registration type if provided
        registration_type = self.request.query_params.get('registration_type')
        if registration_type:
            queryset = queryset.filter(registration_type=registration_type)
        
        # Filter by payment status if provided
        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(organization__icontains=search)
            )
        
        return queryset.order_by('-registered_at')

    def create(self, request, *args, **kwargs):
        """Create a new workshop registration"""
        try:
            logger.info(f"Creating workshop registration with data: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get the workshop
            workshop_id = serializer.validated_data['workshop'].id
            workshop = Workshop.objects.get(id=workshop_id)
            
            # Check if workshop is open for registration
            if workshop.status != 'Registration Open':
                return Response(
                    {'error': 'This workshop is not currently open for registration.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check capacity
            if workshop.registered >= workshop.capacity:
                return Response(
                    {'error': 'This workshop has reached its capacity.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Double-check for duplicate registration (in case of race conditions)
            existing_registration = WorkshopRegistration.objects.filter(
                workshop=workshop,
                email=serializer.validated_data['email']
            ).first()
            
            if existing_registration:
                return Response(
                    {'error': 'This email is already registered for this workshop.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if payment is required
            amount = workshop.price or 0
            
            if amount > 0:
                # Payment required - validate data but don't save yet
                # Convert validated data to dict and remove non-serializable objects
                registration_data = dict(serializer.validated_data)
                # Remove the workshop object as it's not JSON serializable
                if 'workshop' in registration_data:
                    del registration_data['workshop']
                
                # Return payment info without creating registration
                return Response({
                    'success': True,
                    'message': 'Registration data validated. Payment required.',
                    'registration_data': registration_data,
                    'payment_required': True,
                    'amount': float(amount),
                    'workshop_id': workshop.id
                }, status=status.HTTP_200_OK)
            else:
                # No payment required - create registration immediately
                registration = serializer.save()
                registration.payment_status = 'free'
                registration.save()
                
                # Update workshop registration count
                workshop.registered += 1
                workshop.save(update_fields=['registered'])
                
                # Send confirmation email
                try:
                    self.send_registration_confirmation(registration)
                    logger.info(f"Confirmation email sent for registration {registration.id}")
                except Exception as e:
                    logger.error(f"Failed to send confirmation email: {str(e)}")
                    # Don't fail the registration if email fails
                
                # Return the created registration using the read serializer
                read_serializer = WorkshopRegistrationSerializer(registration, context={'request': request})
                logger.info(f"Workshop registration created successfully: {registration.id}")
                return Response({
                    'success': True,
                    'message': 'Registration successful! A confirmation email has been sent.',
                    'data': read_serializer.data,
                    'payment_required': False
                }, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating registration: {e.detail}")
            
            # Handle unique constraint error specifically
            error_detail = e.detail
            if isinstance(error_detail, dict) and 'non_field_errors' in error_detail:
                for error in error_detail['non_field_errors']:
                    if 'unique set' in str(error) or 'unique' in str(error).lower():
                        return Response(
                            {'error': 'This email is already registered for this workshop.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            elif isinstance(error_detail, str) and ('unique' in error_detail.lower() or 'duplicate' in error_detail.lower()):
                return Response(
                    {'error': 'This email is already registered for this workshop.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {'error': 'Validation error', 'details': error_detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Workshop.DoesNotExist:
            return Response(
                {'error': 'Workshop not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error creating registration: {str(e)}")
            return Response(
                {'error': f'Failed to create registration: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def update_payment_status(self, request, pk=None):
        """Update payment status of a registration"""
        registration = self.get_object()
        new_status = request.data.get('payment_status')
        
        if new_status not in ['Pending', 'Paid', 'Free', 'Failed']:
            return Response(
                {'error': 'Invalid payment status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registration.payment_status = new_status
        registration.save()
        
        serializer = self.get_serializer(registration)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_confirmation(self, request, pk=None):
        """Send registration confirmation email"""
        registration = self.get_object()
        
        try:
            self.send_registration_confirmation(registration)
            return Response({
                'success': True,
                'message': f'Confirmation email sent to {registration.email}'
            })
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send confirmation email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def send_registration_confirmation(self, registration):
        """Send registration confirmation email"""
        subject = f"Registration Confirmation: {registration.workshop.title}"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
        to = [registration.email]

        context = {
            'registration': registration,
            'workshop': registration.workshop,
            'company_name': getattr(settings, 'COMPANY_NAME', 'African Consortium for Neurology in Africa'),
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'),
            'contact_email': getattr(settings, 'CONTACT_EMAIL', 'contact@acna.org')
        }

        try:
            # Simple text email (you can enhance with HTML later)
            text_content = f"""Dear {registration.first_name} {registration.last_name},

Thank you for registering for the workshop: {registration.workshop.title}

Workshop Details:
- Date: {registration.workshop.date}
- Time: {registration.workshop.time}
- Duration: {registration.workshop.duration}
- Location: {registration.workshop.location}

Your registration has been confirmed. You will receive further details closer to the workshop date.

If you have any questions, please contact us at {context['contact_email']}.

Best regards,
The {context['company_name']} Team
"""

            # Try to send HTML email if templates exist, otherwise send plain text
            try:
                html_content = render_to_string("workshops/emails/registration_confirmation.html", context)
                msg = EmailMultiAlternatives(subject, text_content, from_email, to)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except Exception:
                # Fallback to plain text email
                from django.core.mail import send_mail
                send_mail(subject, text_content, from_email, to, fail_silently=False)
            
            logger.info(f"Workshop registration confirmation sent to {registration.email}")
            
        except Exception as e:
            logger.error(f"Failed to send registration confirmation to {registration.email}: {str(e)}")
            raise


class WorkshopPaymentView(APIView):
    """Handle workshop payment creation"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Create Stripe checkout session for workshop payment"""
        try:
            workshop_id = request.data.get('workshop_id')
            registration_data = request.data.get('registration_data')
            amount = request.data.get('amount')
            
            if not all([workshop_id, registration_data, amount]):
                return Response(
                    {'error': 'Missing required fields'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get workshop
            try:
                workshop = Workshop.objects.get(id=workshop_id)
            except Workshop.DoesNotExist:
                return Response(
                    {'error': 'Workshop not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create Stripe checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Workshop Registration: {workshop.title}',
                            'description': f'Registration for {workshop.title}',
                        },
                        'unit_amount': int(float(amount) * 100),  # Convert to cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'{settings.FRONTEND_URL}/workshop-payment-success?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.FRONTEND_URL}/workshop-payment-canceled?workshop_id={workshop_id}',
                metadata={
                    'workshop_id': str(workshop_id),
                    'registration_data': json.dumps(registration_data),
                    'registration_type': registration_data.get('registration_type', 'regular'),
                }
            )
            
            return Response({'sessionId': session.id})
            
        except Exception as e:
            logger.error(f"Error creating workshop payment session: {str(e)}")
            return Response(
                {'error': 'Failed to create payment session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WorkshopPaymentWebhook(APIView):
    """Handle Stripe webhook for workshop payments"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Process Stripe webhook events"""
        try:
            payload = request.body
            sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
            
            # Verify webhook signature
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
                )
            except ValueError:
                return Response({'error': 'Invalid payload'}, status=400)
            except stripe.error.SignatureVerificationError:
                return Response({'error': 'Invalid signature'}, status=400)
            
            # Handle the event
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                
                # Get metadata
                workshop_id = session['metadata']['workshop_id']
                registration_data = json.loads(session['metadata']['registration_data'])
                registration_type = session['metadata']['registration_type']
                
                # Get workshop
                workshop = Workshop.objects.get(id=workshop_id)
                
                # Create registration
                registration = WorkshopRegistration.objects.create(
                    workshop=workshop,
                    first_name=registration_data['first_name'],
                    last_name=registration_data['last_name'],
                    email=registration_data['email'],
                    phone=registration_data.get('phone', ''),
                    organization=registration_data.get('organization', ''),
                    profession=registration_data.get('profession', ''),
                    registration_type=registration_type,
                    payment_status='paid',
                    amount=float(session['amount_total']) / 100,  # Convert from cents
                    country=registration_data.get('country', ''),
                )
                
                # Create payment record
                WorkshopPayment.objects.create(
                    workshop=workshop,
                    registration=registration,
                    amount=float(session['amount_total']) / 100,
                    currency=session['currency'],
                    stripe_checkout_session_id=session['id'],
                    status='succeeded',
                    payment_type='registration',
                    registration_type=registration_type,
                )
                
                # Update workshop registration count
                workshop.registered += 1
                workshop.save(update_fields=['registered'])
                
                # Send confirmation email
                try:
                    self.send_workshop_payment_confirmation(registration, workshop, session)
                    logger.info(f"Workshop payment confirmation sent for registration {registration.id}")
                except Exception as e:
                    logger.error(f"Failed to send workshop payment confirmation: {str(e)}")
            
            return Response({'status': 'success'})
            
        except Exception as e:
            logger.error(f"Workshop payment webhook error: {str(e)}")
            return Response(
                {'error': 'Webhook processing failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def send_workshop_payment_confirmation(self, registration, workshop, session):
        """Send workshop payment confirmation email"""
        subject = f"Payment Confirmation: {workshop.title}"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
        to = [registration.email]

        context = {
            'registration': registration,
            'workshop': workshop,
            'session': session,
            'company_name': getattr(settings, 'COMPANY_NAME', 'African Consortium for Neurology in Africa'),
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'),
            'contact_email': getattr(settings, 'CONTACT_EMAIL', 'contact@acna.org')
        }

        try:
            # Simple text email
            text_content = f"""Dear {registration.first_name} {registration.last_name},

Thank you for your payment and registration for the workshop: {workshop.title}

Payment Details:
- Amount: ${float(session['amount_total']) / 100:.2f}
- Payment ID: {session['id']}
- Status: Paid

Workshop Details:
- Date: {workshop.date}
- Time: {workshop.time}
- Duration: {workshop.duration}
- Location: {workshop.location}

Your registration has been confirmed. You will receive further details closer to the workshop date.

If you have any questions, please contact us at {context['contact_email']}.

Best regards,
The {context['company_name']} Team
"""

            # Try to send HTML email if templates exist, otherwise send plain text
            try:
                html_content = render_to_string("workshops/emails/payment_confirmation.html", context)
                msg = EmailMultiAlternatives(subject, text_content, from_email, to)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except Exception:
                # Fallback to plain text email
                from django.core.mail import send_mail
                send_mail(subject, text_content, from_email, to, fail_silently=False)
            
            logger.info(f"Workshop payment confirmation sent to {registration.email}")
            
        except Exception as e:
            logger.error(f"Failed to send workshop payment confirmation to {registration.email}: {str(e)}")
            raise


class WorkshopPaymentVerify(APIView):
    """Verify workshop payment status"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Verify payment status using session ID"""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get payment record
            payment = WorkshopPayment.objects.get(
                stripe_checkout_session_id=session_id
            )
            
            return Response({
                'success': True,
                'payment': WorkshopPaymentSerializer(payment).data,
                'registration': WorkshopRegistrationSerializer(payment.registration).data,
                'workshop': WorkshopSerializer(payment.workshop).data,
            })
            
        except WorkshopPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error verifying workshop payment: {str(e)}")
            return Response(
                {'error': 'Failed to verify payment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WorkshopInvoiceDownload(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Download workshop payment invoice as PDF"""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get payment record
            payment = WorkshopPayment.objects.get(
                stripe_checkout_session_id=session_id
            )
            
            # Generate PDF invoice
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="workshop_invoice_{payment.id}.pdf"'
            
            # Create PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Company header
            company_name = getattr(settings, 'COMPANY_NAME', 'African Child Neurology Association')
            company_email = getattr(settings, 'CONTACT_EMAIL', 'info@acna.org')
            
            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#DC2626')  # Red color
            )
            story.append(Paragraph("INVOICE", title_style))
            story.append(Spacer(1, 20))
            
            # Company info
            company_style = ParagraphStyle(
                'CompanyInfo',
                parent=styles['Normal'],
                fontSize=12,
                alignment=TA_LEFT
            )
            story.append(Paragraph(f"<b>{company_name}</b>", company_style))
            story.append(Paragraph(f"Email: {company_email}", company_style))
            story.append(Spacer(1, 20))
            
            # Invoice details
            invoice_data = [
                ['Invoice Number:', f"INV-{payment.id:06d}"],
                ['Invoice Date:', payment.created_at.strftime('%B %d, %Y')],
                ['Payment Date:', payment.updated_at.strftime('%B %d, %Y')],
                ['Payment Status:', payment.status.upper()],
            ]
            
            invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
            invoice_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(invoice_table)
            story.append(Spacer(1, 20))
            
            # Customer info
            story.append(Paragraph("<b>Bill To:</b>", styles['Heading3']))
            customer_data = [
                ['Name:', f"{payment.registration.first_name} {payment.registration.last_name}"],
                ['Email:', payment.registration.email],
                ['Organization:', payment.registration.organization or 'N/A'],
                ['Phone:', payment.registration.phone or 'N/A'],
            ]
            
            customer_table = Table(customer_data, colWidths=[1.5*inch, 4*inch])
            customer_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(customer_table)
            story.append(Spacer(1, 20))
            
            # Workshop details
            story.append(Paragraph("<b>Workshop Details:</b>", styles['Heading3']))
            workshop_data = [
                ['Workshop:', payment.workshop.title],
                ['Date:', payment.workshop.date],
                ['Location:', payment.workshop.location],
                ['Registration Type:', payment.registration_type.replace('_', ' ').title()],
            ]
            
            workshop_table = Table(workshop_data, colWidths=[1.5*inch, 4*inch])
            workshop_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(workshop_table)
            story.append(Spacer(1, 30))
            
            # Payment summary
            story.append(Paragraph("<b>Payment Summary:</b>", styles['Heading3']))
            payment_data = [
                ['Description', 'Amount'],
                [f"Workshop Registration ({payment.registration_type.replace('_', ' ').title()})", f"${payment.amount:.2f} {payment.currency.upper()}"],
                ['', ''],
                ['<b>Total Amount</b>', f"<b>${payment.amount:.2f} {payment.currency.upper()}</b>"],
            ]
            
            payment_table = Table(payment_data, colWidths=[4*inch, 1.5*inch])
            payment_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
                ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#F3F4F6')),
            ]))
            story.append(payment_table)
            story.append(Spacer(1, 30))
            
            # Footer
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                alignment=TA_CENTER,
                textColor=colors.grey
            )
            story.append(Paragraph("Thank you for your registration!", footer_style))
            story.append(Paragraph("For any questions, please contact us at " + company_email, footer_style))
            
            # Build PDF
            doc.build(story)
            pdf_content = buffer.getvalue()
            buffer.close()
            
            response.write(pdf_content)
            return response
            
        except WorkshopPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating workshop invoice: {str(e)}")
            return Response(
                {'error': 'Failed to generate invoice'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )