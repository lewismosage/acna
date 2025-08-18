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
from .models import Conference, Registration, ConferenceView
from .serializers import ConferenceSerializer, CreateConferenceSerializer, RegistrationSerializer

class ConferenceViewSet(viewsets.ModelViewSet):
    queryset = Conference.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateConferenceSerializer
        return ConferenceSerializer
    
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
                Q(location__icontains=search) |
                Q(theme__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single conference and increment view count"""
        instance = self.get_object()
        
        # Track view
        self.track_view(instance, request)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def track_view(self, conference, request):
        """Track a view for analytics"""
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Don't track if the same IP viewed this conference in the last hour
        recent_view = ConferenceView.objects.filter(
            conference=conference,
            ip_address=ip_address,
            viewed_at__gte=timezone.now() - timedelta(hours=1)
        ).exists()
        
        if not recent_view:
            ConferenceView.objects.create(
                conference=conference,
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
            file_path = os.path.join('conferences', 'images', filename)
            
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
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get conference analytics data"""
        # Basic counts
        total_conferences = Conference.objects.count()
        upcoming_count = Conference.objects.filter(
            Q(status='Registration Open') | Q(status='Coming Soon')
        ).count()
        completed_count = Conference.objects.filter(status='Completed').count()
        cancelled_count = Conference.objects.filter(status='Cancelled').count()
        
        # Registration analytics
        total_registrations = Registration.objects.count()
        total_revenue = Registration.objects.filter(
            payment_status='Paid'
        ).aggregate(total=Count('id'))['total'] or 0
        
        # Additional analytics
        in_person_count = Conference.objects.filter(type='In-person').count()
        virtual_count = Conference.objects.filter(type='Virtual').count()
        hybrid_count = Conference.objects.filter(type='Hybrid').count()
        
        return Response({
            'total': total_conferences,
            'upcoming': upcoming_count,
            'completed': completed_count,
            'cancelled': cancelled_count,
            'totalRegistrations': total_registrations,
            'totalRevenue': total_revenue,
            'inPerson': in_person_count,
            'virtual': virtual_count,
            'hybrid': hybrid_count,
        })
    
    @action(detail=True, methods=['post'])
    def add_registration(self, request, pk=None):
        """Add a registration to a conference"""
        conference = self.get_object()
        serializer = RegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(conference=conference)
            
            # Increment registration count
            conference.registration_count += 1
            conference.save(update_fields=['registration_count'])
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a conference"""
        conference = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Planning', 'Registration Open', 'Coming Soon', 'Completed', 'Cancelled']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conference.status = new_status
        conference.save()
        
        serializer = self.get_serializer(conference)
        return Response(serializer.data)