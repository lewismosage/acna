from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import Conference, Speaker, Session, Registration, ConferenceView
from .serializers import (
    ConferenceSerializer,
    SpeakerSerializer,
    SessionSerializer,
    RegistrationSerializer,
    ConferenceAnalyticsSerializer
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
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.template import TemplateDoesNotExist
from django.conf import settings

logger = logging.getLogger(__name__)

class ConferenceViewSet(viewsets.ModelViewSet):
    queryset = Conference.objects.all().order_by('-date')
    serializer_class = ConferenceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'type']
    search_fields = ['title', 'description', 'location', 'theme']
    ordering_fields = ['date', 'created_at', 'updated_at']
    ordering = ['-date']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by upcoming conferences
        upcoming = self.request.query_params.get('upcoming', None)
        if upcoming is not None:
            today = timezone.now().date()
            queryset = queryset.filter(date__gte=today)
        
        # Filter by past conferences
        past = self.request.query_params.get('past', None)
        if past is not None:
            today = timezone.now().date()
            queryset = queryset.filter(date__lt=today)
        
        return queryset.prefetch_related('speakers', 'sessions', 'registrations')

    def list(self, request, *args, **kwargs):
        """Override list to include related data"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            
            # Transform the response to include related data with correct field names
            data = serializer.data
            for item in data:
                # Map speakers and sessions to the expected field names
                item['conference_speakers'] = item.get('speakers', [])
                item['conference_sessions'] = item.get('sessions', [])
                item['conference_registrations'] = item.get('registrations', [])
                
            return Response(data)
        except Exception as e:
            logger.error(f"Error in list view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch conferences: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to include related data"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            data = serializer.data
            
            # Map speakers and sessions to the expected field names
            data['conference_speakers'] = data.get('speakers', [])
            data['conference_sessions'] = data.get('sessions', [])
            data['conference_registrations'] = data.get('registrations', [])
            
            return Response(data)
        except Exception as e:
            logger.error(f"Error in retrieve view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch conference: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating conference with data: {request.data}")
            
            # Extract main conference data
            conference_data = {}
            for key, value in request.data.items():
                if key not in ['speakers_data', 'sessions_data'] and value is not None:
                    if key == 'highlights':
                        try:
                            if isinstance(value, str):
                                conference_data[key] = json.loads(value)
                            else:
                                conference_data[key] = value
                        except json.JSONDecodeError:
                            conference_data[key] = []
                    else:
                        conference_data[key] = value

            # Create conference first
            serializer = self.get_serializer(data=conference_data)
            if not serializer.is_valid():
                logger.error(f"Conference validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            conference = serializer.save()
            logger.info(f"Conference created with ID: {conference.id}")

            # Handle speakers
            speakers_data = request.data.get('speakers_data')
            if speakers_data:
                try:
                    if isinstance(speakers_data, str):
                        speakers_data = json.loads(speakers_data)
                    
                    logger.info(f"Creating {len(speakers_data)} speakers")
                    for speaker_data in speakers_data:
                        if isinstance(speaker_data, dict) and speaker_data.get('name', '').strip():
                            # Handle expertise as JSON
                            if 'expertise' in speaker_data:
                                if isinstance(speaker_data['expertise'], list):
                                    speaker_data['expertise'] = json.dumps(speaker_data['expertise'])
                            
                            Speaker.objects.create(conference=conference, **speaker_data)
                            
                except (json.JSONDecodeError, Exception) as e:
                    logger.error(f"Error creating speakers: {str(e)}")

            # Handle sessions
            sessions_data = request.data.get('sessions_data')
            if sessions_data:
                try:
                    if isinstance(sessions_data, str):
                        sessions_data = json.loads(sessions_data)
                    
                    logger.info(f"Creating {len(sessions_data)} sessions")
                    for session_data in sessions_data:
                        if isinstance(session_data, dict) and session_data.get('title', '').strip():
                            Session.objects.create(conference=conference, **session_data)
                            
                except (json.JSONDecodeError, Exception) as e:
                    logger.error(f"Error creating sessions: {str(e)}")

            # Return the created conference with related data
            conference.refresh_from_db()
            response_serializer = self.get_serializer(conference)
            response_data = response_serializer.data
            
            # Map speakers and sessions to expected field names
            response_data['conference_speakers'] = response_data.get('speakers', [])
            response_data['conference_sessions'] = response_data.get('sessions', [])
            response_data['conference_registrations'] = response_data.get('registrations', [])
            
            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating conference: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create conference: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.info(f"Updating conference {instance.id} with data: {request.data}")
            
            # Extract main conference data
            conference_data = {}
            for key, value in request.data.items():
                if key not in ['speakers_data', 'sessions_data'] and value is not None:
                    if key == 'highlights':
                        try:
                            if isinstance(value, str):
                                conference_data[key] = json.loads(value)
                            else:
                                conference_data[key] = value
                        except json.JSONDecodeError:
                            conference_data[key] = []
                    else:
                        conference_data[key] = value

            # Update conference
            serializer = self.get_serializer(instance, data=conference_data, partial=partial)
            if not serializer.is_valid():
                logger.error(f"Conference update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            conference = serializer.save()

            # Handle speakers update
            speakers_data = request.data.get('speakers_data')
            if speakers_data is not None:
                try:
                    if isinstance(speakers_data, str):
                        speakers_data = json.loads(speakers_data)
                    
                    # Clear existing speakers and create new ones
                    conference.speakers.all().delete()
                    
                    for speaker_data in speakers_data:
                        if isinstance(speaker_data, dict) and speaker_data.get('name', '').strip():
                            # Handle expertise as JSON
                            if 'expertise' in speaker_data:
                                if isinstance(speaker_data['expertise'], list):
                                    speaker_data['expertise'] = json.dumps(speaker_data['expertise'])
                            
                            # Remove id if present (for new speakers)
                            speaker_data.pop('id', None)
                            Speaker.objects.create(conference=conference, **speaker_data)
                            
                except (json.JSONDecodeError, Exception) as e:
                    logger.error(f"Error updating speakers: {str(e)}")

            # Handle sessions update
            sessions_data = request.data.get('sessions_data')
            if sessions_data is not None:
                try:
                    if isinstance(sessions_data, str):
                        sessions_data = json.loads(sessions_data)
                    
                    # Clear existing sessions and create new ones
                    conference.sessions.all().delete()
                    
                    for session_data in sessions_data:
                        if isinstance(session_data, dict) and session_data.get('title', '').strip():
                            # Remove id if present (for new sessions)
                            session_data.pop('id', None)
                            Session.objects.create(conference=conference, **session_data)
                            
                except (json.JSONDecodeError, Exception) as e:
                    logger.error(f"Error updating sessions: {str(e)}")

            # Return updated conference with related data
            conference.refresh_from_db()
            response_serializer = self.get_serializer(conference)
            response_data = response_serializer.data
            
            # Map speakers and sessions to expected field names
            response_data['conference_speakers'] = response_data.get('speakers', [])
            response_data['conference_sessions'] = response_data.get('sessions', [])
            response_data['conference_registrations'] = response_data.get('registrations', [])
            
            return Response(response_data)

        except Exception as e:
            logger.error(f"Error updating conference: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to update conference: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        try:
            conference = self.get_object()
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if new_status not in dict(Conference.STATUS_CHOICES).keys():
                return Response(
                    {'error': 'Invalid status value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            conference.status = new_status
            conference.save()
            
            serializer = self.get_serializer(conference)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            return Response(
                {'error': f'Failed to update status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        try:
            # Total conferences
            total_conferences = Conference.objects.count()
            
            # Conferences by status
            conferences_by_status = dict(
                Conference.objects.values_list('status')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Conferences by type
            conferences_by_type = dict(
                Conference.objects.values_list('type')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
            
            # Total registrations
            total_registrations = Registration.objects.count()
            
            # Total revenue
            total_revenue = Registration.objects.filter(
                payment_status='paid'
            ).aggregate(total=Sum('amount_paid'))['total'] or 0
            
            # Average attendance
            avg_attendance = Conference.objects.annotate(
                reg_count=Count('registrations')
            ).aggregate(avg=Sum('reg_count') / Count('id'))['avg'] or 0
            
            # Upcoming conferences
            today = timezone.now().date()
            upcoming_conferences = Conference.objects.filter(
                date__gte=today
            ).exclude(
                status__in=['completed', 'cancelled']
            ).count()
            
            # Completed conferences
            completed_conferences = Conference.objects.filter(
                status='completed'
            ).count()
            
            # Monthly registrations
            monthly_registrations = []
            one_year_ago = timezone.now() - timedelta(days=365)
            registrations_last_year = Registration.objects.filter(
                registered_at__gte=one_year_ago
            )
            
            # Top conferences by registration count
            top_conferences = list(
                Conference.objects.annotate(
                    registration_count=Count('registrations')
                ).order_by('-registration_count')[:5]
                .values('id', 'title', 'registration_count', 'date')
            )
            
            data = {
                'total_conferences': total_conferences,
                'conferences_by_status': conferences_by_status,
                'conferences_by_type': conferences_by_type,
                'total_registrations': total_registrations,
                'total_revenue': total_revenue,
                'average_attendance': round(avg_attendance, 2),
                'upcoming_conferences': upcoming_conferences,
                'completed_conferences': completed_conferences,
                'monthly_registrations': monthly_registrations,
                'top_conferences': top_conferences,
            }
            
            serializer = ConferenceAnalyticsSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching analytics: {str(e)}")
            return Response(
                {'error': f'Failed to fetch analytics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def add_registration(self, request, pk=None):
        try:
            conference = self.get_object()
            
            # Add conference to request data
            request_data = request.data.copy()
            request_data['conference'] = conference.id
            
            serializer = RegistrationSerializer(data=request_data)
            
            if serializer.is_valid():
                registration = serializer.save()
                
                # Send confirmation email
                try:
                    self.send_registration_confirmation(registration, conference)
                    logger.info(f"Confirmation email sent for registration {registration.id}")
                except Exception as e:
                    logger.error(f"Failed to send confirmation email: {str(e)}")
                    # Don't fail the registration if email fails
                
                # Return success response
                return Response({
                    'success': True,
                    'message': 'Registration successful! A confirmation email has been sent.',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            # Handle duplicate email error specifically
            if 'email' in serializer.errors and 'already registered' in str(serializer.errors['email']):
                return Response({
                    'success': False,
                    'error': 'Duplicate registration',
                    'message': 'This email is already registered for this conference.',
                    'details': serializer.errors
                }, status=status.HTTP_409_CONFLICT)
                
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error adding registration: {str(e)}")
            return Response({
                'success': False,
                'error': 'Internal server error',
                'message': 'Failed to process registration. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            file_path = os.path.join('conferences', 'images', filename)
            
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
    def upload_speaker_image(self, request):
        """Upload a speaker image and return the URL"""
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
            file_path = os.path.join('speakers', 'images', filename)
            
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
        
    def send_registration_confirmation(self, registration, conference):
        """Send conference registration confirmation email"""
        subject = f"Registration Confirmation: {conference.title}"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
        to = [registration.email]

        context = {
            'registration': registration,
            'conference': conference,
            'company_name': getattr(settings, 'COMPANY_NAME', 'African Child Neurology Association'),
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'),
            'contact_email': getattr(settings, 'CONTACT_EMAIL', 'info@acna.org')
        }

        try:
            # Try to send HTML email if templates exist
            try:
                html_content = render_to_string("conferences/emails/registration_confirmation.html", context)
                text_content = render_to_string("conferences/emails/registration_confirmation.txt", context)
                
                msg = EmailMultiAlternatives(subject, text_content, from_email, to)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                
            except TemplateDoesNotExist:
                # Fallback to plain text email
                text_content = f"""Dear {registration.first_name} {registration.last_name},

Thank you for registering for the conference: {conference.title}

Conference Details:
- Date: {conference.date}
- Location: {conference.location}
- Venue: {conference.venue or 'To be announced'}

Your registration has been confirmed. You will receive further details closer to the conference date.

Registration Type: {registration.registration_type}
Payment Status: {registration.payment_status}

If you have any questions, please contact us at {context['contact_email']}.

Best regards,
The {context['company_name']} Team
"""

            from django.core.mail import send_mail
            send_mail(subject, text_content, from_email, to, fail_silently=False)
            
            logger.info(f"Conference registration confirmation sent to {registration.email}")
        
        except Exception as e:
            logger.error(f"Failed to send conference registration confirmation to {registration.email}: {str(e)}")
            raise