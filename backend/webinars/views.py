from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import timedelta
import os
import uuid
from .models import Webinar, Speaker, Registration, WebinarView
from .serializers import (
    WebinarSerializer, CreateWebinarSerializer, 
    RegistrationSerializer, SpeakerSerializer
)

class WebinarViewSet(viewsets.ModelViewSet):
    queryset = Webinar.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateWebinarSerializer
        return WebinarSerializer
    
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
        
        # Filter by category if provided
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category__icontains=category_filter)
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured is not None:
            is_featured = featured.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        
        # Filter by upcoming
        upcoming = self.request.query_params.get('upcoming')
        if upcoming is not None:
            is_upcoming = upcoming.lower() == 'true'
            queryset = queryset.filter(status__in=['Planning', 'Registration Open', 'Live'])
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )
        
        return queryset.order_by('-date', '-time')
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single webinar and track view"""
        instance = self.get_object()
        
        # Track view
        self.track_view(instance, request)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def track_view(self, webinar, request):
        """Track a view for analytics"""
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Don't track if the same IP viewed this webinar in the last hour
        recent_view = WebinarView.objects.filter(
            webinar=webinar,
            ip_address=ip_address,
            viewed_at__gte=timezone.now() - timedelta(hours=1)
        ).exists()
        
        if not recent_view:
            WebinarView.objects.create(
                webinar=webinar,
                ip_address=ip_address,
                user_agent=user_agent
            )
    
    def get_client_ip(self, request):
        """Get the client's IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
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
            file_path = os.path.join('webinars', 'images', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(image.read()))
            file_url = default_storage.url(saved_path)
            
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
    
    @action(detail=False, methods=['post'])
    def upload_speaker_image(self, request):
        """Upload a speaker image and return the URL"""
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
            file_path = os.path.join('speakers', 'images', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(image.read()))
            file_url = default_storage.url(saved_path)
            
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
    
    @action(detail=False, methods=['post'])
    def upload_recording(self, request, pk=None):
        """Upload a webinar recording"""
        if 'recording' not in request.FILES:
            return Response(
                {'error': 'No recording file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        recording = request.FILES['recording']
        
        # Validate file type
        allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
        file_extension = os.path.splitext(recording.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {'error': 'Invalid file type. Allowed types: mp4, mov, avi, mkv, webm'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (limit to 500MB)
        if recording.size > 500 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 500MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('webinars', 'recordings', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(recording.read()))
            file_url = default_storage.url(saved_path)
            
            return Response({
                'url': file_url,
                'filename': filename,
                'path': saved_path
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to upload recording: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def upload_slides(self, request, pk=None):
        """Upload webinar slides"""
        if 'slides' not in request.FILES:
            return Response(
                {'error': 'No slides file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        slides = request.FILES['slides']
        
        # Validate file type
        allowed_extensions = ['.pdf', '.ppt', '.pptx', '.key']
        file_extension = os.path.splitext(slides.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {'error': 'Invalid file type. Allowed types: pdf, ppt, pptx, key'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (limit to 50MB)
        if slides.size > 50 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 50MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('webinars', 'slides', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(slides.read()))
            file_url = default_storage.url(saved_path)
            
            return Response({
                'url': file_url,
                'filename': filename,
                'path': saved_path
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to upload slides: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get webinar analytics data"""
        # Basic counts
        total_webinars = Webinar.objects.count()
        planning_count = Webinar.objects.filter(status='Planning').count()
        registration_open_count = Webinar.objects.filter(status='Registration Open').count()
        live_count = Webinar.objects.filter(status='Live').count()
        completed_count = Webinar.objects.filter(status='Completed').count()
        cancelled_count = Webinar.objects.filter(status='Cancelled').count()
        
        # Registration analytics
        total_registrations = Registration.objects.count()
        
        # Monthly registrations (registrations from webinars in the last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_registrations = Registration.objects.filter(
            webinar__date__gte=thirty_days_ago
        ).count()
        
        # Additional analytics
        featured_count = Webinar.objects.filter(is_featured=True).count()
        total_views = WebinarView.objects.count()
        
        return Response({
            'total': total_webinars,
            'planning': planning_count,
            'registrationOpen': registration_open_count,
            'live': live_count,
            'completed': completed_count,
            'cancelled': cancelled_count,
            'totalRegistrations': total_registrations,
            'monthlyRegistrations': monthly_registrations,
            'featured': featured_count,
            'totalViews': total_views,
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured webinars"""
        featured_webinars = Webinar.objects.filter(
            is_featured=True, 
            status__in=['Registration Open', 'Live']
        ).order_by('-date', '-time')[:10]
        
        serializer = self.get_serializer(featured_webinars, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming webinars"""
        upcoming_webinars = Webinar.objects.filter(
            status__in=['Planning', 'Registration Open', 'Live']
        ).order_by('date', 'time')[:10]
        
        serializer = self.get_serializer(upcoming_webinars, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a webinar"""
        webinar = self.get_object()
        webinar.toggle_featured()
        
        serializer = self.get_serializer(webinar)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a webinar"""
        webinar = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Planning', 'Registration Open', 'Live', 'Completed', 'Cancelled']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        webinar.status = new_status
        webinar.save()
        
        serializer = self.get_serializer(webinar)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get registrations for a specific webinar"""
        webinar = self.get_object()
        registrations = webinar.registrations.all().order_by('-registration_date')
        
        page = self.paginate_queryset(registrations)
        if page is not None:
            serializer = RegistrationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = RegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def registrations_all(self, request):
        """Get all registrations"""
        registrations = Registration.objects.all().order_by('-registration_date')
        
        # Filter by webinar ID if provided
        webinar_id = request.query_params.get('webinar_id')
        if webinar_id:
            registrations = registrations.filter(webinar_id=webinar_id)
        
        # Filter by registration type if provided
        registration_type = request.query_params.get('registration_type')
        if registration_type:
            registrations = registrations.filter(registration_type=registration_type)
        
        # Filter by payment status if provided
        payment_status = request.query_params.get('payment_status')
        if payment_status:
            registrations = registrations.filter(payment_status=payment_status)
        
        # Search functionality
        search = request.query_params.get('search')
        if search:
            registrations = registrations.filter(
                Q(attendee_name__icontains=search) |
                Q(email__icontains=search) |
                Q(organization__icontains=search)
            )
        
        page = self.paginate_queryset(registrations)
        if page is not None:
            serializer = RegistrationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = RegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def email_registrants(self, request, pk=None):
        """Email registrants for a webinar"""
        webinar = self.get_object()
        email_data = request.data
        
        # Validate email data
        required_fields = ['subject', 'message', 'recipient_type']
        for field in required_fields:
            if field not in email_data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get recipients based on type
        recipient_type = email_data['recipient_type']
        if recipient_type == 'all':
            recipients = webinar.registrations.all()
        elif recipient_type == 'paid':
            recipients = webinar.registrations.filter(payment_status='Paid')
        elif recipient_type == 'free':
            recipients = webinar.registrations.filter(payment_status='Free')
        elif recipient_type == 'pending':
            recipients = webinar.registrations.filter(payment_status='Pending')
        else:
            return Response(
                {'error': 'Invalid recipient_type. Must be all, paid, free, or pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real implementation, you would send emails here
        # For now, we'll just return the count of recipients
        
        return Response({
            'success': True,
            'sent': recipients.count(),
            'recipients': [r.email for r in recipients]
        })
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get distinct webinar categories"""
        categories = Webinar.objects.order_by('category').values_list('category', flat=True).distinct()
        return Response(list(categories))
    
    @action(detail=False, methods=['get'])
    def languages(self, request):
        """Get distinct webinar languages"""
        languages = WebinarLanguage.objects.order_by('language').values_list('language', flat=True).distinct()
        return Response(list(languages))
    
    @action(detail=False, methods=['get'])
    def target_audiences(self, request):
        """Get distinct target audiences"""
        audiences = WebinarAudience.objects.order_by('audience').values_list('audience', flat=True).distinct()
        return Response(list(audiences))

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by webinar ID if provided
        webinar_id = self.request.query_params.get('webinar_id')
        if webinar_id:
            queryset = queryset.filter(webinar_id=webinar_id)
        
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
                Q(attendee_name__icontains=search) |
                Q(email__icontains=search) |
                Q(organization__icontains=search)
            )
        
        return queryset.order_by('-registration_date')
    
    @action(detail=True, methods=['post'])
    def send_confirmation(self, request, pk=None):
        """Send registration confirmation email"""
        registration = self.get_object()
        
        # In a real implementation, you would send an email here
        # For now, we'll just return a success response
        
        return Response({
            'success': True,
            'message': f'Confirmation email would be sent to {registration.email}'
        })
    
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