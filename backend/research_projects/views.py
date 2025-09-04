from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from datetime import timedelta, datetime
from .models import ResearchProject, ResearchProjectView, ResearchProjectUpdate
from .serializers import (
    ResearchProjectSerializer,
    ResearchProjectAnalyticsSerializer,
    ResearchProjectViewSerializer,
    ResearchProjectUpdateSerializer
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


class ResearchProjectViewSet(viewsets.ModelViewSet):
    queryset = ResearchProject.objects.all().order_by('-created_at')
    serializer_class = ResearchProjectSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'type', 'ethics_approval']
    search_fields = [
        'title', 'description', 'principal_investigator', 'target_population',
        'methodology', 'registration_number', 'funding_source', 'keywords',
        'institutions', 'objectives'
    ]
    ordering_fields = [
        'created_at', 'updated_at', 'start_date', 'end_date', 'title', 
        'status', 'type', 'sample_size'
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active projects
        active_only = self.request.query_params.get('active_only', None)
        if active_only and active_only.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(status__in=['Active', 'Recruiting', 'Data Collection'])
        
        # Filter by ethics approval
        ethics_filter = self.request.query_params.get('ethics_approval', None)
        if ethics_filter is not None:
            has_ethics = ethics_filter.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(ethics_approval=has_ethics)
        
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
            logger.error(f"Error in research projects list view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch research projects: {str(e)}'},
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
            logger.error(f"Error in research project retrieve view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch research project: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating research project with data: {request.data}")
            
            # Process both form data and files
            processed_data = {}
            
            # Handle regular form fields
            for key, value in request.data.items():
                if key != 'image':  # We'll handle image separately
                    if key in ['investigators', 'institutions', 'objectives', 'keywords']:
                        # Parse JSON array fields
                        try:
                            processed_data[self.snake_case(key)] = json.loads(value)
                        except (json.JSONDecodeError, TypeError):
                            processed_data[self.snake_case(key)] = []
                    elif key in ['ethicsApproval']:
                        # Handle boolean fields
                        processed_data[self.snake_case(key)] = str(value).lower() in ['true', '1', 'yes']
                    elif key in ['sampleSize']:
                        # Handle integer fields
                        try:
                            processed_data[self.snake_case(key)] = int(value) if value else None
                        except (ValueError, TypeError):
                            processed_data[self.snake_case(key)] = None
                    elif value is not None and value != '':
                        processed_data[self.snake_case(key)] = value
            
            # Handle image file
            if 'image' in request.FILES:
                processed_data['image'] = request.FILES['image']
            
            # Create research project
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Research project validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            project = serializer.save()
            logger.info(f"Research project created with ID: {project.id}")

            # Return created project
            response_serializer = self.get_serializer(project)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating research project: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create research project: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.info(f"Updating research project {instance.id} with data: {request.data}")
            
            # Process form data
            processed_data = self.process_form_data(request.data)
            
            # Update research project
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Research project update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            project = serializer.save()
            
            # Return updated project
            response_serializer = self.get_serializer(project)
            return Response(response_serializer.data)

        except Exception as e:
            logger.error(f"Error updating research project: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update research project: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data):
        """Process form data, handling files and JSON fields"""
        processed_data = {}
        
        for key, value in data.items():
            if key == 'image':
                # Handle image upload directly
                processed_data[key] = value
            elif key in ['investigators', 'institutions', 'objectives', 'keywords']:
                # Handle JSON array fields
                try:
                    if isinstance(value, str):
                        processed_data[self.snake_case(key)] = json.loads(value)
                    else:
                        processed_data[self.snake_case(key)] = value
                except json.JSONDecodeError:
                    processed_data[self.snake_case(key)] = []
            elif key in ['ethicsApproval']:
                # Handle boolean fields
                processed_data[self.snake_case(key)] = str(value).lower() in ['true', '1', 'yes'] if isinstance(value, str) else bool(value)
            elif key in ['sampleSize']:
                # Handle integer fields
                try:
                    processed_data[self.snake_case(key)] = int(value) if value else None
                except (ValueError, TypeError):
                    processed_data[self.snake_case(key)] = None
            elif value is not None and value != '':
                # Handle regular fields
                processed_data[self.snake_case(key)] = value
                
        return processed_data

    def snake_case(self, camel_str):
        """Convert camelCase to snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def track_view(self, request, project):
        """Track a view for analytics"""
        try:
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Create or get view record (unique per IP)
            view, created = ResearchProjectView.objects.get_or_create(
                research_project=project,
                ip_address=ip_address,
                defaults={'user_agent': user_agent}
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

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update research project status"""
        try:
            project = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(ResearchProject.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            project.status = new_status
            project.save(update_fields=['status', 'updated_at'])
            
            serializer = self.get_serializer(project)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Manually increment view count"""
        try:
            project = self.get_object()
            self.track_view(request, project)
            
            return Response({'success': True})
            
        except Exception as e:
            logger.error(f"Error incrementing view count: {str(e)}")
            return Response(
                {'error': f'Failed to increment view count: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active research projects"""
        try:
            queryset = self.get_queryset().filter(status__in=['Active', 'Recruiting', 'Data Collection'])
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching active research projects: {str(e)}")
            return Response(
                {'error': f'Failed to fetch active research projects: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get research projects grouped by status"""
        try:
            projects_by_status = {}
            for status_choice in ResearchProject.STATUS_CHOICES:
                status_key = status_choice[0]
                projects = self.get_queryset().filter(status=status_key)
                serializer = self.get_serializer(projects, many=True, context={'request': request})
                projects_by_status[status_key] = serializer.data
            
            return Response(projects_by_status)
            
        except Exception as e:
            logger.error(f"Error fetching projects by status: {str(e)}")
            return Response(
                {'error': f'Failed to fetch projects by status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get research project analytics"""
        try:
            # Total projects
            total_projects = ResearchProject.objects.count()
            
            # Projects by status
            planning_count = ResearchProject.objects.filter(status='Planning').count()
            active_count = ResearchProject.objects.filter(status='Active').count()
            recruiting_count = ResearchProject.objects.filter(status='Recruiting').count()
            data_collection_count = ResearchProject.objects.filter(status='Data Collection').count()
            analysis_count = ResearchProject.objects.filter(status='Analysis').count()
            completed_count = ResearchProject.objects.filter(status='Completed').count()
            suspended_count = ResearchProject.objects.filter(status='Suspended').count()
            terminated_count = ResearchProject.objects.filter(status='Terminated').count()
            
            # Projects by type
            projects_by_type = dict(
                ResearchProject.objects.values_list('type')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Projects by status (for charts)
            projects_by_status = dict(
                ResearchProject.objects.values_list('status')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Total investigators count
            total_investigators = 0
            for project in ResearchProject.objects.all():
                if isinstance(project.investigators, list):
                    total_investigators += len(project.investigators)
            
            # Projects with ethics approval
            projects_with_ethics = ResearchProject.objects.filter(ethics_approval=True).count()
            
            # Average project duration
            projects_with_dates = ResearchProject.objects.exclude(
                Q(start_date__isnull=True) | Q(end_date__isnull=True)
            )
            avg_duration = None
            if projects_with_dates.exists():
                durations = [(p.end_date - p.start_date).days for p in projects_with_dates]
                avg_duration = sum(durations) / len(durations)
            
            analytics_data = {
                'total': total_projects,
                'planning': planning_count,
                'active': active_count,
                'recruiting': recruiting_count,
                'data_collection': data_collection_count,
                'analysis': analysis_count,
                'completed': completed_count,
                'suspended': suspended_count,
                'terminated': terminated_count,
                'projects_by_type': projects_by_type,
                'projects_by_status': projects_by_status,
                'total_investigators': total_investigators,
                'projects_with_ethics_approval': projects_with_ethics,
                'avg_duration_days': avg_duration,
            }
            
            serializer = ResearchProjectAnalyticsSerializer(data=analytics_data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching research project analytics: {str(e)}")
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
            file_path = os.path.join('research_projects', 'images', filename)
            
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
    def investigators(self, request):
        """Get all unique investigators"""
        try:
            # Get all investigators from all projects
            all_investigators = []
            for project in ResearchProject.objects.all():
                if isinstance(project.investigators, list):
                    for investigator in project.investigators:
                        if isinstance(investigator, dict) and investigator.get('name'):
                            all_investigators.append({
                                'name': investigator['name'],
                                'role': investigator.get('role', ''),
                                'affiliation': investigator.get('affiliation', ''),
                                'email': investigator.get('email', '')
                            })
            
            # Remove duplicates based on name and affiliation
            unique_investigators = []
            seen = set()
            for inv in all_investigators:
                key = (inv['name'], inv['affiliation'])
                if key not in seen:
                    seen.add(key)
                    unique_investigators.append(inv)
            
            return Response(unique_investigators)
            
        except Exception as e:
            logger.error(f"Error fetching investigators: {str(e)}")
            return Response(
                {'error': f'Failed to fetch investigators: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def institutions(self, request):
        """Get all unique institutions"""
        try:
            # Get all institutions from all projects
            all_institutions = []
            for project in ResearchProject.objects.all():
                if isinstance(project.institutions, list):
                    all_institutions.extend(project.institutions)
            
            # Remove duplicates and empty values
            unique_institutions = list(set([inst for inst in all_institutions if inst]))
            return Response(unique_institutions)
            
        except Exception as e:
            logger.error(f"Error fetching institutions: {str(e)}")
            return Response(
                {'error': f'Failed to fetch institutions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get all research project types"""
        try:
            types = [choice[0] for choice in ResearchProject.TYPE_CHOICES]
            return Response(types)
            
        except Exception as e:
            logger.error(f"Error fetching project types: {str(e)}")
            return Response(
                {'error': f'Failed to fetch project types: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def statuses(self, request):
        """Get all research project statuses"""
        try:
            statuses = [choice[0] for choice in ResearchProject.STATUS_CHOICES]
            return Response(statuses)
            
        except Exception as e:
            logger.error(f"Error fetching project statuses: {str(e)}")
            return Response(
                {'error': f'Failed to fetch project statuses: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def updates(self, request, pk=None):
        """Get updates for a specific research project"""
        try:
            project = self.get_object()
            updates = ResearchProjectUpdate.objects.filter(research_project=project)
            serializer = ResearchProjectUpdateSerializer(updates, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching project updates: {str(e)}")
            return Response(
                {'error': f'Failed to fetch project updates: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """Add an update to a research project"""
        try:
            project = self.get_object()
            data = request.data.copy()
            data['research_project'] = project.id
            
            serializer = ResearchProjectUpdateSerializer(data=data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            update = serializer.save()
            return Response(ResearchProjectUpdateSerializer(update).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error adding project update: {str(e)}")
            return Response(
                {'error': f'Failed to add project update: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )