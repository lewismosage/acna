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

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
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

    @action(detail=False, methods=['get'])
    def analytics(self, request):
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
        monthly_registrations = list(
            Registration.objects.filter(
                registered_at__gte=timezone.now() - timedelta(days=365))
            .extra({'month': "date_trunc('month', registered_at)"})
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
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

    @action(detail=True, methods=['post'])
    def add_registration(self, request, pk=None):
        conference = self.get_object()
        serializer = RegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(conference=conference)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        conference = self.get_object()
        image = request.FILES.get('image')
        
        if not image:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if image.size > 10 * 1024 * 1024:  # 10MB limit
            return Response(
                {'error': 'Image size should be less than 10MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conference.image.save(
            f'conference_{conference.id}_{uuid.uuid4().hex[:6]}.jpg',
            ContentFile(image.read()),
            save=True
        )
        
        return Response(
            {'url': conference.image.url},
            status=status.HTTP_201_CREATED
        )

    def perform_create(self, serializer):
        try:
            conference = serializer.save()
            
            # Handle speakers creation if provided
            speakers_data = self.request.data.get('speakers_data', [])
            if isinstance(speakers_data, str):
                try:
                    speakers_data = json.loads(speakers_data)
                except json.JSONDecodeError:
                    speakers_data = []
            
            for speaker_data in speakers_data:
                if isinstance(speaker_data, dict):
                    # Handle image data - could be either file object or base64 string
                    speaker_image = None
                    if 'image' in speaker_data:
                        if hasattr(speaker_data['image'], 'read'):  # It's a file object
                            speaker_image = speaker_data.pop('image')
                        elif isinstance(speaker_data['image'], str):  # It's a base64 string
                            # Handle base64 image string if needed
                            speaker_data.pop('image')
                            # You would need additional logic to decode base64 here
                    
                    speaker = Speaker.objects.create(conference=conference, **speaker_data)
                    
                    if speaker_image and hasattr(speaker_image, 'read'):
                        speaker.image.save(
                            f'speaker_{speaker.id}_{uuid.uuid4().hex[:6]}.jpg',
                            ContentFile(speaker_image.read()),
                            save=True
                        )
            
            # Handle sessions creation if provided
            sessions_data = self.request.data.get('sessions_data', [])
            if isinstance(sessions_data, str):
                try:
                    sessions_data = json.loads(sessions_data)
                except json.JSONDecodeError:
                    sessions_data = []
            
            if sessions_data:
                Session.objects.bulk_create([
                    Session(conference=conference, **session_data)
                    for session_data in sessions_data
                    if isinstance(session_data, dict)
                ])
                
        except Exception as e:
            logger.error(f"Error creating conference: {str(e)}")
            raise

    def perform_update(self, serializer):
        try:
            conference = serializer.save()

            # Handle speakers update if provided
            speakers_data = self.request.data.get('speakers_data', None)
            if speakers_data is not None:
                # Parse JSON string if needed
                if isinstance(speakers_data, str):
                    try:
                        speakers_data = json.loads(speakers_data)
                    except json.JSONDecodeError:
                        speakers_data = []
                # Now speakers_data is a list
                existing_speaker_ids = set(conference.speakers.values_list('id', flat=True))
                updated_speaker_ids = set()

                for speaker_data in speakers_data:
                    if not isinstance(speaker_data, dict):
                        continue  # Skip if not a dict
                    speaker_id = speaker_data.get('id', None)
                    speaker_image = speaker_data.pop('image', None)

                    if speaker_id and speaker_id in existing_speaker_ids:
                        speaker = Speaker.objects.get(id=speaker_id, conference=conference)
                        for attr, value in speaker_data.items():
                            setattr(speaker, attr, value)
                        speaker.save()

                        if speaker_image:
                            speaker.image.save(
                                f'speaker_{speaker.id}_{uuid.uuid4().hex[:6]}.jpg',
                                ContentFile(speaker_image.read()),
                                save=True
                            )

                        updated_speaker_ids.add(speaker_id)
                    else:
                        speaker = Speaker.objects.create(conference=conference, **speaker_data)
                        if speaker_image:
                            speaker.image.save(
                                f'speaker_{speaker.id}_{uuid.uuid4().hex[:6]}.jpg',
                                ContentFile(speaker_image.read()),
                                save=True
                            )
                        updated_speaker_ids.add(speaker.id)

                # Delete speakers not in the updated data
                speakers_to_delete = existing_speaker_ids - updated_speaker_ids
                if speakers_to_delete:
                    Speaker.objects.filter(id__in=speakers_to_delete).delete()

            # Handle sessions update if provided
            sessions_data = self.request.data.get('sessions_data', None)
            if sessions_data is not None:
                # Parse JSON string if needed
                if isinstance(sessions_data, str):
                    try:
                        sessions_data = json.loads(sessions_data)
                    except json.JSONDecodeError:
                        sessions_data = []
                existing_session_ids = set(conference.sessions.values_list('id', flat=True))
                updated_session_ids = set()

                for session_data in sessions_data:
                    if not isinstance(session_data, dict):
                        continue  # Skip if not a dict
                    session_id = session_data.get('id', None)

                    if session_id and session_id in existing_session_ids:
                        session = Session.objects.get(id=session_id, conference=conference)
                        for attr, value in session_data.items():
                            setattr(session, attr, value)
                        session.save()
                        updated_session_ids.add(session_id)
                    else:
                        session = Session.objects.create(conference=conference, **session_data)
                        updated_session_ids.add(session.id)

                # Delete sessions not in the updated data
                sessions_to_delete = existing_session_ids - updated_session_ids
                if sessions_to_delete:
                    Session.objects.filter(id__in=sessions_to_delete).delete()

        except Exception as e:
            logger.error(f"Error updating conference: {str(e)}")
            raise