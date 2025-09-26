from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import EducationalResource, CaseStudySubmission, ResourceView, ResourceDownload
from .serializers import (
    EducationalResourceSerializer,
    CaseStudySubmissionSerializer,
    ResourceAnalyticsSerializer,
    ResourceViewSerializer,
    ResourceDownloadSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
import logging
import uuid
import json
from django.core.files.base import ContentFile
from django.db import transaction
import traceback
from django.core.files.storage import default_storage
import os
import re

logger = logging.getLogger(__name__)


class EducationalResourceViewSet(viewsets.ModelViewSet):
    queryset = EducationalResource.objects.all().order_by('-created_at')
    serializer_class = EducationalResourceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'resource_type', 'is_featured', 'difficulty']
    search_fields = ['title', 'description', 'full_description', 'author', 'tags', 'target_audience']
    ordering_fields = ['created_at', 'updated_at', 'publication_date', 'download_count', 'view_count', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured status
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            is_featured = featured.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_featured=is_featured)
        
        # Filter by free status
        free = self.request.query_params.get('free', None)
        if free is not None:
            is_free = free.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_free=is_free)
        
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
                {'error': f'Failed to fetch resources: {str(e)}'},
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
                {'error': f'Failed to fetch resource: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating resource with files: image={bool(request.FILES.get('image'))}, file={bool(request.FILES.get('file'))}")
            logger.info(f"Form data keys: {list(request.data.keys())}")
            
            # Process form data
            processed_data = self.process_form_data(request.data, request.FILES)
            logger.info(f"Processed data keys: {list(processed_data.keys())}")
            
            # Create resource
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Resource validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            resource = serializer.save()
            logger.info(f"Resource created with ID: {resource.id}")

            # Return created resource with context for URLs
            response_serializer = self.get_serializer(resource, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating resource: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create resource: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.info(f"Updating resource {instance.id} with files: image={bool(request.FILES.get('image'))}, file={bool(request.FILES.get('file'))}")
            logger.info(f"Form data keys: {list(request.data.keys())}")
            
            # Process form data
            processed_data = self.process_form_data(request.data, request.FILES)
            logger.info(f"Processed update data keys: {list(processed_data.keys())}")
            
            # Update resource
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Resource update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            resource = serializer.save()
            logger.info(f"Resource {resource.id} updated successfully")
            
            # Return updated resource with context for URLs
            response_serializer = self.get_serializer(resource, context={'request': request})
            return Response(response_serializer.data)

        except Exception as e:
            logger.error(f"Error updating resource: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update resource: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, form_data, files):
        """Process form data, handling files and JSON fields properly"""
        processed_data = {}
        
        # Field mapping from frontend camelCase to backend snake_case
        field_mapping = {
            'fullDescription': 'full_description',
            'isFeatured': 'is_featured',
            'isFree': 'is_free',
            'imageUrl': 'image_url',
            'fileUrl': 'file_url',
            'videoUrl': 'video_url',
            'externalUrl': 'external_url',
            'targetAudience': 'target_audience',
            'relatedConditions': 'related_conditions',
            'learningObjectives': 'learning_objectives',
            'ageGroup': 'age_group',
            'fileSize': 'file_size',
            'fileFormat': 'file_format',
            'reviewedBy': 'reviewed_by',
            'impactStatement': 'impact_statement',
            'downloadCount': 'download_count',
            'viewCount': 'view_count',
            'publicationDate': 'publication_date',
            'type': 'resource_type',  # Important: map 'type' to 'resource_type'
        }

        # JSON array fields
        json_array_fields = [
            'languages', 'tags', 'target_audience', 'related_conditions',
            'learning_objectives', 'prerequisites', 'references'
        ]

        def parse_array_field(field_name):
            """Parse array fields from indexed format (e.g., tags[0], tags[1])"""
            array_items = []
            for key, value in form_data.items():
                if key.startswith(f'{field_name}[') and key.endswith(']'):
                    try:
                        index = int(key[len(field_name)+1:-1])
                        array_items.append((index, value))
                    except ValueError:
                        continue
            if array_items:
                array_items.sort(key=lambda x: x[0])
                return [item[1] for item in array_items]
            return []

        # Parse array fields first
        for field_name in json_array_fields:
            array_data = parse_array_field(field_name)
            if array_data:
                processed_data[field_name] = array_data
            elif field_name in form_data:
                # Handle if sent as JSON string
                try:
                    if isinstance(form_data[field_name], str) and form_data[field_name].strip():
                        processed_data[field_name] = json.loads(form_data[field_name])
                    elif isinstance(form_data[field_name], list):
                        processed_data[field_name] = form_data[field_name]
                    else:
                        processed_data[field_name] = []
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse JSON for {field_name}: {form_data[field_name]}")
                    processed_data[field_name] = []
            else:
                processed_data[field_name] = []

        # Process form data
        for key, value in form_data.items():
            # Skip file-related keys that should be handled separately
            if key in ['imageFile', 'resourceFile']:
                continue
            
            # Skip array fields that were already processed
            if any(key.startswith(field + '[') for field in json_array_fields):
                continue
                
            # Map frontend field names to backend field names
            backend_key = field_mapping.get(key, key)
            
            # Skip if already processed as array field
            if backend_key in json_array_fields:
                continue
                
            # Handle boolean fields
            if backend_key in ['is_featured', 'is_free']:
                if isinstance(value, str):
                    processed_data[backend_key] = value.lower() in ['true', '1', 'yes']
                else:
                    processed_data[backend_key] = bool(value)
            # Handle regular fields
            elif value is not None and value != '':
                processed_data[backend_key] = value

        # Handle file uploads from request.FILES
        if files:
            # Handle image upload
            if 'image' in files:
                processed_data['image'] = files['image']
                logger.info(f"Image file added: {files['image'].name}")
            
            # Handle resource file upload
            if 'file' in files:
                processed_data['file'] = files['file']
                logger.info(f"Resource file added: {files['file'].name}")

        logger.info(f"Final processed data keys: {list(processed_data.keys())}")
        return processed_data

    def track_view(self, request, resource):
        """Track a view for analytics"""
        try:
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Create or get view record (unique per IP)
            view, created = ResourceView.objects.get_or_create(
                resource=resource,
                ip_address=ip_address,
                defaults={'user_agent': user_agent}
            )
            
            if created:
                # Increment view count
                resource.view_count += 1
                resource.save(update_fields=['view_count'])
                
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
        """Update resource status"""
        try:
            resource = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(EducationalResource.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            resource.status = new_status
            resource.save(update_fields=['status', 'updated_at'])
            
            serializer = self.get_serializer(resource, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of resource"""
        try:
            resource = self.get_object()
            resource.is_featured = not resource.is_featured
            resource.save(update_fields=['is_featured', 'updated_at'])
            
            serializer = self.get_serializer(resource, context={'request': request})
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
            resource = self.get_object()
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Track download
            ResourceDownload.objects.create(
                resource=resource,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Increment download count
            resource.download_count += 1
            resource.save(update_fields=['download_count'])
            
            return Response({'success': True, 'download_count': resource.download_count})
            
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
            resource = self.get_object()
            self.track_view(request, resource)
            
            return Response({'success': True, 'view_count': resource.view_count})
            
        except Exception as e:
            logger.error(f"Error incrementing view count: {str(e)}")
            return Response(
                {'error': f'Failed to increment view count: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured resources"""
        try:
            queryset = self.get_queryset().filter(is_featured=True, status='Published')
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching featured resources: {str(e)}")
            return Response(
                {'error': f'Failed to fetch featured resources: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get resource analytics"""
        try:
            # Total resources
            total_resources = EducationalResource.objects.count()
            
            # Resources by status
            published_count = EducationalResource.objects.filter(status='Published').count()
            draft_count = EducationalResource.objects.filter(status='Draft').count()
            under_review_count = EducationalResource.objects.filter(status='Under Review').count()
            archived_count = EducationalResource.objects.filter(status='Archived').count()
            featured_count = EducationalResource.objects.filter(is_featured=True).count()
            
            # Total downloads and views
            total_downloads = EducationalResource.objects.aggregate(
                total=Sum('download_count')
            )['total'] or 0
            
            total_views = EducationalResource.objects.aggregate(
                total=Sum('view_count')
            )['total'] or 0
            
            # Monthly downloads and views (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            monthly_downloads = ResourceDownload.objects.filter(
                downloaded_at__gte=thirty_days_ago
            ).count()
            
            monthly_views = ResourceView.objects.filter(
                viewed_at__gte=thirty_days_ago
            ).count()
            
            # Pending submissions
            pending_submissions = CaseStudySubmission.objects.filter(
                status='Pending Review'
            ).count()
            
            # Resources by category
            resources_by_category = dict(
                EducationalResource.objects.values_list('category')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Top resources by downloads
            top_resources = list(
                EducationalResource.objects.order_by('-download_count')[:10]
                .values('id', 'title', 'category', 'download_count', 'view_count')
            )
            
            # Recent activity
            recent_activity = []
            
            # Recent downloads
            recent_downloads = ResourceDownload.objects.select_related('resource') \
                .order_by('-downloaded_at')[:5]
            for download in recent_downloads:
                recent_activity.append({
                    'type': 'download',
                    'resource': download.resource.title,
                    'count': 1,
                    'date': download.downloaded_at.strftime('%Y-%m-%d')
                })
            
            # Recent submissions
            recent_submissions = CaseStudySubmission.objects.order_by('-submission_date')[:3]
            for submission in recent_submissions:
                recent_activity.append({
                    'type': 'submission',
                    'resource': submission.title,
                    'date': submission.submission_date.strftime('%Y-%m-%d'),
                    'user': submission.submitted_by
                })
            
            analytics_data = {
                'total': total_resources,
                'published': published_count,
                'draft': draft_count,
                'under_review': under_review_count,
                'archived': archived_count,
                'featured': featured_count,
                'total_downloads': total_downloads,
                'monthly_downloads': monthly_downloads,
                'total_views': total_views,
                'monthly_views': monthly_views,
                'pending_submissions': pending_submissions,
                'resources_by_category': resources_by_category,
                'top_resources': top_resources,
                'recent_activity': recent_activity,
            }
            
            serializer = ResourceAnalyticsSerializer(data=analytics_data)
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
        """Upload a resource file and return the URL"""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
        file_extension = os.path.splitext(file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {'error': 'Invalid file type. Allowed types: pdf, doc, docx, ppt, pptx'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (limit to 50MB)
        if file.size > 50 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 50MB'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            # Generate unique filename
            ext = file_extension
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
    def categories(self, request):
        """Get all unique categories"""
        try:
            categories = EducationalResource.objects.values_list('category', flat=True).distinct()
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
            # Get all target audiences from all resources
            all_audiences = []
            for resource in EducationalResource.objects.all():
                if isinstance(resource.target_audience, list):
                    all_audiences.extend(resource.target_audience)
            
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
            authors = EducationalResource.objects.values_list('author', flat=True).distinct()
            authors_list = [auth for auth in authors if auth]  # Filter out empty authors
            return Response(authors_list)
            
        except Exception as e:
            logger.error(f"Error fetching authors: {str(e)}")
            return Response(
                {'error': f'Failed to fetch authors: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CaseStudySubmissionViewSet(viewsets.ModelViewSet):
    queryset = CaseStudySubmission.objects.all().order_by('-submission_date')
    serializer_class = CaseStudySubmissionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'submitted_by', 'institution', 'excerpt']
    ordering_fields = ['submission_date', 'review_date', 'published_date']
    ordering = ['-submission_date']

    def create(self, request, *args, **kwargs):
        """Override create to handle file uploads"""
        try:
            # Log the incoming data
            logger.info(f"Creating case study submission with data: {request.data}")
            logger.info(f"Files received: {request.FILES}")
            
            # Create the serializer with the data and files
            serializer = self.get_serializer(data=request.data)
            
            # Check if data is valid
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the instance
            instance = serializer.save()
            logger.info(f"Created submission with ID: {instance.id}, submitted_by: {instance.submitted_by}")
            logger.info(f"Attachments: {instance.attachments}")
            logger.info(f"Image URL: {instance.image_url}")
            
            # Return the created instance
            response_serializer = self.get_serializer(instance)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating case study submission: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create submission: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update case study submission status"""
        try:
            submission = self.get_object()
            new_status = request.data.get('status')
            review_notes = request.data.get('reviewNotes', '')
            reviewed_by = request.data.get('reviewedBy', '')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(CaseStudySubmission.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            submission.status = new_status
            submission.review_notes = review_notes
            submission.reviewed_by = reviewed_by
            
            if new_status in ['Approved', 'Published', 'Rejected']:
                submission.review_date = timezone.now()
            
            if new_status == 'Published':
                submission.published_date = timezone.now()
            
            submission.save()
            
            serializer = self.get_serializer(submission)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating submission status: {str(e)}")
            return Response(
                {'error': f'Failed to update submission status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending submissions"""
        try:
            queryset = self.get_queryset().filter(status='Pending Review')
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching pending submissions: {str(e)}")
            return Response(
                {'error': f'Failed to fetch pending submissions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a case study submission"""
        try:
            instance = self.get_object()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting submission: {str(e)}")
            return Response(
                {'error': f'Failed to delete submission: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_comments_and_notify(self, request, pk=None):
        """Add comments and send notification to submitter"""
        submission = self.get_object()
        comments = request.data.get('review_notes', '')
        reviewed_by = request.data.get('reviewed_by', '')
        
        # Update comments if provided
        if comments.strip():
            submission.review_notes = comments
            submission.reviewed_by = reviewed_by
            submission.save()
        
        try:
            # Send email notification
            subject = f"Case Study Status Update: {submission.title}"
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [submission.email]
            
            context = {
                'submission': submission,
                'status': submission.status,
                'review_notes': submission.review_notes,
                'reviewed_by': submission.reviewed_by or 'Admin',
            }
            
            html_content = render_to_string('emails/case_study_status_notification.html', context)
            text_content = render_to_string('emails/case_study_status_notification.txt', context)
            
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            # Return updated submission data
            serializer = self.get_serializer(submission)
            return Response({
                'success': True,
                'message': f'Comments updated and notification sent to {submission.email}',
                'submission': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send notification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)