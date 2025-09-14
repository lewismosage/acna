from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count, Sum, Q, F, Avg
from django.utils import timezone
from datetime import timedelta, date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import HttpResponse
from django.db import transaction
import logging
import json
import csv
import traceback
import re

from .models import TrainingProgram, Registration, ScheduleItem, Speaker
from .serializers import (
    TrainingProgramSerializer,
    RegistrationSerializer,
    TrainingProgramAnalyticsSerializer
)

logger = logging.getLogger(__name__)


class TrainingProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Training Programs with comprehensive CRUD operations
    """
    queryset = TrainingProgram.objects.all().order_by('-created_at')
    serializer_class = TrainingProgramSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'instructor', 'category']
    ordering_fields = ['title', 'start_date', 'created_at', 'price', 'current_enrollments']
    filterset_fields = ['status', 'type', 'category', 'format', 'is_featured']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """Get queryset with optional filtering"""
        queryset = super().get_queryset()
        
        # Apply additional filters from query params
        status_filter = self.request.query_params.get('status')
        category_filter = self.request.query_params.get('category')
        featured_filter = self.request.query_params.get('featured')
        search_filter = self.request.query_params.get('search')
        type_filter = self.request.query_params.get('type')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        if featured_filter:
            is_featured = featured_filter.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        if search_filter:
            queryset = queryset.filter(
                Q(title__icontains=search_filter) |
                Q(description__icontains=search_filter) |
                Q(instructor__icontains=search_filter) |
                Q(category__icontains=search_filter)
            )

        return queryset.select_related().prefetch_related('schedule', 'speakers')

    @transaction.atomic
    def create(self, request):
        """Create new training program"""
        try:
            logger.info(f"Creating training program with files: image={bool(request.FILES.get('image'))}")
            
            # Process form data including files
            processed_data = self.process_form_data(request.data, request.FILES)
            
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Training program validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            instance = serializer.save()
            logger.info(f"Training program created with ID: {instance.id}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating training program: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create training program: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update existing training program"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            logger.info(f"Updating training program {instance.id} with data: {request.data}")
            
            # Process form data
            processed_data = self.process_form_data(request.data, request.FILES)
            
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Training program update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            instance = serializer.save()
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error updating training program: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update training program: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data, files=None):
        """Process form data, handling camelCase to snake_case conversion and JSON fields"""
        processed_data = {}
        
        # Field mappings from frontend camelCase to backend snake_case
        field_mapping = {
            'isFeatured': 'is_featured',
            'maxParticipants': 'max_participants',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'registrationDeadline': 'registration_deadline',
            'imageUrl': 'image_url',
            'learningOutcomes': 'learning_outcomes',
            'targetAudience': 'target_audience',
            'certificationType': 'certificate_type',
            'cmeCredits': 'cme_credits',
            'assessmentMethod': 'assessment_method',
            'passingScore': 'passing_score',
        }
        
        # Process form data
        for key, value in data.items():
            # Map frontend field names to backend field names
            backend_key = field_mapping.get(key, key)
            
            # Handle JSON array fields
            if backend_key in ['prerequisites', 'learning_outcomes', 'topics', 
                              'target_audience', 'materials', 'schedule', 'speakers']:
                try:
                    if isinstance(value, str):
                        processed_data[backend_key] = json.loads(value)
                    elif isinstance(value, list):
                        processed_data[backend_key] = value
                    else:
                        processed_data[backend_key] = []
                except json.JSONDecodeError:
                    processed_data[backend_key] = []
            # Handle boolean fields
            elif backend_key == 'is_featured':
                if isinstance(value, str):
                    processed_data[backend_key] = value.lower() == 'true'
                else:
                    processed_data[backend_key] = bool(value)
            # Handle numeric fields
            elif backend_key in ['max_participants', 'price', 'cme_credits', 'passing_score']:
                try:
                    if backend_key == 'price':
                        processed_data[backend_key] = float(value) if value else 0.0
                    else:
                        processed_data[backend_key] = int(value) if value else 0
                except (ValueError, TypeError):
                    processed_data[backend_key] = 0
            # Handle regular fields
            elif value is not None and value != '':
                processed_data[backend_key] = value

        # Handle file uploads
        if files and 'image' in files:
            processed_data['image'] = files['image']
        
        return processed_data

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured training programs"""
        try:
            queryset = self.get_queryset().filter(is_featured=True)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching featured programs: {str(e)}")
            return Response(
                {'error': 'Failed to fetch featured programs'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get comprehensive analytics for training programs"""
        try:
            # Total counts
            total_programs = TrainingProgram.objects.count()
            total_enrollments = Registration.objects.filter(status='Confirmed').count()
            
            # Calculate total revenue from confirmed registrations
            confirmed_registrations = Registration.objects.filter(status='Confirmed').select_related('program')
            total_revenue = sum(reg.program.price for reg in confirmed_registrations)
            
            # Calculate average fill rate
            programs_with_participants = TrainingProgram.objects.filter(max_participants__gt=0)
            fill_rates = [(p.current_enrollments / p.max_participants) * 100 for p in programs_with_participants]
            average_fill_rate = sum(fill_rates) / len(fill_rates) if fill_rates else 0
            
            # Programs by status
            status_counts = TrainingProgram.objects.values('status').annotate(count=Count('id'))
            programs_by_status = {
                'published': 0,
                'draft': 0,
                'archived': 0,
                'featured': TrainingProgram.objects.filter(is_featured=True).count()
            }
            for item in status_counts:
                key = item['status'].lower()
                if key in programs_by_status:
                    programs_by_status[key] = item['count']
            
            # Programs by type
            type_counts = TrainingProgram.objects.values('type').annotate(count=Count('id'))
            programs_by_type = {item['type']: item['count'] for item in type_counts}
            
            # Monthly revenue (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            monthly_registrations = Registration.objects.filter(
                status='Confirmed',
                registration_date__gte=thirty_days_ago
            ).select_related('program')
            monthly_revenue = sum(reg.program.price for reg in monthly_registrations)
            
            # Upcoming programs (next 30 days)
            thirty_days_ahead = date.today() + timedelta(days=30)
            upcoming_programs = TrainingProgram.objects.filter(
                start_date__gte=date.today(),
                start_date__lte=thirty_days_ahead,
                status='Published'
            ).count()
            
            # Top programs by enrollment
            top_programs_query = TrainingProgram.objects.annotate(
                enrollment_count=Count('registrations', filter=Q(registrations__status='Confirmed'))
            ).order_by('-enrollment_count')[:5]
            
            top_programs = []
            for program in top_programs_query:
                program_revenue = program.registrations.filter(status='Confirmed').count() * program.price
                top_programs.append({
                    'id': program.id,
                    'title': program.title,
                    'category': program.category,
                    'enrollments': program.enrollment_count,
                    'revenue': float(program_revenue)
                })
            
            analytics_data = {
                'total_programs': total_programs,
                'total_enrollments': total_enrollments,
                'total_revenue': float(total_revenue),
                'average_fill_rate': float(average_fill_rate),
                'programs_by_status': programs_by_status,
                'programs_by_type': programs_by_type,
                'monthly_revenue': float(monthly_revenue),
                'upcoming_programs': upcoming_programs,
                'top_programs': top_programs,
            }
            
            serializer = TrainingProgramAnalyticsSerializer(analytics_data)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching analytics: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch analytics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a training program"""
        try:
            instance = self.get_object()
            instance.is_featured = not instance.is_featured
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error toggling featured status: {str(e)}")
            return Response(
                {'error': f'Failed to toggle featured status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update program status"""
        try:
            new_status = request.data.get('status')
            if new_status not in ['Published', 'Draft', 'Archived']:
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            instance = self.get_object()
            instance.status = new_status
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories"""
        try:
            categories = TrainingProgram.objects.values_list('category', flat=True).distinct()
            return Response(sorted([cat for cat in categories if cat]))
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return Response(
                {'error': 'Failed to fetch categories'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def instructors(self, request):
        """Get all unique instructors"""
        try:
            instructors = TrainingProgram.objects.values_list('instructor', flat=True).distinct()
            return Response(sorted([inst for inst in instructors if inst]))
        except Exception as e:
            logger.error(f"Error fetching instructors: {str(e)}")
            return Response(
                {'error': 'Failed to fetch instructors'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def target_audiences(self, request):
        """Get all unique target audiences"""
        try:
            all_audiences = set()
            programs = TrainingProgram.objects.all()
            for program in programs:
                if program.target_audience:
                    all_audiences.update(program.target_audience)
            return Response(sorted(all_audiences))
        except Exception as e:
            logger.error(f"Error fetching target audiences: {str(e)}")
            return Response(
                {'error': 'Failed to fetch target audiences'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get registrations for a specific program"""
        try:
            program = self.get_object()
            registrations = Registration.objects.filter(program=program).order_by('-registration_date')
            serializer = RegistrationSerializer(registrations, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching program registrations: {str(e)}")
            return Response(
                {'error': 'Failed to fetch registrations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update status for multiple programs"""
        try:
            ids = request.data.get('ids', [])
            new_status = request.data.get('status')
            
            if new_status not in ['Published', 'Draft', 'Archived']:
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            programs = TrainingProgram.objects.filter(id__in=ids)
            programs.update(status=new_status)
            
            serializer = self.get_serializer(programs, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error bulk updating status: {str(e)}")
            return Response(
                {'error': f'Failed to bulk update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete multiple programs"""
        try:
            ids = request.data.get('ids', [])
            TrainingProgram.objects.filter(id__in=ids).delete()
            return Response({'success': True})
            
        except Exception as e:
            logger.error(f"Error bulk deleting: {str(e)}")
            return Response(
                {'error': f'Failed to bulk delete: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export training programs to CSV"""
        try:
            # Create HTTP response with CSV content type
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="training_programs.csv"'
            
            writer = csv.writer(response)
            
            # Write header row
            writer.writerow([
                'ID', 'Title', 'Type', 'Category', 'Status', 'Featured',
                'Duration', 'Format', 'Location', 'Max Participants', 'Current Enrollments',
                'Instructor', 'Start Date', 'End Date', 'Registration Deadline',
                'Price', 'Currency', 'CME Credits', 'Created At'
            ])
            
            # Write data rows
            programs = self.get_queryset()
            for program in programs:
                writer.writerow([
                    program.id,
                    program.title,
                    program.type,
                    program.category,
                    program.status,
                    'Yes' if program.is_featured else 'No',
                    program.duration,
                    program.format,
                    program.location,
                    program.max_participants,
                    program.current_enrollments,
                    program.instructor,
                    program.start_date,
                    program.end_date,
                    program.registration_deadline,
                    program.price,
                    program.currency,
                    program.cme_credits,
                    program.created_at.strftime('%Y-%m-%d'),
                ])
            
            return response
            
        except Exception as e:
            logger.error(f"Error exporting programs: {str(e)}")
            return Response(
                {'error': 'Failed to export programs'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Upload image for training program"""
        try:
            if 'image' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            image_file = request.FILES['image']
            
            # For now, return a placeholder response
            # In production, you would save the file and return the URL
            return Response({
                'url': f'/media/training_programs/{image_file.name}',
                'filename': image_file.name,
                'path': f'training_programs/{image_file.name}'
            })
            
        except Exception as e:
            logger.error(f"Error uploading image: {str(e)}")
            return Response(
                {'error': 'Failed to upload image'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Registration management
    """
    queryset = Registration.objects.all().order_by('-registration_date')
    serializer_class = RegistrationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['participant_name', 'participant_email', 'program__title']
    ordering_fields = ['registration_date', 'participant_name', 'status']
    filterset_fields = ['status', 'payment_status', 'program', 'profession', 'experience']

    def get_queryset(self):
        """Get queryset with optional filtering"""
        queryset = super().get_queryset().select_related('program')
        
        # Apply filters from query params
        program_id = self.request.query_params.get('program_id')
        status_filter = self.request.query_params.get('status')
        payment_status_filter = self.request.query_params.get('payment_status')
        search_filter = self.request.query_params.get('search')

        if program_id:
            queryset = queryset.filter(program_id=program_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_status_filter:
            queryset = queryset.filter(payment_status=payment_status_filter)
        if search_filter:
            queryset = queryset.filter(
                Q(participant_name__icontains=search_filter) |
                Q(participant_email__icontains=search_filter) |
                Q(program__title__icontains=search_filter)
            )

        return queryset

    def create(self, request):
        """Create new registration"""
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Check if program is full
            program = serializer.validated_data['program']
            if program.is_full:
                # Create with waitlisted status
                serializer.validated_data['status'] = 'Waitlisted'

            registration = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating registration: {str(e)}")
            return Response(
                {'error': f'Failed to create registration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Update registration"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            old_status = instance.status
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Handle status changes that affect enrollment count
            new_status = serializer.validated_data.get('status', old_status)
            
            registration = serializer.save()
            
            # If status changed from/to Confirmed, update enrollment count
            if old_status != new_status and ('Confirmed' in [old_status, new_status]):
                registration.update_enrollment_count()

            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error updating registration: {str(e)}")
            return Response(
                {'error': f'Failed to update registration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Delete registration and update enrollment count"""
        try:
            instance = self.get_object()
            program = instance.program
            
            # Delete registration
            self.perform_destroy(instance)
            
            # Update enrollment count
            confirmed_count = Registration.objects.filter(
                program=program,
                status='Confirmed'
            ).count()
            program.current_enrollments = confirmed_count
            program.save(update_fields=['current_enrollments'])
            
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.error(f"Error deleting registration: {str(e)}")
            return Response(
                {'error': f'Failed to delete registration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export registrations to CSV"""
        try:
            # Create HTTP response with CSV content type
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="registrations.csv"'
            
            writer = csv.writer(response)
            
            # Write header row
            writer.writerow([
                'ID', 'Program', 'Participant Name', 'Email', 'Phone', 'Organization',
                'Profession', 'Experience', 'Status', 'Payment Status',
                'Registration Date', 'Special Requests'
            ])
            
            # Write data rows
            registrations = self.get_queryset()
            for reg in registrations:
                writer.writerow([
                    reg.id,
                    reg.program.title,
                    reg.participant_name,
                    reg.participant_email,
                    reg.participant_phone,
                    reg.organization,
                    reg.profession,
                    reg.experience,
                    reg.status,
                    reg.payment_status,
                    reg.registration_date.strftime('%Y-%m-%d %H:%M:%S'),
                    reg.special_requests,
                ])
            
            return response
            
        except Exception as e:
            logger.error(f"Error exporting registrations: {str(e)}")
            return Response(
                {'error': 'Failed to export registrations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )