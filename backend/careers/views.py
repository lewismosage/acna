from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.http import HttpResponse
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import csv
import json
import logging
from datetime import datetime, timedelta

# Configure logger
logger = logging.getLogger(__name__)

from .models import JobOpportunity, JobApplication, VolunteerSubmission
from .serializers import (
    JobOpportunitySerializer, JobOpportunityListSerializer, JobOpportunityStatusUpdateSerializer,
    JobApplicationSerializer, JobApplicationListSerializer, JobApplicationStatusUpdateSerializer,
    VolunteerSubmissionSerializer, VolunteerSubmissionListSerializer, VolunteerSubmissionStatusUpdateSerializer
)


class JobOpportunityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job opportunities.
    Provides CRUD operations, filtering, search, and analytics.
    """
    queryset = JobOpportunity.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'type', 'level', 'location']
    search_fields = ['title', 'description', 'department', 'location']
    ordering_fields = ['created_at', 'updated_at', 'title', 'closing_date', 'posted_date']
    ordering = ['-created_at']
    
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return JobOpportunityListSerializer
        elif self.action == 'update_status':
            return JobOpportunityStatusUpdateSerializer
        return JobOpportunitySerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Additional custom filtering
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(department__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update job opportunity status"""
        job = self.get_object()
        serializer = self.get_serializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full job data after status update
        full_serializer = JobOpportunitySerializer(job)
        return Response(full_serializer.data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get analytics data for job opportunities"""
        # Get basic counts
        total_opportunities = JobOpportunity.objects.count()
        active_opportunities = JobOpportunity.objects.filter(status='Active').count()
        draft_opportunities = JobOpportunity.objects.filter(status='Draft').count()
        closed_opportunities = JobOpportunity.objects.filter(status='Closed').count()
        
        # Application counts
        total_applications = JobApplication.objects.count()
        new_applications = JobApplication.objects.filter(status='New').count()
        shortlisted_applications = JobApplication.objects.filter(status='Shortlisted').count()
        
        # Volunteer counts
        total_volunteers = VolunteerSubmission.objects.count()
        active_volunteers = VolunteerSubmission.objects.filter(status='Active').count()
        
        # Monthly applications (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_applications = JobApplication.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        # Opportunities by department
        opportunities_by_department = dict(
            JobOpportunity.objects.values('department').annotate(
                count=Count('id')
            ).values_list('department', 'count')
        )
        
        # Applications by status
        applications_by_status = dict(
            JobApplication.objects.values('status').annotate(
                count=Count('id')
            ).values_list('status', 'count')
        )
        
        # Top opportunities by application count
        top_opportunities = list(
            JobOpportunity.objects.annotate(
                applications_count=Count('applications')
            ).order_by('-applications_count')[:5].values(
                'id', 'title', 'applications_count'
            )
        )
        
        return Response({
            'total_opportunities': total_opportunities,
            'active_opportunities': active_opportunities,
            'draft_opportunities': draft_opportunities,
            'closed_opportunities': closed_opportunities,
            'total_applications': total_applications,
            'new_applications': new_applications,
            'shortlisted_applications': shortlisted_applications,
            'total_volunteers': total_volunteers,
            'active_volunteers': active_volunteers,
            'monthly_applications': monthly_applications,
            'opportunities_by_department': opportunities_by_department,
            'applications_by_status': applications_by_status,
            'top_opportunities': top_opportunities,
        })
    
    @action(detail=False, methods=['get'])
    def departments(self, request):
        """Get list of all departments"""
        departments = JobOpportunity.objects.values_list(
            'department', flat=True
        ).distinct().order_by('department')
        return Response(list(departments))
    
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """Get list of all locations"""
        locations = JobOpportunity.objects.values_list(
            'location', flat=True
        ).distinct().order_by('location')
        return Response(list(locations))
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export job opportunities to CSV or Excel"""
        format_type = request.query_params.get('format', 'csv')
        
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        if format_type == 'csv':
            return self._export_csv(queryset, 'job_opportunities')
        elif format_type == 'xlsx':
            return self._export_xlsx(queryset, 'job_opportunities')
        else:
            return Response(
                {'error': 'Invalid format. Use csv or xlsx'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _export_csv(self, queryset, filename):
        """Export queryset to CSV"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Title', 'Department', 'Location', 'Type', 'Level', 'Status',
            'Salary', 'Closing Date', 'Applications Count', 'Posted Date', 'Created At'
        ])
        
        for job in queryset:
            writer.writerow([
                job.id, job.title, job.department, job.location, job.type,
                job.level, job.status, job.salary, job.closing_date,
                job.applications_count, job.posted_date, job.created_at.date()
            ])
        
        return response
    
    def _export_xlsx(self, queryset, filename):
        """Export queryset to Excel (simplified - you'd need openpyxl)"""
        # This is a placeholder - you'd need to install openpyxl and implement Excel export
        return Response(
            {'error': 'Excel export not implemented yet'}, 
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job applications.
    Provides CRUD operations, filtering, and search.
    """
    queryset = JobApplication.objects.all().select_related('opportunity')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'opportunity', 'opportunity__department']
    search_fields = ['applicant_name', 'email', 'opportunity__title', 'location']
    ordering_fields = ['created_at', 'updated_at', 'applicant_name']
    ordering = ['-created_at']
    
    def create(self, request, *args, **kwargs):
        """Create a new job application with duplicate prevention and email notification"""
        try:
            # Check for duplicate application
            opportunity_id = request.data.get('opportunity')
            email = request.data.get('email', '').strip().lower()
            
            if opportunity_id and email:
                existing_application = JobApplication.objects.filter(
                    opportunity_id=opportunity_id,
                    email=email
                ).first()
                
                if existing_application:
                    return Response(
                        {
                            'error': 'You have already applied for this job position.',
                            'message': 'An application with this email address already exists for this opportunity.',
                            'application_id': existing_application.id,
                            'applied_date': existing_application.created_at.strftime('%Y-%m-%d %H:%M:%S')
                        },
                        status=status.HTTP_409_CONFLICT
                    )
            
            # Create the application
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            application = serializer.save()
            
            # Send confirmation email
            try:
                self.send_application_confirmation_email(application)
            except Exception as e:
                logging.error(f"Failed to send application confirmation email: {str(e)}")
                # Don't fail the application creation if email fails
            
            # Return the created application
            response_serializer = JobApplicationSerializer(application)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logging.error(f"Error creating job application: {str(e)}")
            return Response(
                {'error': f'Failed to create application: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def send_application_confirmation_email(self, application):
        """Send confirmation email to job applicant"""
        try:
            # Prepare email context
            context = {
                'applicant_name': application.applicant_name,
                'job_title': application.opportunity.title,
                'job_department': application.opportunity.department,
                'job_location': application.opportunity.location,
                'applied_date': application.created_at.strftime('%B %d, %Y at %I:%M %p'),
                'application_id': application.id,
                'job_url': f"{settings.FRONTEND_URL}/careers/jobs/{application.opportunity.id}",
                'careers_url': f"{settings.FRONTEND_URL}/careers/jobs"
            }
            
            # Render email template
            html_message = render_to_string(
                'careers/emails/job_application_confirmation.html',
                context
            )
            
            # Send email
            send_mail(
                subject=f'Application Received - {application.opportunity.title} | ACNA',
                message=f'Thank you for applying to {application.opportunity.title}. We have received your application and will review it carefully.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.email],
                html_message=html_message,
                fail_silently=False
            )
            
            logging.info(f"Application confirmation email sent to {application.email}")
            
        except Exception as e:
            logging.error(f"Failed to send application confirmation email: {str(e)}")
            raise
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return JobApplicationListSerializer
        elif self.action == 'update_status':
            return JobApplicationStatusUpdateSerializer
        return JobApplicationSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by opportunity ID if provided
        opportunity_id = self.request.query_params.get('opportunity_id', None)
        if opportunity_id:
            queryset = queryset.filter(opportunity_id=opportunity_id)
        
        # Additional custom filtering
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(applicant_name__icontains=search) |
                Q(email__icontains=search) |
                Q(opportunity__title__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update application status"""
        application = self.get_object()
        serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full application data after status update
        full_serializer = JobApplicationSerializer(application)
        return Response(full_serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export applications to CSV or Excel"""
        format_type = request.query_params.get('format', 'csv')
        
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        if format_type == 'csv':
            return self._export_csv(queryset, 'job_applications')
        elif format_type == 'xlsx':
            return self._export_xlsx(queryset, 'job_applications')
        else:
            return Response(
                {'error': 'Invalid format. Use csv or xlsx'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _export_csv(self, queryset, filename):
        """Export queryset to CSV"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Opportunity', 'Applicant Name', 'Email', 'Phone', 'Location',
            'Cover Letter', 'Status', 'Applied Date', 'Created At'
        ])
        
        for app in queryset:
            writer.writerow([
                app.id, app.opportunity.title, app.applicant_name, app.email,
                app.phone, app.location, app.cover_letter[:100] + '...' if app.cover_letter and len(app.cover_letter) > 100 else app.cover_letter or '', 
                app.status, app.applied_date, app.created_at.date()
            ])
        
        return response
    
    def _export_xlsx(self, queryset, filename):
        """Export queryset to Excel (simplified)"""
        return Response(
            {'error': 'Excel export not implemented yet'}, 
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class VolunteerSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing volunteer submissions.
    Provides CRUD operations, filtering, and search.
    """
    queryset = VolunteerSubmission.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'location', 'availability']
    search_fields = ['name', 'email', 'location']
    ordering_fields = ['created_at', 'updated_at', 'name', 'join_date']
    ordering = ['-created_at']
    
    def create(self, request, *args, **kwargs):
        """Create a new volunteer submission with email notification and duplicate prevention"""
        try:
            # Check for duplicate submission
            email = request.data.get('email', '').strip().lower()
            
            if email:
                existing_volunteer = VolunteerSubmission.objects.filter(
                    email=email
                ).first()
                
                if existing_volunteer:
                    return Response(
                        {
                            'error': 'You have already submitted a volunteer application with ACNA.',
                            'message': 'A volunteer submission with this email address already exists.',
                            'submission_id': existing_volunteer.id,
                            'submitted_date': existing_volunteer.created_at.strftime('%Y-%m-%d %H:%M:%S')
                        },
                        status=status.HTTP_409_CONFLICT
                    )
            
            # Create the volunteer submission
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            volunteer = serializer.save()
            
            # Send confirmation email
            try:
                self.send_volunteer_confirmation_email(volunteer)
                logger.info(f"Volunteer confirmation email sent for submission {volunteer.id}")
            except Exception as e:
                logger.error(f"Failed to send volunteer confirmation email: {str(e)}")
                # Don't fail the creation if email fails
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating volunteer submission: {str(e)}")
            return Response(
                {'error': f'Failed to create volunteer submission: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def send_volunteer_confirmation_email(self, volunteer):
        """Send confirmation email to volunteer"""
        try:
            from django.core.mail import send_mail
            from django.template.loader import render_to_string
            from django.conf import settings
            
            # Prepare email context
            context = {
                'volunteer_name': volunteer.name,
                'submission_id': volunteer.id,
                'submitted_date': volunteer.created_at.strftime('%B %d, %Y'),
                'volunteer_url': f'{settings.FRONTEND_URL}/volunteer',
                'careers_url': f'{settings.FRONTEND_URL}/jobs',
            }
            
            # Render email template
            html_message = render_to_string(
                'careers/emails/volunteer_submission_confirmation.html',
                context
            )
            
            # Send email
            send_mail(
                subject='Volunteer Application Received - ACNA',
                message=f'Thank you {volunteer.name} for your volunteer application. We have received your submission and will review it shortly.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[volunteer.email],
                html_message=html_message,
                fail_silently=False,
            )
            
        except Exception as e:
            logger.error(f"Error sending volunteer confirmation email: {str(e)}")
            raise
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return VolunteerSubmissionListSerializer
        elif self.action == 'update_status':
            return VolunteerSubmissionStatusUpdateSerializer
        return VolunteerSubmissionSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Additional custom filtering
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update volunteer status"""
        volunteer = self.get_object()
        serializer = self.get_serializer(volunteer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full volunteer data after status update
        full_serializer = VolunteerSubmissionSerializer(volunteer)
        return Response(full_serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_hours(self, request, pk=None):
        """Update volunteer hours contributed"""
        volunteer = self.get_object()
        hours = request.data.get('hours_contributed')
        
        if hours is None:
            return Response(
                {'error': 'hours_contributed is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            hours = int(hours)
            if hours < 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'hours_contributed must be a non-negative integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        volunteer.hours_contributed = hours
        volunteer.save()
        
        serializer = VolunteerSubmissionSerializer(volunteer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export volunteers to CSV or Excel"""
        format_type = request.query_params.get('format', 'csv')
        
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        if format_type == 'csv':
            return self._export_csv(queryset, 'volunteer_submissions')
        elif format_type == 'xlsx':
            return self._export_xlsx(queryset, 'volunteer_submissions')
        else:
            return Response(
                {'error': 'Invalid format. Use csv or xlsx'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _export_csv(self, queryset, filename):
        """Export queryset to CSV"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Name', 'Email', 'Phone', 'Location', 'Availability',
            'Status', 'Hours Contributed', 'Join Date', 'Created At'
        ])
        
        for volunteer in queryset:
            writer.writerow([
                volunteer.id, volunteer.name, volunteer.email, volunteer.phone,
                volunteer.location, volunteer.availability, volunteer.status,
                volunteer.hours_contributed, volunteer.join_date, volunteer.created_at.date()
            ])
        
        return response
    
    def _export_xlsx(self, queryset, filename):
        """Export queryset to Excel (simplified)"""
        return Response(
            {'error': 'Excel export not implemented yet'}, 
            status=status.HTTP_501_NOT_IMPLEMENTED
        )