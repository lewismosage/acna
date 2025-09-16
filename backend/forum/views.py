from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, F, Max, Sum
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta

from .models import (
    ForumCategory, ForumThread, ForumPost,
    ForumPostLike, ForumThreadLike, ForumThreadSubscription
)
from .serializers import (
    ForumCategorySerializer, ForumThreadSerializer, ForumThreadDetailSerializer,
    ForumPostSerializer, ForumPostLikeSerializer, ForumThreadLikeSerializer,
    ForumThreadSubscriptionSerializer, ForumAnalyticsSerializer, ForumSearchSerializer
)


class ForumCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for forum categories"""
    
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'title', 'created_at']
    ordering = ['order', 'title']
    
    def get_queryset(self):
        queryset = ForumCategory.objects.filter(is_active=True)
        return queryset
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular categories based on recent activity"""
        recent_date = timezone.now() - timedelta(days=7)
        
        # Get categories without annotation conflicts
        categories = ForumCategory.objects.filter(is_active=True)
        
        # We can still filter by recent posts, but we'll do it differently
        categories_with_activity = []
        for category in categories:
            recent_posts_count = ForumPost.objects.filter(
                thread__category=category,
                thread__is_active=True,
                is_active=True,
                created_at__gte=recent_date
            ).count()
            
            # Add recent_posts_count as a temporary attribute
            category.recent_posts_count = recent_posts_count
            categories_with_activity.append(category)
        
        # Sort by recent activity and take top 5
        categories_with_activity.sort(key=lambda x: x.recent_posts_count, reverse=True)
        top_categories = categories_with_activity[:5]
        
        serializer = self.get_serializer(top_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def threads(self, request, pk=None):
        """Get threads for a specific category"""
        category = self.get_object()
        threads = ForumThread.objects.filter(
            category=category,
            is_active=True
        ).select_related('author', 'category').prefetch_related('forum_posts')
        
        # Apply search if provided
        search = request.query_params.get('search', '')
        if search:
            threads = threads.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        # Apply ordering
        ordering = request.query_params.get('ordering', '-last_activity')
        if ordering == 'popular':
            threads = threads.order_by('-view_count', '-like_count')
        elif ordering == 'replies':
            threads = threads.annotate(
                reply_count=Count('forum_posts', filter=Q(forum_posts__is_active=True))
            ).order_by('-reply_count')
        else:
            threads = threads.order_by('-is_pinned', '-last_activity')
        
        page = self.paginate_queryset(threads)
        if page is not None:
            serializer = ForumThreadSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ForumThreadSerializer(threads, many=True, context={'request': request})
        return Response(serializer.data)


class ForumThreadViewSet(viewsets.ModelViewSet):
    """ViewSet for forum threads"""
    
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_pinned', 'is_locked']
    search_fields = ['title', 'content', 'author__username', 'author__first_name', 'author__last_name']
    ordering_fields = ['created_at', 'last_activity', 'view_count', 'like_count']
    ordering = ['-is_pinned', '-last_activity']
    
    def get_queryset(self):
        return ForumThread.objects.filter(is_active=True).select_related(
            'author', 'category'
        ).prefetch_related('forum_posts__author')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ForumThreadDetailSerializer
        return ForumThreadSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get thread details and increment view count"""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent threads across all categories"""
        threads = self.get_queryset().order_by('-created_at')[:10]
        serializer = self.get_serializer(threads, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular threads based on views and likes"""
        threads = self.get_queryset().order_by(
            '-view_count', '-like_count', '-last_activity'
        )[:10]
        serializer = self.get_serializer(threads, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_threads(self, request):
        """Get threads created by current user"""
        threads = self.get_queryset().filter(author=request.user)
        page = self.paginate_queryset(threads)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(threads, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like or unlike a thread"""
        thread = self.get_object()
        like, created = ForumThreadLike.objects.get_or_create(
            thread=thread,
            user=request.user
        )
        
        if not created:
            # Unlike if already liked
            like.delete()
            return Response({'liked': False, 'like_count': thread.like_count})
        
        return Response({'liked': True, 'like_count': thread.like_count})
    
    @action(detail=True, methods=['post'])
    def subscribe(self, request, pk=None):
        """Subscribe or unsubscribe to thread notifications"""
        thread = self.get_object()
        subscription, created = ForumThreadSubscription.objects.get_or_create(
            thread=thread,
            user=request.user,
            defaults={'is_active': True}
        )
        
        if not created:
            # Toggle subscription
            subscription.is_active = not subscription.is_active
            subscription.save()
        
        return Response({
            'subscribed': subscription.is_active,
            'message': 'Subscribed' if subscription.is_active else 'Unsubscribed'
        })
    
    @action(detail=True, methods=['post', 'patch'])
    def toggle_pin(self, request, pk=None):
        """Toggle thread pin status (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        thread = self.get_object()
        thread.is_pinned = not thread.is_pinned
        thread.save(update_fields=['is_pinned'])
        
        return Response({
            'pinned': thread.is_pinned,
            'message': 'Thread pinned' if thread.is_pinned else 'Thread unpinned'
        })
    
    @action(detail=True, methods=['post', 'patch'])
    def toggle_lock(self, request, pk=None):
        """Toggle thread lock status (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        thread = self.get_object()
        thread.is_locked = not thread.is_locked
        thread.save(update_fields=['is_locked'])
        
        return Response({
            'locked': thread.is_locked,
            'message': 'Thread locked' if thread.is_locked else 'Thread unlocked'
        })


class ForumPostViewSet(viewsets.ModelViewSet):
    """ViewSet for forum posts"""
    
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['thread', 'author', 'parent_post']
    search_fields = ['content', 'author__username', 'author__first_name', 'author__last_name']
    ordering_fields = ['created_at', 'like_count']
    ordering = ['created_at']
    
    def get_queryset(self):
        return ForumPost.objects.filter(is_active=True).select_related(
            'author', 'thread', 'parent_post'
        ).prefetch_related('replies')
    
    def create(self, request, *args, **kwargs):
        """Create a new post and check if thread is locked"""
        thread_id = request.data.get('thread')
        if thread_id:
            thread = get_object_or_404(ForumThread, id=thread_id, is_active=True)
            if thread.is_locked and not request.user.is_staff:
                return Response(
                    {'error': 'Cannot post to locked thread'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """Get posts created by current user"""
        posts = self.get_queryset().filter(author=request.user)
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        like, created = ForumPostLike.objects.get_or_create(
            post=post,
            user=request.user
        )
        
        if not created:
            # Unlike if already liked
            like.delete()
            return Response({'liked': False, 'like_count': post.like_count})
        
        return Response({'liked': True, 'like_count': post.like_count})
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get replies to a specific post"""
        post = self.get_object()
        replies = post.replies.filter(is_active=True).order_by('created_at')
        
        page = self.paginate_queryset(replies)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)


class ForumAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for forum analytics"""
    
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get forum dashboard analytics"""
        # Basic counts
        total_categories = ForumCategory.objects.filter(is_active=True).count()
        total_threads = ForumThread.objects.filter(is_active=True).count()
        total_posts = ForumPost.objects.filter(is_active=True).count()
        active_threads = ForumThread.objects.filter(
            is_active=True,
            last_activity__gte=timezone.now() - timedelta(days=7)
        ).count()
        pinned_threads = ForumThread.objects.filter(
            is_active=True,
            is_pinned=True
        ).count()
        
        # Aggregated metrics - Fixed the aggregation
        thread_stats = ForumThread.objects.filter(is_active=True).aggregate(
            total_views=Sum('view_count'),
            total_likes=Sum('like_count')
        )
        
        # Recent activity
        recent_activity_count = ForumPost.objects.filter(
            is_active=True,
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        # Threads by category
        threads_by_category = dict(
            ForumThread.objects.filter(is_active=True)
            .values('category__title')
            .annotate(count=Count('id'))
            .values_list('category__title', 'count')
        )
        
        # Top threads by engagement - Fixed the query
        top_threads_queryset = (
            ForumThread.objects.filter(is_active=True)
            .select_related('author', 'category')
            .annotate(
                reply_count=Count('forum_posts', filter=Q(forum_posts__is_active=True)),
                total_engagement=F('view_count') + F('like_count') * 5
            )
            .order_by('-total_engagement')[:5]
        )
        
        # Convert to list with proper field access
        top_threads = []
        for thread in top_threads_queryset:
            top_threads.append({
                'id': thread.id,
                'title': thread.title,
                'author__username': thread.author.username,
                'category__title': thread.category.title,
                'view_count': thread.view_count,
                'like_count': thread.like_count,
                'reply_count': thread.reply_count,
            })
        
        # Active users (posted in last 30 days)
        active_users = ForumPost.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).values('author').distinct().count()
        
        analytics_data = {
            'total_categories': total_categories,
            'total_threads': total_threads,
            'total_posts': total_posts,
            'active_threads': active_threads,
            'pinned_threads': pinned_threads,
            'total_views': thread_stats['total_views'] or 0,
            'total_likes': thread_stats['total_likes'] or 0,
            'recent_activity_count': recent_activity_count,
            'threads_by_category': threads_by_category,
            'top_threads': top_threads,
            'active_users': active_users,
        }
        
        serializer = ForumAnalyticsSerializer(data=analytics_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get current user's forum statistics"""
        user = request.user
        
        user_threads = ForumThread.objects.filter(author=user, is_active=True)
        user_posts = ForumPost.objects.filter(author=user, is_active=True)
        
        stats = {
            'threads_created': user_threads.count(),
            'posts_created': user_posts.count(),
            'total_thread_views': user_threads.aggregate(
                total=Sum('view_count')
            )['total'] or 0,
            'total_thread_likes': user_threads.aggregate(
                total=Sum('like_count')
            )['total'] or 0,
            'total_post_likes': user_posts.aggregate(
                total=Sum('like_count')
            )['total'] or 0,
            'subscribed_threads': ForumThreadSubscription.objects.filter(
                user=user,
                is_active=True
            ).count(),
        }
        
        return Response(stats)


class ForumSearchViewSet(viewsets.ViewSet):
    """ViewSet for forum search functionality"""
    
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """Advanced forum search"""
        serializer = ForumSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        query = data.get('query', '')
        category = data.get('category', '')
        author = data.get('author', '')
        tags = data.get('tags', [])
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        sort_by = data.get('sort_by', 'recent')
        
        # Build query for threads
        threads = ForumThread.objects.filter(is_active=True)
        
        if query:
            threads = threads.filter(
                Q(title__icontains=query) | 
                Q(content__icontains=query) |
                Q(forum_posts__content__icontains=query)
            ).distinct()
        
        if category:
            threads = threads.filter(category__title__icontains=category)
        
        if author:
            threads = threads.filter(
                Q(author__username__icontains=author) |
                Q(author__first_name__icontains=author) |
                Q(author__last_name__icontains=author)
            )
        
        if tags:
            for tag in tags:
                threads = threads.filter(tags__contains=[tag])
        
        if date_from:
            threads = threads.filter(created_at__gte=date_from)
        
        if date_to:
            threads = threads.filter(created_at__lte=date_to)
        
        # Apply sorting
        if sort_by == 'popular':
            threads = threads.order_by('-view_count', '-like_count')
        elif sort_by == 'replies':
            threads = threads.annotate(
                reply_count=Count('forum_posts', filter=Q(forum_posts__is_active=True))
            ).order_by('-reply_count')
        elif sort_by == 'views':
            threads = threads.order_by('-view_count')
        else:  # recent
            threads = threads.order_by('-last_activity')
        
        # Paginate results
        page = self.paginate_queryset(threads.select_related('author', 'category'))
        if page is not None:
            serializer = ForumThreadSerializer(
                page, 
                many=True, 
                context={'request': request}
            )
            return self.get_paginated_response(serializer.data)
        
        serializer = ForumThreadSerializer(
            threads.select_related('author', 'category'), 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    def paginate_queryset(self, queryset):
        """Helper method for pagination"""
        # This would typically use DRF's pagination
        # For now, we'll return the first 20 results
        return queryset[:20]
    
    def get_paginated_response(self, data):
        """Helper method for paginated response"""
        return Response({
            'count': len(data),
            'results': data
        })