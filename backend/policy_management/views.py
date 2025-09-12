from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import PolicyBelief, PositionalStatement, ContentView, ContentDownload
from .serializers import (
    PolicyBeliefSerializer,
    PositionalStatementSerializer,
    ContentAnalyticsSerializer,
    ContentViewSerializer,
    ContentDownloadSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import logging
import json
from django.db import transaction
import traceback
import re


logger = logging.getLogger(__name__)


class ContentViewSet(viewsets.ViewSet):
    """
    Combined ViewSet for handling both PolicyBelief and PositionalStatement content
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset_and_serializer(self, content_type=None):
        """Helper to get appropriate queryset and serializer based on content type"""
        if content_type == 'PolicyBelief':
            return PolicyBelief.objects.all().order_by('-created_at'), PolicyBeliefSerializer
        elif content_type == 'PositionalStatement':
            return PositionalStatement.objects.all().order_by('-created_at'), PositionalStatementSerializer
        else:
            # Return combined queryset for general listing
            policy_beliefs = PolicyBelief.objects.all()
            statements = PositionalStatement.objects.all()
            return None, None

    def list(self, request):
        """List all content with filtering support"""
        try:
            content_type = request.query_params.get('type')
            status_filter = request.query_params.get('status')
            category_filter = request.query_params.get('category')
            search_filter = request.query_params.get('search')

            results = []

            # Handle PolicyBelief
            if not content_type or content_type == 'PolicyBelief':
                queryset = PolicyBelief.objects.all().order_by('-created_at')
                
                # Apply filters
                if status_filter:
                    queryset = queryset.filter(status=status_filter)
                if category_filter:
                    queryset = queryset.filter(category=category_filter)
                if search_filter:
                    queryset = queryset.filter(
                        Q(title__icontains=search_filter) |
                        Q(summary__icontains=search_filter) |
                        Q(tags__icontains=search_filter)
                    )
                
                serializer = PolicyBeliefSerializer(queryset, many=True, context={'request': request})
                results.extend(serializer.data)

            # Handle PositionalStatement
            if not content_type or content_type == 'PositionalStatement':
                queryset = PositionalStatement.objects.all().order_by('-created_at')
                
                # Apply filters
                if status_filter:
                    queryset = queryset.filter(status=status_filter)
                if category_filter:
                    queryset = queryset.filter(category=category_filter)
                if search_filter:
                    queryset = queryset.filter(
                        Q(title__icontains=search_filter) |
                        Q(summary__icontains=search_filter) |
                        Q(tags__icontains=search_filter)
                    )
                
                serializer = PositionalStatementSerializer(queryset, many=True, context={'request': request})
                results.extend(serializer.data)

            # Sort results by created_at descending
            results.sort(key=lambda x: x['createdAt'], reverse=True)
            
            return Response(results)

        except Exception as e:
            logger.error(f"Error in list view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch content: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """Retrieve specific content item"""
        try:
            # Try PolicyBelief first
            try:
                instance = PolicyBelief.objects.get(pk=pk)
                self.track_view(request, 'PolicyBelief', instance.id)
                serializer = PolicyBeliefSerializer(instance, context={'request': request})
                return Response(serializer.data)
            except PolicyBelief.DoesNotExist:
                pass

            # Try PositionalStatement
            try:
                instance = PositionalStatement.objects.get(pk=pk)
                self.track_view(request, 'PositionalStatement', instance.id)
                serializer = PositionalStatementSerializer(instance, context={'request': request})
                return Response(serializer.data)
            except PositionalStatement.DoesNotExist:
                pass

            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            logger.error(f"Error in retrieve view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Failed to fetch content: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request):
        """Create new content item"""
        try:
            logger.info(f"Creating content with files: image={bool(request.FILES.get('image'))}")
            
            # Process form data including files
            processed_data = self.process_form_data(request.data, request.FILES)
            content_type = processed_data.get('type')

            if content_type == 'PolicyBelief':
                serializer = PolicyBeliefSerializer(data=processed_data, context={'request': request})
            elif content_type == 'PositionalStatement':
                serializer = PositionalStatementSerializer(data=processed_data, context={'request': request})
            else:
                return Response(
                    {'error': 'Content type is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not serializer.is_valid():
                logger.error(f"Content validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            instance = serializer.save()
            logger.info(f"Content created with ID: {instance.id}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating content: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create content: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, pk=None):
        """Update existing content item"""
        try:
            logger.info(f"Updating content {pk} with data: {request.data}")
            
            # Process form data
            processed_data = self.process_form_data(request.data, request.FILES)

            # Find the instance
            instance = None
            serializer_class = None
            
            try:
                instance = PolicyBelief.objects.get(pk=pk)
                serializer_class = PolicyBeliefSerializer
            except PolicyBelief.DoesNotExist:
                try:
                    instance = PositionalStatement.objects.get(pk=pk)
                    serializer_class = PositionalStatementSerializer
                except PositionalStatement.DoesNotExist:
                    return Response(
                        {'error': 'Content not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

            serializer = serializer_class(instance, data=processed_data, partial=True, context={'request': request})
            
            if not serializer.is_valid():
                logger.error(f"Content update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            instance = serializer.save()
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error updating content: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update content: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, pk=None):
        """Delete content item"""
        try:
            # Try to find and delete from either model
            deleted = False
            
            try:
                instance = PolicyBelief.objects.get(pk=pk)
                instance.delete()
                deleted = True
            except PolicyBelief.DoesNotExist:
                try:
                    instance = PositionalStatement.objects.get(pk=pk)
                    instance.delete()
                    deleted = True
                except PositionalStatement.DoesNotExist:
                    pass

            if deleted:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(
                    {'error': 'Content not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        except Exception as e:
            logger.error(f"Error deleting content: {str(e)}")
            return Response(
                {'error': f'Failed to delete content: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data, files=None):
        """Process form data, handling camelCase to snake_case conversion and JSON fields"""
        processed_data = {}
        
        # Field mappings from frontend camelCase to backend snake_case
        field_mapping = {
            'targetAudience': 'target_audience',
            'keyRecommendations': 'key_recommendations',
            'keyPoints': 'key_points',
            'countryFocus': 'country_focus',
            'relatedPolicies': 'related_policies',
            'pageCount': 'page_count',
            'imageUrl': 'image_url',
        }
        
        # Process form data
        for key, value in data.items():
            # Map frontend field names to backend field names
            backend_key = field_mapping.get(key, key)
            
            # Handle JSON array fields
            if backend_key in ['target_audience', 'key_recommendations', 'key_points', 
                              'country_focus', 'related_policies', 'tags', 'region']:
                try:
                    if isinstance(value, str):
                        processed_data[backend_key] = json.loads(value)
                    elif isinstance(value, list):
                        processed_data[backend_key] = value
                    else:
                        processed_data[backend_key] = []
                except json.JSONDecodeError:
                    processed_data[backend_key] = []
            # Handle regular fields
            elif value is not None and value != '':
                processed_data[backend_key] = value

        # Handle file uploads
        if files and 'image' in files:
            processed_data['image'] = files['image']
        
        return processed_data

    def camel_to_snake(self, name):
        """Convert camelCase to snake_case"""
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

    def track_view(self, request, content_type, content_id):
        """Track content view"""
        try:
            ContentView.objects.create(
                content_type=content_type,
                content_id=content_id,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
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

    # ========== METADATA ENDPOINTS ==========

    # REMOVED: categories, target_audience_options, regions, and countries endpoints
    # since they are now hardcoded on the frontend

    @action(detail=False, methods=['get'])
    def tags(self, request):
        """Get all unique tags"""
        try:
            policy_tags = set()
            statement_tags = set()
            
            # Get tags from PolicyBelief
            policy_beliefs = PolicyBelief.objects.all()
            for policy in policy_beliefs:
                if policy.tags:
                    policy_tags.update(policy.tags)
            
            # Get tags from PositionalStatement
            statements = PositionalStatement.objects.all()
            for statement in statements:
                if statement.tags:
                    statement_tags.update(statement.tags)
            
            all_tags = policy_tags | statement_tags
            return Response(sorted(all_tags))
        except Exception as e:
            logger.error(f"Error fetching tags: {str(e)}")
            return Response(
                {'error': 'Failed to fetch tags'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get content analytics"""
        try:
            # Total counts
            total_policy = PolicyBelief.objects.count()
            total_statement = PositionalStatement.objects.count()
            total = total_policy + total_statement
            
            # Status breakdown
            published_policy = PolicyBelief.objects.filter(status='Published').count()
            draft_policy = PolicyBelief.objects.filter(status='Draft').count()
            archived_policy = PolicyBelief.objects.filter(status='Archived').count()
            
            published_statement = PositionalStatement.objects.filter(status='Published').count()
            draft_statement = PositionalStatement.objects.filter(status='Draft').count()
            archived_statement = PositionalStatement.objects.filter(status='Archived').count()
            
            published = published_policy + published_statement
            draft = draft_policy + draft_statement
            archived = archived_policy + archived_statement
            
            # View and download counts - FIXED: Use proper sum calculation
            policy_views = PolicyBelief.objects.aggregate(total=Sum('view_count'))['total'] or 0
            statement_views = PositionalStatement.objects.aggregate(total=Sum('view_count'))['total'] or 0
            total_views = policy_views + statement_views
            
            policy_downloads = PolicyBelief.objects.aggregate(total=Sum('download_count'))['total'] or 0
            statement_downloads = PositionalStatement.objects.aggregate(total=Sum('download_count'))['total'] or 0
            total_downloads = policy_downloads + statement_downloads
            
            # Monthly views and downloads (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            monthly_views = ContentView.objects.filter(
                viewed_at__gte=thirty_days_ago
            ).count()
            
            monthly_downloads = ContentDownload.objects.filter(
                downloaded_at__gte=thirty_days_ago
            ).count()
            
            # Content by category
            content_by_category = {}
            
            # Policy beliefs by category
            policy_categories = PolicyBelief.objects.values('category').annotate(count=Count('id'))
            for item in policy_categories:
                content_by_category[item['category']] = item['count']
            
            # Positional statements by category
            statement_categories = PositionalStatement.objects.values('category').annotate(count=Count('id'))
            for item in statement_categories:
                if item['category'] in content_by_category:
                    content_by_category[item['category']] += item['count']
                else:
                    content_by_category[item['category']] = item['count']
            
            # Top content by views
            top_policy = PolicyBelief.objects.order_by('-view_count')[:5]
            top_statement = PositionalStatement.objects.order_by('-view_count')[:5]
            
            top_content = []
            for item in top_policy:
                serializer = PolicyBeliefSerializer(item, context={'request': request})
                top_content.append(serializer.data)
            
            for item in top_statement:
                serializer = PositionalStatementSerializer(item, context={'request': request})
                top_content.append(serializer.data)
            
            # Sort by view count descending
            top_content.sort(key=lambda x: x['viewCount'], reverse=True)
            top_content = top_content[:5]  # Take top 5
            
            analytics_data = {
                'total': total,
                'published': published,
                'draft': draft,
                'archived': archived,
                'total_views': total_views,
                'total_downloads': total_downloads,
                'monthly_views': monthly_views,
                'monthly_downloads': monthly_downloads,
                'content_by_category': content_by_category,
                'top_content': top_content,
            }
            
            serializer = ContentAnalyticsSerializer(analytics_data)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching analytics: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch analytics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update content status"""
        try:
            status = request.data.get('status')
            if status not in ['Published', 'Draft', 'Archived']:
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find the instance
            instance = None
            serializer_class = None
            
            try:
                instance = PolicyBelief.objects.get(pk=pk)
                serializer_class = PolicyBeliefSerializer
            except PolicyBelief.DoesNotExist:
                try:
                    instance = PositionalStatement.objects.get(pk=pk)
                    serializer_class = PositionalStatementSerializer
                except PositionalStatement.DoesNotExist:
                    return Response(
                        {'error': 'Content not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            instance.status = status
            instance.save()
            
            serializer = serializer_class(instance, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def increment_download(self, request, pk=None):
        """Increment download count"""
        try:
            content_type = request.data.get('content_type')
            
            if content_type == 'PolicyBelief':
                try:
                    instance = PolicyBelief.objects.get(pk=pk)
                    instance.download_count += 1
                    instance.save()
                    
                    # Track download
                    ContentDownload.objects.create(
                        content_type='PolicyBelief',
                        content_id=pk,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                    
                    return Response({'success': True})
                except PolicyBelief.DoesNotExist:
                    return Response(
                        {'error': 'Policy belief not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                    
            elif content_type == 'PositionalStatement':
                try:
                    instance = PositionalStatement.objects.get(pk=pk)
                    instance.download_count += 1
                    instance.save()
                    
                    # Track download
                    ContentDownload.objects.create(
                        content_type='PositionalStatement',
                        content_id=pk,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                    
                    return Response({'success': True})
                except PositionalStatement.DoesNotExist:
                    return Response(
                        {'error': 'Positional statement not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                return Response(
                    {'error': 'Invalid content type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error incrementing download: {str(e)}")
            return Response(
                {'error': f'Failed to increment download: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment view count"""
        try:
            content_type = request.data.get('content_type')
            
            if content_type == 'PolicyBelief':
                try:
                    instance = PolicyBelief.objects.get(pk=pk)
                    instance.view_count += 1
                    instance.save()
                    return Response({'success': True})
                except PolicyBelief.DoesNotExist:
                    return Response(
                        {'error': 'Policy belief not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                    
            elif content_type == 'PositionalStatement':
                try:
                    instance = PositionalStatement.objects.get(pk=pk)
                    instance.view_count += 1
                    instance.save()
                    return Response({'success': True})
                except PositionalStatement.DoesNotExist:
                    return Response(
                        {'error': 'Positional statement not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                return Response(
                    {'error': 'Invalid content type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error incrementing view: {str(e)}")
            return Response(
                {'error': f'Failed to increment view: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )