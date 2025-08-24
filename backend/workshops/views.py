# workshops/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
import os
import uuid
from rest_framework import serializers
from django.http import JsonResponse
from .models import Workshop, CollaborationSubmission
from .serializers import (
    WorkshopSerializer, CreateWorkshopSerializer,
    CollaborationSubmissionSerializer, CreateCollaborationSerializer,
    WorkshopRegistrationSerializer, CreateWorkshopRegistrationSerializer, WorkshopRegistration
)

import logging

logger = logging.getLogger(__name__)

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
        
        # Revenue analytics
        total_revenue = Workshop.objects.aggregate(
            total=Sum('price', filter=Q(price__isnull=False))
        )['total'] or 0
        
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
            
            # Create the registration
            registration = serializer.save()
            
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
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating registration: {e.detail}")
            return Response(
                {'error': 'Validation error', 'details': e.detail},
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