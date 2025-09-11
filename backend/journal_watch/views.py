from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import JournalArticle, JournalArticleView, JournalArticleDownload
from .serializers import (
    JournalArticleSerializer,
    JournalArticleAnalyticsSerializer,
    JournalArticleViewSerializer,
    JournalArticleDownloadSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import logging
import json
from django.db import transaction
import traceback
import re


logger = logging.getLogger(__name__)


class JournalArticleViewSet(viewsets.ModelViewSet):
    queryset = JournalArticle.objects.all().order_by('-created_at')
    serializer_class = JournalArticleSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'relevance', 'study_type']
    search_fields = ['title', 'authors', 'journal', 'summary', 'abstract', 'tags', 'key_findings']
    ordering_fields = ['created_at', 'updated_at', 'publication_date', 'download_count', 'view_count', 'title']
    ordering = ['-created_at']

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
                {'error': f'Failed to fetch journal articles: {str(e)}'},
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
                {'error': f'Failed to fetch journal article: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating journal article with data: {request.data}")
            
            # Process form data (convert camelCase to snake_case)
            processed_data = self.process_form_data(request.data)
            
            # Create article
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Journal article validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            article = serializer.save()
            logger.info(f"Journal article created with ID: {article.id}")

            # Return created article
            response_serializer = self.get_serializer(article)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating journal article: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create journal article: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.info(f"Updating journal article {instance.id} with data: {request.data}")
            
            # Process form data
            processed_data = self.process_form_data(request.data)
            
            # Update article
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Journal article update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            article = serializer.save()
            
            # Return updated article
            response_serializer = self.get_serializer(article)
            return Response(response_serializer.data)

        except Exception as e:
            logger.error(f"Error updating journal article: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update journal article: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data):
        """Process form data, handling camelCase to snake_case conversion and JSON fields"""
        processed_data = {}
        
        # Field mappings from frontend camelCase to backend snake_case
        field_mappings = {
            'keyFindings': 'key_findings',
            'studyType': 'study_type',
            'countryFocus': 'country_focus',
        }
        
        for key, value in data.items():
            # Convert camelCase to snake_case
            backend_key = field_mappings.get(key, self.camel_to_snake(key))
            
            # Handle JSON array fields
            if key in ['keyFindings', 'countryFocus', 'tags']:
                try:
                    if isinstance(value, str):
                        processed_data[backend_key] = json.loads(value)
                    elif isinstance(value, list):
                        processed_data[backend_key] = value
                    else:
                        processed_data[backend_key] = []
                except json.JSONDecodeError:
                    processed_data[backend_key] = []
            elif value is not None and value != '':
                # Handle regular fields
                processed_data[backend_key] = value
                
        return processed_data

    def camel_to_snake(self, name):
        """Convert camelCase to snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def track_view(self, request, article):
        """Track a view for analytics"""
        try:
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Create or get view record (unique per IP)
            view, created = JournalArticleView.objects.get_or_create(
                article=article,
                ip_address=ip_address,
                defaults={'user_agent': user_agent}
            )
            
            if created:
                # Increment view count
                article.view_count += 1
                article.save(update_fields=['view_count'])
                
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
        """Update article status"""
        try:
            article = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(JournalArticle.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            article.status = new_status
            article.save(update_fields=['status', 'updated_at'])
            
            serializer = self.get_serializer(article)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def increment_download(self, request, pk=None):
        """Increment download count and track download"""
        try:
            article = self.get_object()
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Track download
            JournalArticleDownload.objects.create(
                article=article,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Increment download count
            article.download_count += 1
            article.save(update_fields=['download_count'])
            
            return Response({'success': True, 'download_count': article.download_count})
            
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
            article = self.get_object()
            self.track_view(request, article)
            
            return Response({'success': True, 'view_count': article.view_count})
            
        except Exception as e:
            logger.error(f"Error incrementing view count: {str(e)}")
            return Response(
                {'error': f'Failed to increment view count: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get journal article analytics"""
        try:
            # Total articles
            total_articles = JournalArticle.objects.count()
            
            # Articles by status
            draft_count = JournalArticle.objects.filter(status='Draft').count()
            published_count = JournalArticle.objects.filter(status='Published').count()
            archived_count = JournalArticle.objects.filter(status='Archived').count()
            
            # Total downloads and views
            total_downloads = JournalArticle.objects.aggregate(
                total=Sum('download_count')
            )['total'] or 0
            
            total_views = JournalArticle.objects.aggregate(
                total=Sum('view_count')
            )['total'] or 0
            
            # Monthly stats (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            monthly_downloads = JournalArticleDownload.objects.filter(
                downloaded_at__gte=thirty_days_ago
            ).count()
            
            monthly_views = JournalArticleView.objects.filter(
                viewed_at__gte=thirty_days_ago
            ).count()
            
            # Articles by study type
            articles_by_study_type = dict(
                JournalArticle.objects.values_list('study_type')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Articles by country (flatten the JSON field)
            articles_by_country = {}
            for article in JournalArticle.objects.all():
                if isinstance(article.country_focus, list):
                    for country in article.country_focus:
                        if country:
                            articles_by_country[country] = articles_by_country.get(country, 0) + 1
            
            # Top articles by views and downloads
            top_articles = list(
                JournalArticle.objects.order_by('-view_count', '-download_count')[:10]
                .values('id', 'title', 'study_type', 'view_count', 'download_count')
            )
            
            analytics_data = {
                'total': total_articles,
                'total_views': total_views,
                'total_downloads': total_downloads,
                'monthly_views': monthly_views,
                'monthly_downloads': monthly_downloads,
                'published': published_count,
                'draft': draft_count,
                'archived': archived_count,
                'articles_by_study_type': articles_by_study_type,
                'articles_by_country': articles_by_country,
                'top_articles': top_articles,
            }
            
            serializer = JournalArticleAnalyticsSerializer(data=analytics_data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching analytics: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch analytics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def study_types(self, request):
        """Get all unique study types"""
        try:
            study_types = JournalArticle.objects.values_list('study_type', flat=True).distinct()
            study_types_list = [st for st in study_types if st]  # Filter out empty study types
            return Response(study_types_list)
            
        except Exception as e:
            logger.error(f"Error fetching study types: {str(e)}")
            return Response(
                {'error': f'Failed to fetch study types: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def countries(self, request):
        """Get all unique countries from country_focus"""
        try:
            # Get all countries from all articles
            all_countries = []
            for article in JournalArticle.objects.all():
                if isinstance(article.country_focus, list):
                    all_countries.extend(article.country_focus)
            
            # Remove duplicates and empty values
            unique_countries = list(set([country for country in all_countries if country]))
            return Response(sorted(unique_countries))
            
        except Exception as e:
            logger.error(f"Error fetching countries: {str(e)}")
            return Response(
                {'error': f'Failed to fetch countries: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def tags(self, request):
        """Get all unique tags"""
        try:
            # Get all tags from all articles
            all_tags = []
            for article in JournalArticle.objects.all():
                if isinstance(article.tags, list):
                    all_tags.extend(article.tags)
            
            # Remove duplicates and empty values
            unique_tags = list(set([tag for tag in all_tags if tag]))
            return Response(sorted(unique_tags))
            
        except Exception as e:
            logger.error(f"Error fetching tags: {str(e)}")
            return Response(
                {'error': f'Failed to fetch tags: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )