from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone
from .models import (
    ForumCategory, ForumThread, ForumPost, 
    ForumPostLike, ForumThreadLike, ForumThreadSubscription
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information in forum contexts"""
    
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'first_name', 'last_name']
    
    def get_display_name(self, obj):
        """Return user's full name or username"""
        return obj.get_full_name() or obj.username


class ForumCategorySerializer(serializers.ModelSerializer):
    """Serializer for forum categories"""
    
    thread_count = serializers.ReadOnlyField()
    post_count = serializers.ReadOnlyField()
    last_post = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = [
            'id', 'title', 'slug', 'description', 'icon', 'color',
            'is_active', 'order', 'thread_count', 'post_count', 
            'last_post', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_last_post(self, obj):
        """Get last post information"""
        last_post = obj.last_post
        if last_post:
            return {
                'id': last_post.id,
                'author': last_post.author.get_full_name() or last_post.author.username,
                'created_at': last_post.created_at,
                'thread_title': last_post.thread.title,
                'thread_id': last_post.thread.id
            }
        return None
    
    def create(self, validated_data):
        """Create category with auto-generated slug"""
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update category and regenerate slug if title changed"""
        if 'title' in validated_data and validated_data['title'] != instance.title:
            validated_data['slug'] = slugify(validated_data['title'])
        return super().update(instance, validated_data)


class ForumPostSerializer(serializers.ModelSerializer):
    """Serializer for forum posts"""
    
    author = UserSerializer(read_only=True)
    reply_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumPost
        fields = [
            'id', 'content', 'author', 'parent_post', 'like_count', 
            'reply_count', 'is_liked', 'is_active', 'is_edited',
            'created_at', 'updated_at', 'replies'
        ]
        read_only_fields = ['author', 'like_count', 'is_edited', 'created_at', 'updated_at']
    
    def get_is_liked(self, obj):
        """Check if current user liked this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ForumPostLike.objects.filter(
                post=obj, 
                user=request.user
            ).exists()
        return False
    
    def get_replies(self, obj):
        """Get direct replies to this post"""
        replies = obj.replies.filter(is_active=True).order_by('created_at')[:5]  # Limit to 5 recent replies
        return ForumPostSerializer(replies, many=True, context=self.context).data
    
    def create(self, validated_data):
        """Create post with current user as author"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ForumThreadSerializer(serializers.ModelSerializer):
    """Serializer for forum threads"""
    
    author = UserSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ForumCategory.objects.all(), 
        source='category', 
        write_only=True
    )
    reply_count = serializers.ReadOnlyField()
    last_post = serializers.SerializerMethodField()
    has_new_replies = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    recent_posts = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumThread
        fields = [
            'id', 'title', 'slug', 'content', 'author', 'category', 'category_id',
            'is_pinned', 'is_locked', 'is_active', 'view_count', 'like_count',
            'reply_count', 'last_post', 'has_new_replies', 'is_liked', 
            'is_subscribed', 'tags', 'recent_posts', 'created_at', 
            'updated_at', 'last_activity'
        ]
        read_only_fields = [
            'slug', 'author', 'view_count', 'like_count', 'reply_count',
            'last_post', 'has_new_replies', 'created_at', 'updated_at', 'last_activity'
        ]
    
    def get_last_post(self, obj):
        """Get last post information"""
        last_post = obj.last_post
        if last_post:
            return {
                'id': last_post.id,
                'author': last_post.author.get_full_name() or last_post.author.username,
                'created_at': last_post.created_at,
                'content_preview': last_post.content[:100] + '...' if len(last_post.content) > 100 else last_post.content
            }
        return None
    
    def get_is_liked(self, obj):
        """Check if current user liked this thread"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ForumThreadLike.objects.filter(
                thread=obj, 
                user=request.user
            ).exists()
        return False
    
    def get_is_subscribed(self, obj):
        """Check if current user is subscribed to this thread"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ForumThreadSubscription.objects.filter(
                thread=obj, 
                user=request.user,
                is_active=True
            ).exists()
        return False
    
    def get_recent_posts(self, obj):
        """Get recent posts for this thread"""
        posts = obj.forum_posts.filter(is_active=True).order_by('-created_at')[:3]
        return ForumPostSerializer(posts, many=True, context=self.context).data
    
    def create(self, validated_data):
        """Create thread with current user as author and auto-generated slug"""
        validated_data['author'] = self.context['request'].user
        validated_data['slug'] = slugify(validated_data['title'])
        
        # Ensure slug is unique
        original_slug = validated_data['slug']
        counter = 1
        while ForumThread.objects.filter(slug=validated_data['slug']).exists():
            validated_data['slug'] = f"{original_slug}-{counter}"
            counter += 1
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update thread and regenerate slug if title changed"""
        if 'title' in validated_data and validated_data['title'] != instance.title:
            new_slug = slugify(validated_data['title'])
            # Ensure slug is unique
            original_slug = new_slug
            counter = 1
            while ForumThread.objects.filter(slug=new_slug).exclude(id=instance.id).exists():
                new_slug = f"{original_slug}-{counter}"
                counter += 1
            validated_data['slug'] = new_slug
            validated_data['is_edited'] = True
        
        return super().update(instance, validated_data)


class ForumThreadDetailSerializer(ForumThreadSerializer):
    """Detailed serializer for forum threads with posts"""
    
    forum_posts = ForumPostSerializer(many=True, read_only=True)
    
    class Meta(ForumThreadSerializer.Meta):
        fields = ForumThreadSerializer.Meta.fields + ['forum_posts']


class ForumPostLikeSerializer(serializers.ModelSerializer):
    """Serializer for post likes"""
    
    class Meta:
        model = ForumPostLike
        fields = ['id', 'post', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ForumThreadLikeSerializer(serializers.ModelSerializer):
    """Serializer for thread likes"""
    
    class Meta:
        model = ForumThreadLike
        fields = ['id', 'thread', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ForumThreadSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for thread subscriptions"""
    
    class Meta:
        model = ForumThreadSubscription
        fields = ['id', 'thread', 'user', 'is_active', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ForumAnalyticsSerializer(serializers.Serializer):
    """Serializer for forum analytics data"""
    
    total_categories = serializers.IntegerField()
    total_threads = serializers.IntegerField()
    total_posts = serializers.IntegerField()
    active_threads = serializers.IntegerField()
    pinned_threads = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    recent_activity_count = serializers.IntegerField()
    threads_by_category = serializers.DictField()
    top_threads = serializers.ListField()
    active_users = serializers.IntegerField()


class ForumSearchSerializer(serializers.Serializer):
    """Serializer for forum search parameters"""
    
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    author = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    sort_by = serializers.ChoiceField(
        choices=['recent', 'popular', 'replies', 'views'],
        required=False,
        default='recent'
    )