from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import EBooklet, EBookletView, EBookletDownload
from .serializers import (
    EBookletSerializer,
    EBookletAnalyticsSerializer,
    EBookletViewSerializer,
    EBookletDownloadSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import logging
import uuid
import json
from django.core.files.base import ContentFile
from django.db import transaction
from django.http import JsonResponse
import traceback
from django.core.files.storage import default_storage
import os
import re

logger = logging.getLogger(__name__)


class EBookletViewSet(viewsets.ModelViewSet):
    queryset = EBooklet.objects.all().order_by('-created_at')
    serializer_class = EBookletSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'is_featured', 'language']
    search_fields = ['title', 'description', 'abstract', 'authors', 'keywords', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'publication_date', 'download_count', 'view_count', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured status
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            is_featured = featured.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_featured=is_featured)
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list to handle any specific frontend requirements"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in list view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch e-booklets: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to track views"""
        try:
            instance = self.get_object()
            
            # Track view if not already tracked by this IP
            self.track_view(request, instance)
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in retrieve view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch e-booklet: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating e-booklet with data: {request.data}")
            
            # Extract and process form data
            processed_data = self.process_form_data(request.data)
            
            # Create e-booklet
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"E-booklet validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            ebooklet = serializer.save()
            logger.info(f"E-booklet created with ID: {ebooklet.id}")

            # Return created e-booklet
            response_serializer = self.get_serializer(ebooklet)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating e-booklet: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create e-booklet: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.info(f"Updating e-booklet {instance.id} with data: {request.data}")
            
            # Process form data
            processed_data = self.process_form_data(request.data)
            
            # Update e-booklet
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"E-booklet update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            ebooklet = serializer.save()
            
            # Return updated e-booklet
            response_serializer = self.get_serializer(ebooklet)
            return Response(response_serializer.data)

        except Exception as e:
            logger.error(f"Error updating e-booklet: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update e-booklet: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data):
        """Process form data, handling files and JSON fields"""
        processed_data = {}
        
        for key, value in data.items():
            if key in ['image', 'file']:
                # Handle file uploads directly
                processed_data[key] = value
            elif key in ['authors', 'targetAudience', 'fileFormats', 'tableOfContents', 'keywords', 'tags']:
                # Handle JSON array fields
                try:
                    if isinstance(value, str):
                        processed_data[self.snake_case(key)] = json.loads(value)
                    else:
                        processed_data[self.snake_case(key)] = value
                except json.JSONDecodeError:
                    processed_data[self.snake_case(key)] = []
            elif key in ['isFeatured']:
                # Handle boolean fields
                processed_data[self.snake_case(key)] = str(value).lower() in ['true', '1', 'yes'] if isinstance(value, str) else bool(value)
            elif key == 'pages':
                # Handle integer fields
                try:
                    processed_data[key] = int(value) if value else 0
                except (ValueError, TypeError):
                    processed_data[key] = 0
            elif value is not None and value != '':
                # Handle regular fields
                processed_data[self.snake_case(key)] = value
                
        return processed_data

    def snake_case(self, camel_str):
        """Convert camelCase to snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def track_view(self, request, ebooklet):
        """Track a view for analytics"""
        try:
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Create or get view record (unique per IP)
            view, created = EBookletView.objects.get_or_create(
                ebooklet=ebooklet,
                ip_address=ip_address,
                defaults={'user_agent': user_agent}
            )
            
            if created:
                # Increment view count
                ebooklet.view_count += 1
                ebooklet.save(update_fields=['view_count'])
                
        except Exception as e:
            logger.error(f"Error tracking view: {str(e)}")

    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update e-booklet status"""
        try:
            ebooklet = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(EBooklet.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            ebooklet.status = new_status
            ebooklet.save(update_fields=['status', 'updated_at'])
            
            serializer = self.get_serializer(ebooklet)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of e-booklet"""
        try:
            ebooklet = self.get_object()
            ebooklet.is_featured = not ebooklet.is_featured
            ebooklet.save(update_fields=['is_featured', 'updated_at'])
            
            serializer = self.get_serializer(ebooklet)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error toggling featured status: {str(e)}")
            return Response(
                {'error': f'Failed to toggle featured status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def increment_download(self, request, pk=None):
        """Increment download count and track download"""
        try:
            ebooklet = self.get_object()
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Track download
            EBookletDownload.objects.create(
                ebooklet=ebooklet,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Increment download count
            ebooklet.download_count += 1
            ebooklet.save(update_fields=['download_count'])
            
            return Response({'success': True, 'download_count': ebooklet.download_count})
            
        except Exception as e:
            logger.error(f"Error incrementing download count: {str(e)}")
            return Response(
                {'error': f'Failed to increment download count: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Manually increment view count"""
        try:
            ebooklet = self.get_object()
            self.track_view(request, ebooklet)
            
            return Response({'success': True, 'view_count': ebooklet.view_count})
            
        except Exception as e:
            logger.error(f"Error incrementing view count: {str(e)}")
            return Response(
                {'error': f'Failed to increment view count: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured e-booklets"""
        try:
            queryset = self.get_queryset().filter(is_featured=True, status='Published')
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching featured e-booklets: {str(e)}")
            return Response(
                {'error': f'Failed to fetch featured e-booklets: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get e-booklet analytics"""
        try:
            # Total e-booklets
            total_ebooklets = EBooklet.objects.count()
            
            # E-booklets by status
            draft_count = EBooklet.objects.filter(status='Draft').count()
            published_count = EBooklet.objects.filter(status='Published').count()
            archived_count = EBooklet.objects.filter(status='Archived').count()
            featured_count = EBooklet.objects.filter(is_featured=True).count()
            
            # Total downloads and views
            total_downloads = EBooklet.objects.aggregate(
                total=Sum('download_count')
            )['total'] or 0
            
            total_views = EBooklet.objects.aggregate(
                total=Sum('view_count')
            )['total'] or 0
            
            # Monthly downloads (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            monthly_downloads = EBookletDownload.objects.filter(
                downloaded_at__gte=thirty_days_ago
            ).count()
            
            # E-booklets by category
            ebooklets_by_category = dict(
                EBooklet.objects.values_list('category')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Top e-booklets by downloads
            top_ebooklets = list(
                EBooklet.objects.order_by('-download_count')[:10]
                .values('id', 'title', 'category', 'download_count', 'view_count')
            )
            
            analytics_data = {
                'total': total_ebooklets,
                'draft': draft_count,
                'published': published_count,
                'archived': archived_count,
                'featured': featured_count,
                'total_downloads': total_downloads,
                'monthly_downloads': monthly_downloads,
                'total_views': total_views,
                'ebooklets_by_category': ebooklets_by_category,
                'top_ebooklets': top_ebooklets,
            }
            
            serializer = EBookletAnalyticsSerializer(data=analytics_data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching analytics: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch analytics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            file_path = os.path.join('ebooklets', 'images', filename)
            
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
        """Upload an e-booklet file and return the URL"""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file type
        allowed_extensions = ['.pdf', '.epub', '.mobi']
        file_extension = os.path.splitext(file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {'error': 'Invalid file type. Allowed types: pdf, epub, mobi'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (limit to 50MB)
        if file.size > 50 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 50MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join('ebooklets', 'files', filename)
            
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
    def categories(self, request):
        """Get all unique categories"""
        try:
            categories = EBooklet.objects.values_list('category', flat=True).distinct()
            categories_list = [cat for cat in categories if cat]  # Filter out empty categories
            return Response(categories_list)
            
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return Response(
                {'error': f'Failed to fetch categories: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def target_audiences(self, request):
        """Get all unique target audiences"""
        try:
            # Get all target audiences from all e-booklets
            all_audiences = []
            for ebooklet in EBooklet.objects.all():
                if isinstance(ebooklet.target_audience, list):
                    all_audiences.extend(ebooklet.target_audience)
            
            # Remove duplicates and empty values
            unique_audiences = list(set([aud for aud in all_audiences if aud]))
            return Response(unique_audiences)
            
        except Exception as e:
            logger.error(f"Error fetching target audiences: {str(e)}")
            return Response(
                {'error': f'Failed to fetch target audiences: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def authors(self, request):
        """Get all unique authors"""
        try:
            # Get all authors from all e-booklets
            all_authors = []
            for ebooklet in EBooklet.objects.all():
                if isinstance(ebooklet.authors, list):
                    all_authors.extend(ebooklet.authors)
            
            # Remove duplicates and empty values
            unique_authors = list(set([auth for auth in all_authors if auth]))
            return Response(unique_authors)
            
        except Exception as e:
            logger.error(f"Error fetching authors: {str(e)}")
            return Response(
                {'error': f'Failed to fetch authors: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )