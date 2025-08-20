from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import os
import uuid
import logging

from .models import AwardCategory, AwardWinner, Nominee, AwardNomination
from .serializers import (
    AwardCategorySerializer, AwardWinnerSerializer, NomineeSerializer,
    AwardNominationSerializer, CreateAwardWinnerSerializer, CreateNomineeSerializer,
    CreateAwardNominationSerializer
)

logger = logging.getLogger(__name__)

class AwardCategoryViewSet(viewsets.ModelViewSet):
    queryset = AwardCategory.objects.all()
    serializer_class = AwardCategorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by active status if provided
        active = self.request.query_params.get('active')
        if active is not None:
            is_active = active.lower() == 'true'
            queryset = queryset.filter(active=is_active)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.order_by('order', 'title')
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of a category"""
        category = self.get_object()
        category.active = not category.active
        category.save()
        
        serializer = self.get_serializer(category)
        return Response(serializer.data)

class AwardWinnerViewSet(viewsets.ModelViewSet):
    queryset = AwardWinner.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateAwardWinnerSerializer
        return AwardWinnerSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category if provided
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        # Filter by year if provided
        year_filter = self.request.query_params.get('year')
        if year_filter:
            queryset = queryset.filter(year=year_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(title__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset.order_by('-year', '-created_at')
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of an award winner"""
        winner = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Active', 'Draft', 'Archived']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        winner.status = new_status
        winner.save()
        
        serializer = self.get_serializer(winner)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def years(self, request):
        """Get distinct years for filtering"""
        years = AwardWinner.objects.order_by('-year').values_list('year', flat=True).distinct()
        return Response(list(years))

class NomineeViewSet(viewsets.ModelViewSet):
    queryset = Nominee.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateNomineeSerializer
        return NomineeSerializer

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Approve a nominee and add to poll"""
        nominee = self.get_object()
        nominee.status = 'Approved'
        nominee.save()
        
        serializer = self.get_serializer(nominee)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def for_verification(self, request):
        """Get nominees that need verification"""
        nominees = Nominee.objects.filter(status='Pending', source='new')
        serializer = self.get_serializer(nominees, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category if provided
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        # Filter by source if provided - FIX THIS FILTER
        source_filter = self.request.query_params.get('source')
        if source_filter:
            # Handle multiple source values (comma-separated)
            if ',' in source_filter:
                sources = source_filter.split(',')
                queryset = queryset.filter(source__in=sources)
            else:
                queryset = queryset.filter(source=source_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(institution__icontains=search) |
                Q(specialty__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a nominee"""
        nominee = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Pending', 'Approved', 'Rejected']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nominee.status = new_status
        nominee.save()
        
        serializer = self.get_serializer(nominee)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Upload a nominee image and return the URL"""
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
            file_path = os.path.join('nominees', 'images', filename)
            
            # Save file using Django's default storage
            saved_path = default_storage.save(file_path, ContentFile(image.read()))
            file_url = default_storage.url(saved_path)
            
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

class AwardNominationViewSet(viewsets.ModelViewSet):
    queryset = AwardNomination.objects.all()
    serializer_class = AwardNominationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return CreateAwardNominationSerializer
        return AwardNominationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category if provided
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        # Filter by source if provided - ADD THIS FILTER
        source_filter = self.request.query_params.get('source')
        if source_filter:
            queryset = queryset.filter(source=source_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(institution__icontains=search) |
                Q(specialty__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a nomination"""
        nomination = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Pending', 'Under Review', 'Approved', 'Rejected']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        nomination.status = new_status
        nomination.save()
        
        # If approved, create a nominee record
        if new_status == 'Approved':
            self.create_nominee_from_nomination(nomination)
        
        serializer = self.get_serializer(nomination)
        return Response(serializer.data)
    
    def create_nominee_from_nomination(self, nomination):
        """Create a nominee record from an approved nomination"""
        # For suggested nominations, find the existing nominee
        if nomination.source == 'suggested':
            try:
                # Find existing nominee by name and category
                nominee = Nominee.objects.get(
                    name__iexact=nomination.nominee_name,
                    category=nomination.award_category,
                    source__in=['admin', 'suggested']
                )
                return nominee
            except Nominee.DoesNotExist:
                # Create if doesn't exist (shouldn't happen)
                return Nominee.objects.create(
                    name=nomination.nominee_name,
                    category=nomination.award_category,
                    institution=nomination.nominee_institution,
                    specialty=nomination.nominee_specialty or '',
                    achievement=nomination.achievement_summary,
                    email=nomination.nominee_email,
                    location=nomination.nominee_location or '',
                    suggested_by=f"{nomination.nominator_name} ({nomination.nominator_email})",
                    status='Approved',
                    source='suggested',
                )
        else:
            # For new nominations, create for verification
            nominee, created = Nominee.objects.get_or_create(
                name=nomination.nominee_name,
                category=nomination.award_category,
                source='new',
                defaults={
                    'institution': nomination.nominee_institution,
                    'specialty': nomination.nominee_specialty or '',
                    'achievement': nomination.achievement_summary,
                    'email': nomination.nominee_email,
                    'location': nomination.nominee_location or '',
                    'suggested_by': f"{nomination.nominator_name} ({nomination.nominator_email})",
                    'status': 'Pending',
                }
            )
            return nominee
    
    def perform_create(self, serializer):
        """Override create to automatically determine source based on existing nominees"""
        nomination = serializer.save()
        
        # Check if this nominee already exists in the suggested list
        existing_nominees = Nominee.objects.filter(
            name__iexact=nomination.nominee_name,
            category=nomination.award_category,
            source__in=['admin', 'suggested'],
            status='Approved'
        )
        
        if existing_nominees.exists():
            # This is a vote for a suggested nominee - go directly to poll
            nomination.source = 'suggested'
            nomination.status = 'Approved'
            nomination.save()
            
            # No need to create a new nominee, just count the vote
            print(f"Vote counted for existing nominee: {nomination.nominee_name}")
        else:
            # This is a new nomination - needs verification
            nomination.source = 'new'
            nomination.status = 'Pending'
            nomination.save()
            
            # Create a Nominee object for verification queue
            Nominee.objects.create(
                name=nomination.nominee_name,
                institution=nomination.nominee_institution,
                specialty=nomination.nominee_specialty or '',
                category=nomination.award_category,
                achievement=nomination.achievement_summary,
                email=nomination.nominee_email,
                location=nomination.nominee_location or '',
                suggested_by=nomination.nominator_name,
                status='Pending',
                source='new'
            )
            print(f"New nominee created for verification: {nomination.nominee_name}")

        # Send confirmation email
        try:
            self.send_nomination_confirmation(nomination)
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {str(e)}")

    def send_nomination_confirmation(self, nomination):
        """Send nomination confirmation email with appropriate message based on source"""
        subject = f"Nomination Confirmation: {nomination.nominee_name}"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [nomination.nominator_email]

        context = {
            'nomination': nomination,
            'company_name': settings.COMPANY_NAME,
            'contact_email': settings.CONTACT_EMAIL
        }

        try:
            # Use correct template paths based on your file structure
            if nomination.source == 'suggested':
                subject = f"Nomination Submitted: {nomination.nominee_name}"
                html_template = "emails/suggested_nomination_confirmation.html"
                text_template = "emails/suggested_nomination_confirmation.txt"
            else:
                html_template = "emails/nomination_confirmation.html"
                text_template = "emails/nomination_confirmation.txt"

            # HTML version
            html_content = render_to_string(html_template, context)
            
            # Text version
            text_content = render_to_string(text_template, context)

            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            logger.info(f"Nomination confirmation sent to {nomination.nominator_email}")
            
        except Exception as e:
            logger.error(f"Failed to send nomination confirmation to {nomination.nominator_email}: {str(e)}")
            # Don't raise exception here to avoid breaking the nomination process

    @action(detail=True, methods=['post'])
    def send_confirmation(self, request, pk=None):
        """Send nomination confirmation email"""
        nomination = self.get_object()
        
        try:
            self.send_nomination_confirmation(nomination)
            return Response({
                'success': True,
                'message': f'Confirmation email sent to {nomination.nominator_email}'
            })
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send confirmation email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)