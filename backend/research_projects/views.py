from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from datetime import timedelta, datetime
from .models import (
    ResearchProject, ResearchProjectView, ResearchProjectUpdate,
    ResearchPaper, ResearchPaperFile, ResearchPaperReview, ResearchPaperComment
)
from .serializers import (
    ResearchProjectSerializer,
    ResearchProjectAnalyticsSerializer,
    ResearchProjectViewSerializer,
    ResearchProjectUpdateSerializer,
    ResearchPaperSerializer,
    ResearchPaperFileSerializer,
    ResearchPaperReviewSerializer,
    ResearchPaperCommentSerializer,
    ResearchPaperAnalyticsSerializer
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
        
        # Filter by active projects
        active_only = self.request.query_params.get('active_only', None)
        if active_only and active_only.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(status__in=['Active', 'Recruiting', 'Data Collection'])
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
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

    # NEW ACTION: Get research papers related to this project
    @action(detail=True, methods=['get'])
    def research_papers(self, request, pk=None):
        """Get research papers related to this project"""
        try:
            project = self.get_object()
            papers = ResearchPaper.objects.filter(research_project=project)
            serializer = ResearchPaperSerializer(papers, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching related research papers: {str(e)}")
            return Response(
                {'error': f'Failed to fetch related research papers: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# NEW VIEWSET FOR RESEARCH PAPERS

class ResearchPaperViewSet(viewsets.ModelViewSet):
    queryset = ResearchPaper.objects.all().order_by('-submission_date')
    serializer_class = ResearchPaperSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'research_type', 'category', 'ethics_approval', 'research_project']
    search_fields = [
        'title', 'abstract', 'keywords', 'participants', 'funding_source',
        'target_journal', 'authors', 'acknowledgments'
    ]
    ordering_fields = [
        'submission_date', 'last_modified', 'title', 'status', 'research_type', 'category'
    ]
    ordering = ['-submission_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by under review
        under_review = self.request.query_params.get('under_review', None)
        if under_review and under_review.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(status__in=['Submitted', 'Under Review', 'Revision Required'])
        
        # Filter by ethics approval
        ethics_filter = self.request.query_params.get('ethics_approval', None)
        if ethics_filter is not None:
            has_ethics = ethics_filter.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(ethics_approval=has_ethics)
        
        return queryset

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new research paper submission"""
        try:
            logger.info(f"Creating research paper with data: {request.data}")
            
            # Process form data
            processed_data = self.process_research_paper_data(request.data)
            
            # Handle manuscript file
            if 'manuscriptFile' in request.FILES:
                processed_data['manuscript_file'] = request.FILES['manuscriptFile']
            elif 'manuscript' in request.FILES:
                processed_data['manuscript_file'] = request.FILES['manuscript']
            
            # Create research paper
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Research paper validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            paper = serializer.save()
            
            # Handle supplementary files
            supplementary_files = request.FILES.getlist('supplementaryFiles')
            for file in supplementary_files:
                ResearchPaperFile.objects.create(
                    research_paper=paper,
                    file=file,
                    file_type='supplementary',
                    description=f'Supplementary file: {file.name}'
                )
            
            logger.info(f"Research paper created with ID: {paper.id}")
            
            # Return created paper
            response_serializer = self.get_serializer(paper, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating research paper: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create research paper: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_research_paper_data(self, data):
        """Process research paper form data"""
        processed_data = {}
        
        for key, value in data.items():
            if key in ['authors', 'keywords']:
                # Handle JSON array fields
                try:
                    if isinstance(value, str):
                        processed_data[self.snake_case(key)] = json.loads(value)
                    else:
                        processed_data[self.snake_case(key)] = value
                except json.JSONDecodeError:
                    processed_data[self.snake_case(key)] = []
            elif key in ['ethicsApproval', 'declaration']:
                # Handle boolean fields
                processed_data[self.snake_case(key)] = str(value).lower() in ['true', '1', 'yes'] if isinstance(value, str) else bool(value)
            elif key in ['researchProject']:
                # Handle foreign key fields
                try:
                    processed_data[self.snake_case(key)] = int(value) if value else None
                except (ValueError, TypeError):
                    processed_data[self.snake_case(key)] = None
            elif key not in ['manuscriptFile', 'supplementaryFiles', 'declaration'] and value is not None and value != '':
                # Handle regular fields
                processed_data[self.snake_case(key)] = value
                
        return processed_data

    def snake_case(self, camel_str):
        """Convert camelCase to snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update research paper status"""
        try:
            paper = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            valid_statuses = dict(ResearchPaper.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            paper.status = new_status
            paper.save(update_fields=['status', 'last_modified'])
            
            serializer = self.get_serializer(paper)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating paper status: {str(e)}")
            return Response(
                {'error': f'Failed to update paper status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get research paper analytics"""
        try:
            # Total papers
            total_papers = ResearchPaper.objects.count()
            
            # Papers by status
            submitted_count = ResearchPaper.objects.filter(status='Submitted').count()
            under_review_count = ResearchPaper.objects.filter(status='Under Review').count()
            revision_required_count = ResearchPaper.objects.filter(status='Revision Required').count()
            accepted_count = ResearchPaper.objects.filter(status='Accepted').count()
            published_count = ResearchPaper.objects.filter(status='Published').count()
            rejected_count = ResearchPaper.objects.filter(status='Rejected').count()
            
            # Papers by category
            papers_by_category = dict(
                ResearchPaper.objects.values_list('category')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Papers by research type
            papers_by_research_type = dict(
                ResearchPaper.objects.values_list('research_type')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Papers by status (for charts)
            papers_by_status = dict(
                ResearchPaper.objects.values_list('status')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Total authors count
            total_authors = 0
            for paper in ResearchPaper.objects.all():
                if isinstance(paper.authors, list):
                    total_authors += len(paper.authors)
            
            # Papers with ethics approval
            papers_with_ethics = ResearchPaper.objects.filter(ethics_approval=True).count()
            
            # Average review time (for completed reviews)
            completed_reviews = ResearchPaperReview.objects.filter(
                review_status='Completed', 
                completed_at__isnull=False
            )
            avg_review_time = None
            if completed_reviews.exists():
                review_times = []
                for review in completed_reviews:
                    if review.assigned_at and review.completed_at:
                        days = (review.completed_at - review.assigned_at).days
                        review_times.append(days)
                if review_times:
                    avg_review_time = sum(review_times) / len(review_times)
            
            analytics_data = {
                'total_papers': total_papers,
                'submitted': submitted_count,
                'under_review': under_review_count,
                'revision_required': revision_required_count,
                'accepted': accepted_count,
                'published': published_count,
                'rejected': rejected_count,
                'papers_by_category': papers_by_category,
                'papers_by_research_type': papers_by_research_type,
                'papers_by_status': papers_by_status,
                'total_authors': total_authors,
                'papers_with_ethics_approval': papers_with_ethics,
                'avg_review_time_days': avg_review_time,
            }
            
            serializer = ResearchPaperAnalyticsSerializer(data=analytics_data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching research paper analytics: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch analytics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all research paper categories"""
        try:
            categories = [choice[0] for choice in ResearchPaper.CATEGORY_CHOICES]
            return Response(categories)
            
        except Exception as e:
            logger.error(f"Error fetching paper categories: {str(e)}")
            return Response(
                {'error': f'Failed to fetch paper categories: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def research_types(self, request):
        """Get all research paper types"""
        try:
            types = [choice[0] for choice in ResearchPaper.RESEARCH_TYPE_CHOICES]
            return Response(types)
            
        except Exception as e:
            logger.error(f"Error fetching research types: {str(e)}")
            return Response(
                {'error': f'Failed to fetch research types: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def study_designs(self, request):
        """Get all study design options"""
        try:
            designs = [choice[0] for choice in ResearchPaper.STUDY_DESIGN_CHOICES]
            return Response(designs)
            
        except Exception as e:
            logger.error(f"Error fetching study designs: {str(e)}")
            return Response(
                {'error': f'Failed to fetch study designs: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get reviews for a specific research paper"""
        try:
            paper = self.get_object()
            reviews = ResearchPaperReview.objects.filter(research_paper=paper)
            serializer = ResearchPaperReviewSerializer(reviews, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching paper reviews: {str(e)}")
            return Response(
                {'error': f'Failed to fetch paper reviews: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """Add a review to a research paper"""
        try:
            paper = self.get_object()
            data = request.data.copy()
            data['research_paper'] = paper.id
            
            serializer = ResearchPaperReviewSerializer(data=data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            review = serializer.save()
            return Response(ResearchPaperReviewSerializer(review).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error adding paper review: {str(e)}")
            return Response(
                {'error': f'Failed to add paper review: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get comments for a specific research paper"""
        try:
            paper = self.get_object()
            comments = ResearchPaperComment.objects.filter(research_paper=paper)
            serializer = ResearchPaperCommentSerializer(comments, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching paper comments: {str(e)}")
            return Response(
                {'error': f'Failed to fetch paper comments: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a research paper"""
        try:
            paper = self.get_object()
            data = request.data.copy()
            data['research_paper'] = paper.id
            
            serializer = ResearchPaperCommentSerializer(data=data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            comment = serializer.save()
            return Response(ResearchPaperCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error adding paper comment: {str(e)}")
            return Response(
                {'error': f'Failed to add paper comment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def upload_supplementary_file(self, request, pk=None):
        """Upload a supplementary file to a research paper"""
        try:
            paper = self.get_object()
            
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file = request.FILES['file']
            file_type = request.data.get('file_type', 'supplementary')
            description = request.data.get('description', '')
            
            # Validate file size (limit to 50MB for supplementary files)
            if file.size > 50 * 1024 * 1024:
                return Response(
                    {'error': 'File size too large. Maximum size is 50MB'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            supplementary_file = ResearchPaperFile.objects.create(
                research_paper=paper,
                file=file,
                file_type=file_type,
                description=description or f'{file_type.title()} file: {file.name}'
            )
            
            serializer = ResearchPaperFileSerializer(supplementary_file, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error uploading supplementary file: {str(e)}")
            return Response(
                {'error': f'Failed to upload supplementary file: {str(e)}'},
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