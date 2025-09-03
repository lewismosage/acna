from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import Publication, PublicationView, PublicationDownload
from .serializers import (
    PublicationSerializer,
    PublicationAnalyticsSerializer,
    PublicationViewSerializer,
    PublicationDownloadSerializer
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


class PublicationViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all().order_by('-created_at')
    serializer_class = PublicationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'type', 'access_type', 'is_featured', 'language']
    search_fields = ['title', 'excerpt', 'abstract', 'full_content', 'authors', 'keywords', 'tags', 'journal']
    ordering_fields = ['created_at', 'updated_at', 'date', 'downloads', 'view_count', 'title', 'citation_count']
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
                {'error': f'Failed to fetch publications: {str(e)}'},
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
                {'error': f'Failed to fetch publication: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating publication with data: {request.data}")
            
            # Extract and process form data
            processed_data = self.process_form_data(request.data)
            
            # Create publication
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Publication validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            publication = serializer.save()
            logger.info(f"Publication created with ID: {publication.id}")

            # Return created publication
            response_serializer = self.get_serializer(publication)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating publication: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create publication: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.info(f"Updating publication {instance.id} with data: {request.data}")
            
            # Process form data
            processed_data = self.process_form_data(request.data)
            
            # Update publication
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Publication update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            publication = serializer.save()
            
            # Return updated publication
            response_serializer = self.get_serializer(publication)
            return Response(response_serializer.data)

        except Exception as e:
            logger.error(f"Error updating publication: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update publication: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data):
        """Process form data, handling files and JSON fields"""
        processed_data = {}
        
        for key, value in data.items():
            if key == 'image':
                # Handle image upload directly
                processed_data[key] = value
            elif key in ['authors', 'targetAudience', 'tags', 'keywords']:
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
            elif value is not None and value != '':
                # Handle regular fields
                processed_data[self.snake_case(key)] = value
                
        return processed_data

    def snake_case(self, camel_str):
        """Convert camelCase to snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def track_view(self, request, publication):
        """Track a view for analytics"""
        try:
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Create or get view record (unique per IP)
            view, created = PublicationView.objects.get_or_create(
                publication=publication,
                ip_address=ip_address,
                defaults={'user_agent': user_agent}
            )
            
            if created:
                # Increment view count
                publication.view_count += 1
                publication.save(update_fields=['view_count'])
                
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
        """Update publication status"""
        try:
            publication = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(Publication.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            publication.status = new_status
            publication.save(update_fields=['status', 'updated_at'])
            
            serializer = self.get_serializer(publication)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of publication"""
        try:
            publication = self.get_object()
            publication.is_featured = not publication.is_featured
            publication.save(update_fields=['is_featured', 'updated_at'])
            
            serializer = self.get_serializer(publication)
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
            publication = self.get_object()
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Track download
            PublicationDownload.objects.create(
                publication=publication,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Increment download count
            publication.downloads += 1
            publication.save(update_fields=['downloads'])
            
            return Response({'success': True, 'downloads': publication.downloads})
            
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
            publication = self.get_object()
            self.track_view(request, publication)
            
            return Response({'success': True, 'view_count': publication.view_count})
            
        except Exception as e:
            logger.error(f"Error incrementing view count: {str(e)}")
            return Response(
                {'error': f'Failed to increment view count: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured publications"""
        try:
            queryset = self.get_queryset().filter(is_featured=True, status='Published')
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching featured publications: {str(e)}")
            return Response(
                {'error': f'Failed to fetch featured publications: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get publication analytics"""
        try:
            # Total publications
            total_publications = Publication.objects.count()
            
            # Publications by status
            draft_count = Publication.objects.filter(status='Draft').count()
            published_count = Publication.objects.filter(status='Published').count()
            archived_count = Publication.objects.filter(status='Archived').count()
            featured_count = Publication.objects.filter(is_featured=True).count()
            
            # Total downloads, views, and citations
            total_downloads = Publication.objects.aggregate(
                total=Sum('downloads')
            )['total'] or 0
            
            total_views = Publication.objects.aggregate(
                total=Sum('view_count')
            )['total'] or 0
            
            total_citations = Publication.objects.aggregate(
                total=Sum('citation_count')
            )['total'] or 0
            
            # Monthly downloads (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            monthly_downloads = PublicationDownload.objects.filter(
                downloaded_at__gte=thirty_days_ago
            ).count()
            
            # Publications by category
            publications_by_category = dict(
                Publication.objects.values_list('category')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Publications by type
            publications_by_type = dict(
                Publication.objects.values_list('type')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Top publications by downloads
            top_publications = list(
                Publication.objects.order_by('-downloads')[:10]
                .values('id', 'title', 'category', 'type', 'downloads', 'view_count', 'citation_count')
            )
            
            analytics_data = {
                'total': total_publications,
                'draft': draft_count,
                'published': published_count,
                'archived': archived_count,
                'featured': featured_count,
                'total_downloads': total_downloads,
                'monthly_downloads': monthly_downloads,
                'total_views': total_views,
                'total_citations': total_citations,
                'publications_by_category': publications_by_category,
                'publications_by_type': publications_by_type,
                'top_publications': top_publications,
            }
            
            serializer = PublicationAnalyticsSerializer(data=analytics_data)
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
            file_path = os.path.join('publications', 'images', filename)
            
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
    def categories(self, request):
        """Get all unique categories"""
        try:
            categories = Publication.objects.values_list('category', flat=True).distinct()
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
            # Get all target audiences from all publications
            all_audiences = []
            for publication in Publication.objects.all():
                if isinstance(publication.target_audience, list):
                    all_audiences.extend(publication.target_audience)
            
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
            # Get all authors from all publications
            all_authors = []
            for publication in Publication.objects.all():
                if isinstance(publication.authors, list):
                    for author in publication.authors:
                        if isinstance(author, dict) and author.get('name'):
                            all_authors.append(author['name'])
            
            # Remove duplicates and empty values
            unique_authors = list(set([auth for auth in all_authors if auth]))
            return Response(unique_authors)
            
        except Exception as e:
            logger.error(f"Error fetching authors: {str(e)}")
            return Response(
                {'error': f'Failed to fetch authors: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )