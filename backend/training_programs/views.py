# views.py - Complete fixed version

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
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
import stripe
import traceback
import io
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

from .models import TrainingProgram, Registration, ScheduleItem, Speaker, TrainingProgramPayment
from .serializers import (
    TrainingProgramSerializer,
    RegistrationSerializer,
    TrainingProgramAnalyticsSerializer,
    TrainingProgramPaymentSerializer
)

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


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
        """Create new training program with improved error handling"""
        try:
            logger.info(f"Creating training program")
            logger.info(f"Raw request data keys: {list(request.data.keys())}")
            logger.info(f"Files: {list(request.FILES.keys()) if request.FILES else 'None'}")
            
            # Process form data including files
            processed_data = self.process_form_data(request.data, request.FILES)
            logger.info(f"Processed data keys: {list(processed_data.keys())}")
            
            # Log specific field values for debugging
            debug_fields = ['start_date', 'end_date', 'registration_deadline', 'max_participants', 'price']
            for field in debug_fields:
                if field in processed_data:
                    logger.info(f"{field}: {processed_data[field]} (type: {type(processed_data[field])})")
            
            serializer = self.get_serializer(data=processed_data)
            if not serializer.is_valid():
                logger.error(f"Training program validation errors: {serializer.errors}")
                # Return detailed validation errors
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors,
                    'processed_data': {k: str(v) for k, v in processed_data.items() if k != 'image'}  # Don't log file data
                }, status=status.HTTP_400_BAD_REQUEST)

            instance = serializer.save()
            logger.info(f"Training program created successfully with ID: {instance.id}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating training program: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create training program: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_form_data(self, data, files=None):
        """Process form data with improved handling of required fields"""
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
        
        # Required fields that must have values
        required_fields = {
            'title': '',
            'description': '',
            'category': '',
            'instructor': '',
            'start_date': None,
            'end_date': None,
            'registration_deadline': None,
            'max_participants': 1,
            'price': 0.0,
            'cme_credits': 0
        }
        
        logger.info("Processing form data...")
        
        # Process all data fields
        for key, value in data.items():
            # Skip file fields (they're handled separately)
            if hasattr(value, 'file'):
                continue
                
            # Map frontend field names to backend field names
            backend_key = field_mapping.get(key, key)
            
            # Log the processing of each field
            logger.debug(f"Processing {key} -> {backend_key}: {value} (type: {type(value)})")
            
            # Handle specific field types
            if backend_key in ['prerequisites', 'learning_outcomes', 'topics', 
                              'target_audience', 'materials', 'schedule', 'speakers']:
                # Handle JSON array fields
                processed_data[backend_key] = self._process_json_field(value, backend_key)
            elif backend_key == 'is_featured':
                # Handle boolean fields
                processed_data[backend_key] = self._process_boolean_field(value)
            elif backend_key in ['max_participants', 'cme_credits', 'passing_score']:
                # Handle integer fields
                processed_data[backend_key] = self._process_integer_field(value, backend_key)
            elif backend_key == 'price':
                # Handle decimal fields
                processed_data[backend_key] = self._process_decimal_field(value)
            elif backend_key in ['start_date', 'end_date', 'registration_deadline']:
                # Handle date fields - these are required
                processed_value = self._process_date_field(value, backend_key)
                if processed_value is not None:
                    processed_data[backend_key] = processed_value
            elif backend_key == 'image_url':
                # Handle URL fields
                processed_data[backend_key] = self._process_url_field(value)
            else:
                # Handle regular string fields
                if value is not None and str(value).strip():
                    processed_data[backend_key] = str(value).strip()

        # Handle file uploads
        if files and 'image' in files:
            processed_data['image'] = files['image']

        # Ensure all required fields have values
        for field, default_value in required_fields.items():
            if field not in processed_data:
                if default_value is not None:
                    processed_data[field] = default_value
                    logger.warning(f"Required field {field} missing, using default: {default_value}")
                else:
                    logger.error(f"Required field {field} is missing and has no default value")
        
        # Validate that we have the minimum required fields
        missing_required = []
        for field in ['title', 'description', 'category', 'instructor', 'start_date', 'end_date', 'registration_deadline']:
            if field not in processed_data or not processed_data[field]:
                missing_required.append(field)
        
        if missing_required:
            logger.error(f"Missing required fields: {missing_required}")
        
        logger.info(f"Final processed data keys: {list(processed_data.keys())}")
        return processed_data

    def _process_json_field(self, value, field_name):
        """Process JSON array fields"""
        try:
            if isinstance(value, str) and value.strip():
                return json.loads(value)
            elif isinstance(value, list):
                return value
            else:
                return []
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse JSON for {field_name}: {value}")
            return []

    def _process_boolean_field(self, value):
        """Process boolean fields"""
        if isinstance(value, str):
            return value.lower() in ['true', '1', 'yes']
        return bool(value)

    def _process_integer_field(self, value, field_name):
        """Process integer fields with validation"""
        if not value or str(value).strip() == '':
            return 1 if field_name == 'max_participants' else 0
        try:
            int_value = int(float(str(value)))  # Handle decimal strings like "50.0"
            if field_name == 'max_participants' and int_value <= 0:
                return 1  # Minimum 1 participant
            return max(0, int_value)  # Ensure non-negative
        except (ValueError, TypeError):
            logger.warning(f"Invalid integer value for {field_name}: {value}")
            return 1 if field_name == 'max_participants' else 0

    def _process_decimal_field(self, value):
        """Process decimal fields"""
        if not value or str(value).strip() == '':
            return 0.0
        try:
            return max(0.0, float(value))  # Ensure non-negative
        except (ValueError, TypeError):
            logger.warning(f"Invalid decimal value for price: {value}")
            return 0.0

    def _process_date_field(self, value, field_name):
        """Process date fields"""
        if not value or str(value).strip() == '':
            logger.error(f"Empty date value for required field {field_name}")
            return None
        
        # Value should be in YYYY-MM-DD format
        date_str = str(value).strip()
        if len(date_str) >= 10:  # At least YYYY-MM-DD
            return date_str[:10]  # Take only the date part
        
        logger.error(f"Invalid date format for {field_name}: {value}")
        return None

    def _process_url_field(self, value):
        """Process URL fields"""
        if not value or str(value).strip() == '':
            return ''
        
        url_str = str(value).strip()
        # Basic validation - just check if it looks like a URL
        if url_str.startswith(('http://', 'https://')) or url_str == '':
            return url_str
        else:
            logger.warning(f"Invalid URL format: {url_str}")
            return ''  # Return empty string for invalid URLs

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update existing training program"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            logger.info(f"Updating training program {instance.id}")
            
            # Process form data
            processed_data = self.process_form_data(request.data, request.FILES)
            
            serializer = self.get_serializer(instance, data=processed_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Training program update validation errors: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            instance = serializer.save()
            logger.info(f"Training program {instance.id} updated successfully")
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error updating training program: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update training program: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        """Create new registration with improved duplicate handling"""
        try:
            logger.info(f"Registration request data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Registration validation errors: {serializer.errors}")
                # Return detailed validation errors
                return Response(
                    {
                        'error': 'Validation failed',
                        'details': serializer.errors,
                        'request_data': request.data
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check for duplicate registration (additional safety check)
            program = serializer.validated_data['program']
            participant_email = serializer.validated_data['participant_email']
            
            # Check if email is already registered for this program
            existing_registration = Registration.objects.filter(
                program=program,
                participant_email=participant_email.lower().strip()
            ).first()
            
            if existing_registration:
                return Response(
                    {
                        'error': 'You have already registered for this training program.',
                        'registration_id': existing_registration.id,
                        'status': existing_registration.status
                    },
                    status=status.HTTP_409_CONFLICT
                )

            # Check if payment is required
            amount = program.price or 0
            
            if amount > 0:
                # Payment required - validate data but don't save yet
                # Convert validated data to dict and remove non-serializable objects
                registration_data = dict(serializer.validated_data)
                # Remove the program object as it's not JSON serializable
                if 'program' in registration_data:
                    del registration_data['program']
                
                # Return payment info without creating registration
                return Response({
                    'success': True,
                    'message': 'Registration data validated. Payment required.',
                    'registration_data': registration_data,
                    'payment_required': True,
                    'amount': float(amount),
                    'program_id': program.id
                }, status=status.HTTP_200_OK)
            else:
                # No payment required - create registration immediately
                # Check if program is full
                if program.is_full:
                    # Create with waitlisted status
                    serializer.validated_data['status'] = 'Waitlisted'
                
                registration = serializer.save()
                registration.payment_status = 'free'
                registration.save()
                
                # Send confirmation email
                try:
                    self.send_registration_confirmation(registration)
                    logger.info(f"Confirmation email sent for registration {registration.id}")
                except Exception as e:
                    logger.error(f"Failed to send confirmation email: {str(e)}")
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating registration: {str(e)}")
            return Response(
                {'error': f'Failed to create registration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def send_registration_confirmation(self, registration):
        """Send registration confirmation email"""
        subject = f"Registration Confirmation: {registration.program.title}"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [registration.participant_email]

        context = {
            'registration': registration,
            'program': registration.program,
            'participant_name': registration.participant_name,
            'company_name': getattr(settings, 'COMPANY_NAME', 'Our Company'),
            'contact_email': getattr(settings, 'CONTACT_EMAIL', 'support@example.com'),
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'https://example.com')
        }

        try:
            html_content = render_to_string("training/emails/registration_confirmation.html", context)
            
            text_content = f"""Dear {registration.participant_name},

Thank you for registering for the training program: {registration.program.title}

Program Details:
- Type: {registration.program.type}
- Start Date: {registration.program.start_date}
- End Date: {registration.program.end_date}
- Format: {registration.program.format}
- Location: {registration.program.location}

Your registration status: {registration.status}

You will receive further details about the program closer to the start date.

If you have any questions, please contact us at {getattr(settings, 'CONTACT_EMAIL', 'support@example.com')}.

Best regards,
The {getattr(settings, 'COMPANY_NAME', 'Our Company')} Team
"""

            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            logger.info(f"Registration confirmation sent to {registration.participant_email}")
            
        except Exception as e:
            logger.error(f"Failed to send registration confirmation to {registration.participant_email}: {str(e)}")
            raise
    
    @action(detail=True, methods=['post'])
    def resend_confirmation(self, request, pk=None):
        """Resend registration confirmation email"""
        registration = self.get_object()
        
        try:
            self.send_registration_confirmation(registration)
            return Response({
                'success': True,
                'message': f'Confirmation email sent to {registration.participant_email}'
            })
        except Exception as e:
            logger.error(f"Failed to resend confirmation email: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send confirmation email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


class TrainingProgramPaymentView(APIView):
    """Handle training program payment creation"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Create Stripe checkout session for training program payment"""
        try:
            program_id = request.data.get('program_id')
            registration_data = request.data.get('registration_data')
            amount = request.data.get('amount')
            
            if not all([program_id, registration_data, amount]):
                return Response(
                    {'error': 'Missing required fields'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get program
            try:
                program = TrainingProgram.objects.get(id=program_id)
            except TrainingProgram.DoesNotExist:
                return Response(
                    {'error': 'Training program not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create Stripe checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Training Program Registration: {program.title}',
                            'description': f'Registration for {program.title}',
                        },
                        'unit_amount': int(float(amount) * 100),  # Convert to cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'{settings.FRONTEND_URL}/training-program-payment-success?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.FRONTEND_URL}/training-program-payment-canceled?program_id={program_id}',
                metadata={
                    'program_id': str(program_id),
                    'registration_data': json.dumps(registration_data),
                    'registration_type': registration_data.get('registration_type', 'regular'),
                }
            )
            
            return Response({'sessionId': session.id})
            
        except Exception as e:
            logger.error(f"Error creating training program payment session: {str(e)}")
            return Response(
                {'error': 'Failed to create payment session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrainingProgramPaymentWebhook(APIView):
    """Handle Stripe webhook for training program payments"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Process Stripe webhook events"""
        try:
            payload = request.body
            sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
            
            # Verify webhook signature
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
                )
            except ValueError:
                return Response({'error': 'Invalid payload'}, status=400)
            except stripe.error.SignatureVerificationError:
                return Response({'error': 'Invalid signature'}, status=400)
            
            # Handle the event
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                
                # Get metadata
                program_id = session['metadata']['program_id']
                registration_data = json.loads(session['metadata']['registration_data'])
                registration_type = session['metadata']['registration_type']
                
                # Get program
                program = TrainingProgram.objects.get(id=program_id)
                
                # Create registration
                registration = Registration.objects.create(
                    program=program,
                    participant_name=registration_data['participant_name'],
                    participant_email=registration_data['participant_email'],
                    participant_phone=registration_data.get('participant_phone', ''),
                    organization=registration_data.get('organization', ''),
                    profession=registration_data.get('profession', ''),
                    experience=registration_data.get('experience', '1-2 years'),
                    status='Confirmed',
                    payment_status='paid',
                    special_requests=registration_data.get('special_requests', ''),
                )
                
                # Create payment record
                TrainingProgramPayment.objects.create(
                    program=program,
                    registration=registration,
                    amount=float(session['amount_total']) / 100,
                    currency=session['currency'],
                    stripe_checkout_session_id=session['id'],
                    status='succeeded',
                    payment_type='registration',
                    registration_type=registration_type,
                )
                
                # Update program enrollment count
                program.current_enrollments += 1
                program.save(update_fields=['current_enrollments'])
                
                # Send confirmation email
                try:
                    self.send_training_program_payment_confirmation(registration, program, session)
                    logger.info(f"Training program payment confirmation sent for registration {registration.id}")
                except Exception as e:
                    logger.error(f"Failed to send training program payment confirmation: {str(e)}")
            
            return Response({'status': 'success'})
            
        except Exception as e:
            logger.error(f"Training program payment webhook error: {str(e)}")
            return Response(
                {'error': 'Webhook processing failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def send_training_program_payment_confirmation(self, registration, program, session):
        """Send training program payment confirmation email"""
        subject = f"Payment Confirmation: {program.title}"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
        to = [registration.participant_email]

        context = {
            'registration': registration,
            'program': program,
            'session': session,
            'company_name': getattr(settings, 'COMPANY_NAME', 'African Consortium for Neurology in Africa'),
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'),
            'contact_email': getattr(settings, 'CONTACT_EMAIL', 'contact@acna.org')
        }

        try:
            # Simple text email
            text_content = f"""Dear {registration.participant_name},

Thank you for your payment and registration for the training program: {program.title}

Payment Details:
- Amount: ${float(session['amount_total']) / 100:.2f}
- Payment ID: {session['id']}
- Status: Paid

Program Details:
- Start Date: {program.start_date}
- End Date: {program.end_date}
- Duration: {program.duration}
- Format: {program.format}
- Location: {program.location}

Your registration has been confirmed. You will receive further details closer to the program start date.

If you have any questions, please contact us at {context['contact_email']}.

Best regards,
The {context['company_name']} Team
"""

            # Try to send HTML email if templates exist, otherwise send plain text
            try:
                html_content = render_to_string("training_programs/emails/payment_confirmation.html", context)
                msg = EmailMultiAlternatives(subject, text_content, from_email, to)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except Exception:
                # Fallback to plain text email
                from django.core.mail import send_mail
                send_mail(subject, text_content, from_email, to, fail_silently=False)
            
            logger.info(f"Training program payment confirmation sent to {registration.participant_email}")
            
        except Exception as e:
            logger.error(f"Failed to send training program payment confirmation to {registration.participant_email}: {str(e)}")
            raise


class TrainingProgramPaymentVerify(APIView):
    """Verify training program payment status"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Verify payment status using session ID"""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get payment record
            payment = TrainingProgramPayment.objects.get(
                stripe_checkout_session_id=session_id
            )
            
            return Response({
                'success': True,
                'payment': TrainingProgramPaymentSerializer(payment).data,
                'registration': RegistrationSerializer(payment.registration).data,
                'program': TrainingProgramSerializer(payment.program).data,
            })
            
        except TrainingProgramPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error verifying training program payment: {str(e)}")
            return Response(
                {'error': 'Failed to verify payment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrainingProgramInvoiceDownload(APIView):
    """Generate and download PDF invoice for training program payment"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find the payment record
            payment = TrainingProgramPayment.objects.get(
                stripe_checkout_session_id=session_id,
                status='succeeded'
            )
            
            # Create PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Company info
            company_name = getattr(settings, 'COMPANY_NAME', 'ACNA')
            company_address = getattr(settings, 'COMPANY_ADDRESS', '')
            company_phone = getattr(settings, 'COMPANY_PHONE', '')
            company_email = getattr(settings, 'COMPANY_EMAIL', '')
            
            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=1  # Center alignment
            )
            story.append(Paragraph("INVOICE", title_style))
            story.append(Spacer(1, 20))
            
            # Company details
            company_style = ParagraphStyle(
                'CompanyStyle',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=6
            )
            
            story.append(Paragraph(f"<b>{company_name}</b>", company_style))
            if company_address:
                story.append(Paragraph(company_address, company_style))
            if company_phone:
                story.append(Paragraph(f"Phone: {company_phone}", company_style))
            if company_email:
                story.append(Paragraph(f"Email: {company_email}", company_style))
            
            story.append(Spacer(1, 30))
            
            # Invoice details
            invoice_data = [
                ['Invoice Number:', f"TP-{payment.id:06d}"],
                ['Invoice Date:', payment.created_at.strftime('%B %d, %Y')],
                ['Payment ID:', payment.stripe_checkout_session_id],
                ['Status:', payment.status.title()],
            ]
            
            invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
            invoice_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            story.append(invoice_table)
            story.append(Spacer(1, 20))
            
            # Customer details
            customer_data = [
                ['Bill To:', ''],
                ['Name:', payment.registration.participant_name],
                ['Email:', payment.registration.participant_email],
                ['Organization:', payment.registration.organization],
                ['Phone:', payment.registration.participant_phone],
            ]
            
            customer_table = Table(customer_data, colWidths=[2*inch, 3*inch])
            customer_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            story.append(customer_table)
            story.append(Spacer(1, 30))
            
            # Training program details
            program_data = [
                ['Training Program Details', ''],
                ['Program:', payment.program.title],
                ['Start Date:', payment.program.start_date.strftime('%B %d, %Y')],
                ['End Date:', payment.program.end_date.strftime('%B %d, %Y')],
                ['Location:', payment.program.location],
                ['Instructor:', payment.program.instructor],
            ]
            
            program_table = Table(program_data, colWidths=[2*inch, 3*inch])
            program_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ]))
            
            story.append(program_table)
            story.append(Spacer(1, 30))
            
            # Payment summary
            payment_data = [
                ['Description', 'Amount'],
                [f'Training Program: {payment.program.title}', f"{payment.currency} {payment.amount:.2f}"],
                ['', ''],
                ['Total Amount:', f"{payment.currency} {payment.amount:.2f}"],
            ]
            
            payment_table = Table(payment_data, colWidths=[4*inch, 1*inch])
            payment_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
            ]))
            
            story.append(payment_table)
            story.append(Spacer(1, 30))
            
            # Footer
            footer_style = ParagraphStyle(
                'FooterStyle',
                parent=styles['Normal'],
                fontSize=9,
                alignment=1,  # Center alignment
                textColor=colors.grey
            )
            
            story.append(Paragraph("Thank you for your registration!", footer_style))
            story.append(Paragraph("For any questions, please contact us.", footer_style))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            # Create response
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="training-program-invoice-{payment.id}.pdf"'
            
            return response
            
        except TrainingProgramPayment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating invoice: {str(e)}")
            return Response(
                {'error': f'Failed to generate invoice: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )