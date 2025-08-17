from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import GalleryItem, Story, GalleryStats
from .serializers import (
    GalleryItemSerializer, GalleryItemListSerializer,
    StorySerializer, StoryListSerializer,
    GalleryStatsSerializer, GalleryItemStatusUpdateSerializer,
    StoryStatusUpdateSerializer, GalleryItemFeatureToggleSerializer,
    StoryFeatureToggleSerializer, GalleryItemBulkActionSerializer,
    StoryBulkActionSerializer
)


class GalleryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for Gallery Items with full CRUD operations"""
    
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering options
    filterset_fields = ['status', 'type', 'category', 'is_featured']
    search_fields = ['title', 'description', 'location', 'category']
    ordering_fields = ['created_at', 'updated_at', 'title', 'view_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializer for list view"""
        if self.action == 'list':
            return GalleryItemListSerializer
        return GalleryItemSerializer
    
    def get_queryset(self):
        """Return all gallery items regardless of authentication status"""
        return GalleryItem.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single gallery item and increment view count"""
        instance = self.get_object()
        
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured gallery items"""
        featured_items = self.get_queryset().filter(is_featured=True, status='published')
        serializer = GalleryItemListSerializer(featured_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get gallery items grouped by category"""
        categories = {}
        for choice in GalleryItem.CATEGORY_CHOICES:
            category_key = choice[0]
            category_items = self.get_queryset().filter(
                category=category_key,
                status='published'
            )[:6]  # Limit to 6 items per category
            if category_items:
                categories[category_key] = GalleryItemListSerializer(category_items, many=True).data
        
        return Response(categories)
    
    @action(detail=True, methods=['patch'], permission_classes=[AllowAny])
    def update_status(self, request, pk=None):
        """Update the status of a gallery item"""
        gallery_item = self.get_object()
        serializer = GalleryItemStatusUpdateSerializer(
            gallery_item, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Status updated successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[AllowAny])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a gallery item"""
        gallery_item = self.get_object()
        gallery_item.is_featured = not gallery_item.is_featured
        gallery_item.save()
        
        return Response({
            'message': f'Gallery item {"featured" if gallery_item.is_featured else "unfeatured"} successfully',
            'is_featured': gallery_item.is_featured
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def bulk_action(self, request):
        """Perform bulk actions on gallery items"""
        serializer = GalleryItemBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            item_ids = serializer.validated_data['item_ids']
            action_type = serializer.validated_data['action']
            
            gallery_items = GalleryItem.objects.filter(id__in=item_ids)
            
            if action_type == 'publish':
                gallery_items.update(status='published')
                message = f'{gallery_items.count()} items published successfully'
            elif action_type == 'draft':
                gallery_items.update(status='draft')
                message = f'{gallery_items.count()} items moved to draft'
            elif action_type == 'archive':
                gallery_items.update(status='archived')
                message = f'{gallery_items.count()} items archived'
            elif action_type == 'delete':
                count = gallery_items.count()
                gallery_items.delete()
                message = f'{count} items deleted successfully'
            elif action_type == 'feature':
                gallery_items.update(is_featured=True)
                message = f'{gallery_items.count()} items featured'
            elif action_type == 'unfeature':
                gallery_items.update(is_featured=False)
                message = f'{gallery_items.count()} items unfeatured'
            
            return Response({'message': message})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get gallery items statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'published': queryset.filter(status='published').count(),
            'draft': queryset.filter(status='draft').count(),
            'archived': queryset.filter(status='archived').count(),
            'featured': queryset.filter(is_featured=True).count(),
            'photos': queryset.filter(type='photo').count(),
            'videos': queryset.filter(type='video').count(),
        }
        
        return Response(stats)


class StoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Stories with full CRUD operations"""
    
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering options
    filterset_fields = ['status', 'condition', 'is_featured']
    search_fields = ['title', 'patient_name', 'condition', 'story', 'location']
    ordering_fields = ['created_at', 'updated_at', 'title', 'age', 'view_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializer for list view"""
        if self.action == 'list':
            return StoryListSerializer
        return StorySerializer
    
    def get_queryset(self):
        """Return all stories regardless of authentication status"""
        return Story.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single story and increment view count"""
        instance = self.get_object()
        
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured stories"""
        featured_stories = self.get_queryset().filter(is_featured=True, status='published')
        serializer = StoryListSerializer(featured_stories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_condition(self, request):
        """Get stories grouped by medical condition"""
        conditions = {}
        unique_conditions = self.get_queryset().filter(
            status='published'
        ).values_list('condition', flat=True).distinct()
        
        for condition in unique_conditions:
            condition_stories = self.get_queryset().filter(
                condition=condition,
                status='published'
            )[:4]  # Limit to 4 stories per condition
            if condition_stories:
                conditions[condition] = StoryListSerializer(condition_stories, many=True).data
        
        return Response(conditions)
    
    @action(detail=True, methods=['patch'], permission_classes=[AllowAny])
    def update_status(self, request, pk=None):
        """Update the status of a story"""
        story = self.get_object()
        serializer = StoryStatusUpdateSerializer(story, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Status updated successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[AllowAny])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a story"""
        story = self.get_object()
        story.is_featured = not story.is_featured
        story.save()
        
        return Response({
            'message': f'Story {"featured" if story.is_featured else "unfeatured"} successfully',
            'is_featured': story.is_featured
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def bulk_action(self, request):
        """Perform bulk actions on stories"""
        serializer = StoryBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            story_ids = serializer.validated_data['story_ids']
            action_type = serializer.validated_data['action']
            
            stories = Story.objects.filter(id__in=story_ids)
            
            if action_type == 'publish':
                stories.update(status='published')
                message = f'{stories.count()} stories published successfully'
            elif action_type == 'draft':
                stories.update(status='draft')
                message = f'{stories.count()} stories moved to draft'
            elif action_type == 'archive':
                stories.update(status='archived')
                message = f'{stories.count()} stories archived'
            elif action_type == 'delete':
                count = stories.count()
                stories.delete()
                message = f'{count} stories deleted successfully'
            elif action_type == 'feature':
                stories.update(is_featured=True)
                message = f'{stories.count()} stories featured'
            elif action_type == 'unfeature':
                stories.update(is_featured=False)
                message = f'{stories.count()} stories unfeatured'
            
            return Response({'message': message})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get stories statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'published': queryset.filter(status='published').count(),
            'draft': queryset.filter(status='draft').count(),
            'archived': queryset.filter(status='archived').count(),
            'featured': queryset.filter(is_featured=True).count(),
            'conditions': list(queryset.values_list('condition', flat=True).distinct()),
        }
        
        return Response(stats)


class GalleryStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Gallery Statistics (read-only)"""
    
    queryset = GalleryStats.objects.all()
    serializer_class = GalleryStatsSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """Refresh gallery statistics"""
        stats = GalleryStats.update_stats()
        serializer = GalleryStatsSerializer(stats)
        return Response(serializer.data)