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
from .models import NewsItem, NewsView
from .serializers import NewsItemSerializer, CreateNewsSerializer

class NewsViewSet(viewsets.ModelViewSet):
    queryset = NewsItem.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateNewsSerializer
        return NewsItemSerializer
    
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
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(introduction__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured is not None:
            is_featured = featured.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        
        return queryset.order_by('-created_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single news item and increment view count"""
        instance = self.get_object()
        
        # Track view
        self.track_view(instance, request)
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def track_view(self, news_item, request):
        """Track a view for analytics"""
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Don't track if the same IP viewed this news in the last hour
        recent_view = NewsView.objects.filter(
            news_item=news_item,
            ip_address=ip_address,
            viewed_at__gte=timezone.now() - timedelta(hours=1)
        ).exists()
        
        if not recent_view:
            NewsView.objects.create(
                news_item=news_item,
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
        
        # Validate file size (optional - limit to 10MB)
        if image.size > 10 * 1024 * 1024:  # 10MB
            return Response(
                {'error': 'File size too large. Maximum size is 10MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('news', 'images', filename)
            
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
    def upload_author_image(self, request):
        """Upload an author image and return the URL"""
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
        
        # Validate file size (optional - limit to 10MB)
        if image.size > 10 * 1024 * 1024:  # 10MB
            return Response(
                {'error': 'File size too large. Maximum size is 10MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('authors', 'images', filename)
            
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
        """Get news analytics data"""
        # Basic counts
        total_news = NewsItem.objects.count()
        published_count = NewsItem.objects.filter(status='Published').count()
        draft_count = NewsItem.objects.filter(status='Draft').count()
        archived_count = NewsItem.objects.filter(status='Archived').count()
        
        # View analytics
        total_views = NewsItem.objects.aggregate(total=Sum('views'))['total'] or 0
        
        # Monthly views (views from news published in the last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_views = NewsItem.objects.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('views'))['total'] or 0
        
        # Additional analytics
        featured_count = NewsItem.objects.filter(is_featured=True).count()
        
        return Response({
            'total': total_news,
            'published': published_count,
            'drafts': draft_count,
            'archived': archived_count,
            'totalViews': total_views,
            'monthlyViews': monthly_views,
            'featured': featured_count,
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured news items"""
        featured_news = NewsItem.objects.filter(
            is_featured=True, 
            status='Published'
        ).order_by('-created_at')[:10]
        
        serializer = self.get_serializer(featured_news, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a news item"""
        news_item = self.get_object()
        news_item.is_featured = not news_item.is_featured
        news_item.save()
        
        serializer = self.get_serializer(news_item)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a news item"""
        news_item = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Draft', 'Published', 'Archived']:
            return Response(
                {'error': 'Invalid status. Must be Draft, Published, or Archived'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        news_item.status = new_status
        news_item.save()
        
        serializer = self.get_serializer(news_item)
        return Response(serializer.data)