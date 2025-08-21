from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Prefetch
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import Abstract, Author, ImportantDates
from django.conf import settings
import os
import uuid
import logging
import json

from .models import Abstract, Author
from .serializers import (
    AbstractSerializer, CreateAbstractSerializer, 
    UpdateAbstractSerializer, AuthorSerializer,
    ImportantDatesSerializer, ImportantDatesFormattedSerializer,
    CreateUpdateImportantDatesSerializer
)

logger = logging.getLogger(__name__)

class AbstractViewSet(viewsets.ModelViewSet):
    queryset = Abstract.objects.all().prefetch_related(
        Prefetch('authors', queryset=Author.objects.all().order_by('order', 'last_name', 'first_name'))
    )
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return CreateAbstractSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateAbstractSerializer
        return AbstractSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category if provided
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        
        # Filter by presentation type if provided
        presentation_filter = self.request.query_params.get('presentation_type')
        if presentation_filter:
            queryset = queryset.filter(presentation_preference=presentation_filter)
        
        # Filter by featured if provided
        featured_filter = self.request.query_params.get('featured')
        if featured_filter is not None:
            is_featured = featured_filter.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(authors__first_name__icontains=search) |
                Q(authors__last_name__icontains=search) |
                Q(keywords__icontains=search)
            ).distinct()
        
        return queryset.order_by('-submitted_date')
    
    def create(self, request, *args, **kwargs):
        # Use the create serializer for creation
        create_serializer = CreateAbstractSerializer(data=request.data, context=self.get_serializer_context())
        create_serializer.is_valid(raise_exception=True)
        instance = create_serializer.save()
        
        # Use the main serializer for response to ensure proper serialization
        response_serializer = AbstractSerializer(instance, context=self.get_serializer_context())
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of an abstract"""
        abstract = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Under Review', 'Accepted', 'Revision Required', 'Rejected']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        abstract.status = new_status
        abstract.save()
        
        serializer = self.get_serializer(abstract)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of an abstract"""
        abstract = self.get_object()
        abstract.is_featured = not abstract.is_featured
        abstract.save()
        
        serializer = self.get_serializer(abstract)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_comments(self, request, pk=None):
        """Update reviewer comments for an abstract"""
        abstract = self.get_object()
        comments = request.data.get('reviewer_comments', '')
        
        abstract.reviewer_comments = comments
        abstract.save()
        
        serializer = self.get_serializer(abstract)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_comments_and_notify(self, request, pk=None):
        """Add comments and send notification to author"""
        abstract = self.get_object()
        comments = request.data.get('reviewer_comments', '')
        
        # Update comments if provided
        if comments.strip():
            abstract.reviewer_comments = comments
            abstract.save()
        
        try:
            # Find corresponding author
            corresponding_author = abstract.authors.filter(is_corresponding=True).first()
            if not corresponding_author:
                return Response({
                    'success': False,
                    'error': 'No corresponding author found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Send email
            subject = f"Abstract Status Update: {abstract.title}"
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [corresponding_author.email]
            
            context = {
                'abstract': abstract,
                'author': corresponding_author,
                'status': abstract.status,
                'reviewer_comments': abstract.reviewer_comments,
            }
            
            html_content = render_to_string('emails/abstract_status_notification.html', context)
            text_content = render_to_string('emails/abstract_status_notification.txt', context)
            
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            # Return updated abstract data
            serializer = self.get_serializer(abstract)
            return Response({
                'success': True,
                'message': f'Comments updated and notification sent to {corresponding_author.email}',
                'abstract': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send notification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get analytics for abstracts"""
        total = Abstract.objects.count()
        under_review = Abstract.objects.filter(status='Under Review').count()
        accepted = Abstract.objects.filter(status='Accepted').count()
        revision_required = Abstract.objects.filter(status='Revision Required').count()
        rejected = Abstract.objects.filter(status='Rejected').count()
        featured = Abstract.objects.filter(is_featured=True).count()
        
        # Count by category
        by_category = {}
        for category in Abstract.CATEGORY_CHOICES:
            count = Abstract.objects.filter(category=category[0]).count()
            by_category[category[0]] = count
        
        # Count by presentation type
        by_presentation_type = {}
        for presentation in Abstract.PRESENTATION_CHOICES:
            count = Abstract.objects.filter(presentation_preference=presentation[0]).count()
            by_presentation_type[presentation[0]] = count
        
        # Total authors
        total_authors = Author.objects.count()
        
        # Countries
        countries = Author.objects.values_list('country', flat=True).distinct()
        
        return Response({
            'total': total,
            'underReview': under_review,
            'accepted': accepted,
            'revisionRequired': revision_required,
            'rejected': rejected,
            'byCategory': by_category,
            'byPresentationType': by_presentation_type,
            'featured': featured,
            'totalAuthors': total_authors,
            'countries': list(countries)
        })
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available categories"""
        categories = [choice[0] for choice in Abstract.CATEGORY_CHOICES]
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def presentation_types(self, request):
        """Get all available presentation types"""
        presentation_types = [choice[0] for choice in Abstract.PRESENTATION_CHOICES]
        return Response(presentation_types)
    
    @action(detail=True, methods=['post'])
    def send_status_notification(self, request, pk=None):
        """Send status notification to corresponding author"""
        abstract = self.get_object()
        
        try:
            # Find corresponding author
            corresponding_author = abstract.authors.filter(is_corresponding=True).first()
            if not corresponding_author:
                return Response({
                    'success': False,
                    'error': 'No corresponding author found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Send email
            subject = f"Abstract Status Update: {abstract.title}"
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [corresponding_author.email]
            
            context = {
                'abstract': abstract,
                'author': corresponding_author,
                'status': abstract.status,
                'reviewer_comments': abstract.reviewer_comments,
            }
            
            html_content = render_to_string('emails/abstract_status_notification.html', context)
            text_content = render_to_string('emails/abstract_status_notification.txt', context)
            
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            return Response({
                'success': True,
                'message': f'Status notification sent to {corresponding_author.email}'
            })
            
        except Exception as e:
            logger.error(f"Failed to send status notification: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send status notification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def assign_reviewer(self, request, pk=None):
        """Assign reviewer to abstract and send notification"""
        abstract = self.get_object()
        reviewer_email = request.data.get('reviewer_email')
        
        if not reviewer_email:
            return Response({
                'success': False,
                'error': 'Reviewer email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            abstract.assigned_reviewer = reviewer_email
            abstract.save()
            
            # Send email to reviewer
            subject = f"Abstract Review Assignment: {abstract.title}"
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [reviewer_email]
            
            context = {
                'abstract': abstract,
                'reviewer_email': reviewer_email,
            }
            
            html_content = render_to_string('emails/reviewer_assignment.html', context)
            text_content = render_to_string('emails/reviewer_assignment.txt', context)
            
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            return Response({
                'success': True,
                'message': f'Reviewer assigned and notification sent to {reviewer_email}'
            })
            
        except Exception as e:
            logger.error(f"Failed to assign reviewer: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to assign reviewer and send notification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export abstracts in CSV or Excel format"""
        format_type = request.GET.get('format', 'csv')
        queryset = self.get_queryset()
        
        # This would typically use a library like pandas or django-import-export
        # For now, return a simple response
        return Response({
            'message': f'Export functionality for {format_type} format would be implemented here',
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['post'])
    def upload_abstract_file(self, request):
        """Upload abstract file"""
        return self._handle_file_upload(request, 'abstract_file')
    
    @action(detail=False, methods=['post'])
    def upload_ethical_approval(self, request):
        """Upload ethical approval file"""
        return self._handle_file_upload(request, 'ethical_approval_file')
    
    @action(detail=False, methods=['post'])
    def upload_supplementary_file(self, request):
        """Upload supplementary file"""
        return self._handle_file_upload(request, 'supplementary_file')
    
    def _handle_file_upload(self, request, file_field):
        """Handle file uploads"""
        if file_field not in request.FILES:
            return Response(
                {'error': f'No {file_field} provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES[file_field]
        
        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
        file_extension = os.path.splitext(file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {'error': f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (limit to 10MB)
        if file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File size too large. Maximum size is 10MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = file_extension
            filename = f"{uuid.uuid4()}{ext}"
            
            # Determine upload path based on file type
            if file_field == 'abstract_file':
                file_path = os.path.join('abstracts', 'files', filename)
            elif file_field == 'ethical_approval_file':
                file_path = os.path.join('abstracts', 'ethical_approval', filename)
            else:  # supplementary_file
                file_path = os.path.join('abstracts', 'supplementary', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(file.read()))
            file_url = default_storage.url(saved_path)
            
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
    def important_dates(self, request):
        """Get current important dates for abstracts"""
        current_dates = ImportantDates.get_current_dates()
        
        if current_dates:
            serializer = ImportantDatesFormattedSerializer(current_dates, context=self.get_serializer_context())
            return Response(serializer.data)
        else:
            # Return default dates if none exist
            default_year = timezone.now().year + 1
            default_data = {
                'year': default_year,
                'abstractSubmissionOpens': f'January 15, {default_year}',
                'abstractSubmissionDeadline': f'April 30, {default_year}',
                'abstractReviewCompletion': f'June 15, {default_year}',
                'acceptanceNotifications': f'July 1, {default_year}',
                'finalAbstractSubmission': f'August 15, {default_year}',
                'conferencePresentation': f'March 15-17, {default_year}',
                'is_active': False
            }
            return Response(default_data)

    @action(detail=False, methods=['post', 'put'])
    def update_important_dates(self, request):
        """Update important dates (no permissions required)"""
        data = request.data
        year = data.get('year', timezone.now().year + 1)
        
        # Try to get existing dates for this year
        dates, created = ImportantDates.objects.get_or_create(
            year=year,
            defaults={
                'abstract_submission_opens': data.get('abstractSubmissionOpens', f'January 15'),
                'abstract_submission_deadline': data.get('abstractSubmissionDeadline', f'April 30'),
                'abstract_review_completion': data.get('abstractReviewCompletion', f'June 15'),
                'acceptance_notifications': data.get('acceptanceNotifications', f'July 1'),
                'final_abstract_submission': data.get('finalAbstractSubmission', f'August 15'),
                'conference_presentation': data.get('conferencePresentation', f'March 15-17'),
                'is_active': True,
                # no need to set created_by from user
            }
        )
        
        if not created:
            # Update existing dates
            dates.abstract_submission_opens = data.get('abstractSubmissionOpens', dates.abstract_submission_opens)
            dates.abstract_submission_deadline = data.get('abstractSubmissionDeadline', dates.abstract_submission_deadline)
            dates.abstract_review_completion = data.get('abstractReviewCompletion', dates.abstract_review_completion)
            dates.acceptance_notifications = data.get('acceptanceNotifications', dates.acceptance_notifications)
            dates.final_abstract_submission = data.get('finalAbstractSubmission', dates.final_abstract_submission)
            dates.conference_presentation = data.get('conferencePresentation', dates.conference_presentation)
            dates.is_active = True
            dates.save()
        
        serializer = ImportantDatesFormattedSerializer(dates, context=self.get_serializer_context())
        
        return Response({
            'message': f'Important dates for {year} {"created" if created else "updated"} successfully',
            'data': serializer.data
        })

        
class ImportantDatesViewSet(viewsets.ModelViewSet):
    """ViewSet for managing important dates"""
    queryset = ImportantDates.objects.all().order_by('-year', '-created_at')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateUpdateImportantDatesSerializer
        elif self.action == 'list' or self.action == 'retrieve':
            return ImportantDatesFormattedSerializer
        return ImportantDatesSerializer
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the currently active important dates"""
        current_dates = ImportantDates.get_current_dates()
        
        if current_dates:
            serializer = ImportantDatesFormattedSerializer(current_dates, context=self.get_serializer_context())
            return Response(serializer.data)
        else:
            # Return default dates if none exist
            default_year = timezone.now().year + 1
            default_data = {
                'year': default_year,
                'abstractSubmissionOpens': f'January 15, {default_year}',
                'abstractSubmissionDeadline': f'April 30, {default_year}',
                'abstractReviewCompletion': f'June 15, {default_year}',
                'acceptanceNotifications': f'July 1, {default_year}',
                'finalAbstractSubmission': f'August 15, {default_year}',
                'conferencePresentation': f'March 15-17, {default_year}',
                'is_active': False
            }
            return Response(default_data)
    
    @action(detail=True, methods=['patch'])
    def set_active(self, request, pk=None):
        """Set specific important dates as active"""
        dates = self.get_object()
        
        # Deactivate all other dates
        ImportantDates.objects.filter(is_active=True).update(is_active=False)
        
        # Activate this one
        dates.is_active = True
        dates.save()
        
        serializer = self.get_serializer(dates)
        return Response({
            'message': f'Important dates for {dates.year} set as active',
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """Create new important dates"""
        serializer = self.get_serializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        return Response(
            {
                'message': f'Important dates for {instance.year} created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """Update existing important dates"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=partial,
            context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        updated_instance = serializer.save()
        
        return Response({
            'message': f'Important dates for {updated_instance.year} updated successfully',
            'data': serializer.data
        })