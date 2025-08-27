from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import timedelta
from django.http import JsonResponse
import os
import uuid
import logging

from .models import PatientResource, ResourceTag, ResourceLanguage, ResourceAudience, ResourceView, ResourceDownload
from .serializers import PatientResourceSerializer, CreatePatientResourceSerializer

logger = logging.getLogger(__name__)

class PatientResourceViewSet(viewsets.ModelViewSet):
    queryset = PatientResource.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreatePatientResourceSerializer
        return PatientResourceSerializer
    
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
        
        # Filter by condition if provided
        condition_filter = self.request.query_params.get('condition')
        if condition_filter:
            queryset = queryset.filter(condition__icontains=condition_filter)
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured is not None:
            is_featured = featured.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search) |
                Q(condition__icontains=search) |
                Q(author__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single resource and track view"""
        instance = self.get_object()
        self.track_view(instance, request)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def track_view(self, resource, request):
        """Track a view for analytics"""
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Don't track if the same IP viewed this resource in the last hour
        recent_view = ResourceView.objects.filter(
            resource=resource,
            ip_address=ip_address,
            viewed_at__gte=timezone.now() - timedelta(hours=1)
        ).exists()
        
        if not recent_view:
            ResourceView.objects.create(
                resource=resource,
                ip_address=ip_address,
                user_agent=user_agent
            )
            resource.increment_view()
    
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
            file_path = os.path.join('resources', 'images', filename)
            
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
    
    @action(detail=False, methods=['post'])
    def upload_file(self, request):
        """Upload a file and return the URL"""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file size (limit to 50MB)
        if file.size > 50 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 50MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = os.path.splitext(file.name)[1].lower()
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('resources', 'files', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(file.read()))
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
                {'error': f'Failed to upload file: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get comprehensive resource analytics data"""
        # Basic counts
        total_resources = PatientResource.objects.count()
        draft_count = PatientResource.objects.filter(status='Draft').count()
        published_count = PatientResource.objects.filter(status='Published').count()
        archived_count = PatientResource.objects.filter(status='Archived').count()
        under_review_count = PatientResource.objects.filter(status='Under Review').count()
        
        # Download analytics
        total_downloads = ResourceDownload.objects.count()
        
        # Monthly downloads (downloads from the last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_downloads = ResourceDownload.objects.filter(
            downloaded_at__gte=thirty_days_ago
        ).count()
        
        # Additional analytics
        featured_count = PatientResource.objects.filter(is_featured=True).count()
        total_views = ResourceView.objects.count()
        
        # Resources by type
        resources_by_type = {
            'Guide': PatientResource.objects.filter(type='Guide').count(),
            'Video': PatientResource.objects.filter(type='Video').count(),
            'Audio': PatientResource.objects.filter(type='Audio').count(),
            'Checklist': PatientResource.objects.filter(type='Checklist').count(),
            'App': PatientResource.objects.filter(type='App').count(),
            'Website': PatientResource.objects.filter(type='Website').count(),
            'Infographic': PatientResource.objects.filter(type='Infographic').count(),
            'Handbook': PatientResource.objects.filter(type='Handbook').count(),
        }
        
        # Resources by condition
        resources_by_condition = {}
        conditions = PatientResource.objects.values_list('condition', flat=True).distinct()
        for condition in conditions:
            if condition:
                count = PatientResource.objects.filter(condition=condition).count()
                resources_by_condition[condition] = count
        
        # Top resources by download count
        top_resources = []
        resources_with_counts = PatientResource.objects.annotate(
            download_count_val=Count('download_records')
        ).filter(download_count_val__gt=0).order_by('-download_count_val')[:10]
        
        for resource in resources_with_counts:
            top_resources.append({
                'id': resource.id,
                'title': resource.title,
                'type': resource.type,
                'downloadCount': resource.download_count_val,
                'viewCount': resource.view_count
            })
        
        return Response({
            'total': total_resources,
            'draft': draft_count,
            'published': published_count,
            'archived': archived_count,
            'underReview': under_review_count,
            'totalDownloads': total_downloads,
            'monthlyDownloads': monthly_downloads,
            'featured': featured_count,
            'totalViews': total_views,
            'resourcesByType': resources_by_type,
            'resourcesByCondition': resources_by_condition,
            'topResources': top_resources,
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured resources"""
        featured_resources = PatientResource.objects.filter(
            is_featured=True, 
            status='Published'
        ).order_by('-created_at')[:10]
        
        serializer = self.get_serializer(featured_resources, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a resource"""
        resource = self.get_object()
        resource.toggle_featured()
        
        serializer = self.get_serializer(resource)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a resource"""
        resource = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Draft', 'Published', 'Archived', 'Under Review']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resource.status = new_status
        
        # Update last review date if status is changing to/from review
        if new_status == 'Under Review' or resource.status == 'Under Review':
            resource.last_review_date = timezone.now()
        
        resource.save()
        
        serializer = self.get_serializer(resource)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_download(self, request, pk=None):
        """Increment download count"""
        resource = self.get_object()
        
        # Track download
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        ResourceDownload.objects.create(
            resource=resource,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        resource.increment_download()
        
        return Response({
            'success': True,
            'downloadCount': resource.download_count
        })
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment view count"""
        resource = self.get_object()
        resource.increment_view()
        
        return Response({
            'success': True,
            'viewCount': resource.view_count
        })
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get distinct resource categories"""
        categories = PatientResource.objects.order_by('category').values_list('category', flat=True).distinct()
        return Response(list(categories))
    
    @action(detail=False, methods=['get'])
    def conditions(self, request):
        """Get distinct conditions"""
        conditions = PatientResource.objects.order_by('condition').values_list('condition', flat=True).distinct()
        return Response(list(conditions))
    
    @action(detail=False, methods=['get'])
    def languages(self, request):
        """Get distinct languages"""
        languages = ResourceLanguage.objects.order_by('language').values_list('language', flat=True).distinct()
        return Response(list(languages))
    
    @action(detail=False, methods=['get'])
    def target_audiences(self, request):
        """Get distinct target audiences"""
        audiences = ResourceAudience.objects.order_by('audience').values_list('audience', flat=True).distinct()
        return Response(list(audiences))
    
    @action(detail=False, methods=['get'])
    def age_groups(self, request):
        """Get distinct age groups"""
        age_groups = PatientResource.objects.order_by('age_group').values_list('age_group', flat=True).distinct()
        return Response(list(age_groups))