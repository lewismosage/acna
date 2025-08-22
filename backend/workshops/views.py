# workshops/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import timedelta
import os
import uuid
from rest_framework import serializers
from django.http import JsonResponse
from .models import Workshop, CollaborationSubmission
from .serializers import (
    WorkshopSerializer, CreateWorkshopSerializer,
    CollaborationSubmissionSerializer, CreateCollaborationSerializer
)

import logging

logger = logging.getLogger(__name__)

class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateWorkshopSerializer
        return WorkshopSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating workshop with data: {request.data}")
            
            # Make a mutable copy of the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Handle empty prerequisites and materials arrays
            if 'prerequisites' not in data or not data['prerequisites']:
                data['prerequisites'] = []
            if 'materials' not in data or not data['materials']:
                data['materials'] = []
            
            # Ensure prerequisites and materials are lists
            if isinstance(data.get('prerequisites'), str):
                data['prerequisites'] = [data['prerequisites']] if data['prerequisites'] else []
            if isinstance(data.get('materials'), str):
                data['materials'] = [data['materials']] if data['materials'] else []
            
            # Handle empty venue and price
            if data.get('venue') == '':
                data['venue'] = None
            if data.get('price') == '' or data.get('price') == 'undefined':
                data['price'] = None
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            workshop = serializer.save()
            
            # Return the created workshop using the read serializer
            read_serializer = WorkshopSerializer(workshop, context={'request': request})
            logger.info(f"Workshop created successfully: {workshop.id}")
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error creating workshop: {e.detail}")
            return Response(
                {'error': 'Validation error', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating workshop: {str(e)}")
            return Response(
                {'error': f'Failed to create workshop: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Make a mutable copy of the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Handle empty prerequisites and materials arrays
            if 'prerequisites' in data and not data['prerequisites']:
                data['prerequisites'] = []
            if 'materials' in data and not data['materials']:
                data['materials'] = []
            
            # Handle empty venue and price
            if data.get('venue') == '':
                data['venue'] = None
            if data.get('price') == '' or data.get('price') == 'undefined':
                data['price'] = None
            
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            workshop = serializer.save()
            
            # Return the updated workshop using the read serializer
            read_serializer = WorkshopSerializer(workshop, context={'request': request})
            return Response(read_serializer.data)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error updating workshop: {e.detail}")
            return Response(
                {'error': 'Validation error', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error updating workshop: {str(e)}")
            return Response(
                {'error': f'Failed to update workshop: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by type if provided
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(instructor__icontains=search) |
                Q(location__icontains=search)
            )
        
        return queryset.order_by('-date', '-time')
    
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
            file_path = os.path.join('workshops', 'images', filename)
            
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
    def analytics(self, request):
        """Get comprehensive workshop analytics data"""
        from django.db.models import Count, Sum
        
        # Basic counts
        total_workshops = Workshop.objects.count()
        planning_count = Workshop.objects.filter(status='Planning').count()
        registration_open_count = Workshop.objects.filter(status='Registration Open').count()
        in_progress_count = Workshop.objects.filter(status='In Progress').count()
        completed_count = Workshop.objects.filter(status='Completed').count()
        cancelled_count = Workshop.objects.filter(status='Cancelled').count()
        
        # Registration analytics
        total_registrations = Workshop.objects.aggregate(total=Sum('registered'))['total'] or 0
        
        # Monthly registrations (registrations from workshops in the last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_registrations = Workshop.objects.filter(
            date__gte=thirty_days_ago
        ).aggregate(total=Sum('registered'))['total'] or 0
        
        # Revenue analytics
        total_revenue = Workshop.objects.aggregate(
            total=Sum('price', filter=Q(price__isnull=False))
        )['total'] or 0
        
        # Workshops by type
        workshops_by_type = {
            'Online': Workshop.objects.filter(type='Online').count(),
            'In-Person': Workshop.objects.filter(type='In-Person').count(),
            'Hybrid': Workshop.objects.filter(type='Hybrid').count(),
        }
        
        # Top workshops by registration count
        top_workshops = []
        workshops_with_counts = Workshop.objects.filter(
            registered__gt=0
        ).order_by('-registered')[:5]
        
        for workshop in workshops_with_counts:
            top_workshops.append({
                'id': workshop.id,
                'title': workshop.title,
                'date': workshop.date.strftime('%Y-%m-%d') if workshop.date else '',
                'registered': workshop.registered
            })
        
        return Response({
            'total': total_workshops,
            'planning': planning_count,
            'registrationOpen': registration_open_count,
            'inProgress': in_progress_count,
            'completed': completed_count,
            'cancelled': cancelled_count,
            'totalRegistrations': total_registrations,
            'monthlyRegistrations': monthly_registrations,
            'totalRevenue': float(total_revenue),
            'workshopsByType': workshops_by_type,
            'topWorkshops': top_workshops,
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured workshops"""
        featured_workshops = Workshop.objects.filter(
            status__in=['Registration Open', 'In Progress']
        ).order_by('-date', '-time')[:10]
        
        serializer = self.get_serializer(featured_workshops, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming workshops"""
        upcoming_workshops = Workshop.objects.filter(
            status__in=['Planning', 'Registration Open', 'In Progress']
        ).order_by('date', 'time')[:10]
        
        serializer = self.get_serializer(upcoming_workshops, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a workshop"""
        workshop = self.get_object()
        # Add is_featured field to model if it doesn't exist
        if hasattr(workshop, 'is_featured'):
            workshop.is_featured = not workshop.is_featured
            workshop.save()
        
        serializer = self.get_serializer(workshop)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a workshop"""
        workshop = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Planning', 'Registration Open', 'In Progress', 'Completed', 'Cancelled']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workshop.status = new_status
        workshop.save()
        
        serializer = self.get_serializer(workshop)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def instructors(self, request):
        """Get distinct workshop instructors"""
        instructors = Workshop.objects.order_by('instructor').values_list('instructor', flat=True).distinct()
        return Response(list(instructors))
    
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """Get distinct workshop locations"""
        locations = Workshop.objects.order_by('location').values_list('location', flat=True).distinct()
        return Response(list(locations))

class CollaborationViewSet(viewsets.ModelViewSet):
    queryset = CollaborationSubmission.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateCollaborationSerializer
        return CollaborationSubmissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(project_title__icontains=search) |
                Q(project_description__icontains=search) |
                Q(institution__icontains=search) |
                Q(project_lead__icontains=search)
            )
        
        return queryset.order_by('-submitted_at')
    
    def create(self, request, *args, **kwargs):
        try:
            # Make a mutable copy of the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Handle skillsNeeded array
            if 'skillsNeeded' not in data or not data['skillsNeeded']:
                data['skillsNeeded'] = []
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            collaboration = serializer.save()
            
            # Return the created collaboration using the read serializer
            read_serializer = CollaborationSubmissionSerializer(collaboration, context={'request': request})
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            return Response(
                {'error': 'Validation error', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create collaboration: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update status of a collaboration submission"""
        collaboration = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Pending', 'Approved', 'Rejected', 'Needs Info']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        collaboration.status = new_status
        collaboration.save()
        
        serializer = self.get_serializer(collaboration)
        return Response(serializer.data)