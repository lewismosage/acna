from rest_framework import serializers
from .models import GalleryItem, Story, GalleryStats
from django.utils.text import slugify
from django.urls import reverse


class GalleryItemSerializer(serializers.ModelSerializer):
    """Serializer for Gallery Items"""
    
    media_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y-%m-%d', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%d', read_only=True)
    
    class Meta:
        model = GalleryItem
        fields = [
            'id', 'title', 'type', 'category', 'description',
            'image', 'video', 'thumbnail', 'media_url', 'thumbnail_url',
            'event_date', 'location', 'duration', 'status', 'is_featured',
            'created_at', 'updated_at', 'slug', 'view_count'
        ]
        extra_kwargs = {
            'description': {'required': False}
        }
        read_only_fields = ['slug', 'view_count', 'created_at', 'updated_at']
    
    def get_media_url(self, obj):
        """Generate absolute URL for media file"""
        request = self.context.get('request')
        if obj.type == 'video' and obj.video:
            return request.build_absolute_uri(obj.video.url) if request else obj.video.url
        elif obj.type == 'photo' and obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    
    def get_thumbnail_url(self, obj):
        """Generate absolute URL for thumbnail"""
        request = self.context.get('request')
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        elif obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    
    def validate(self, data):
        """Custom validation for gallery items"""
        item_type = data.get('type', self.instance.type if self.instance else 'photo')
        
        return data
    
    def create(self, validated_data):
        """Create a new gallery item"""
        # Generate slug from title
        title = validated_data['title']
        slug = slugify(title)
        counter = 1
        original_slug = slug
        
        while GalleryItem.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        return super().create(validated_data)


class GalleryItemListSerializer(serializers.ModelSerializer):
    """Simplified serializer for gallery item lists"""
    
    thumbnail_url = serializers.SerializerMethodField()
    media_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryItem
        fields = [
            'id', 'title', 'type', 'category', 'description','thumbnail_url', 'media_url',
            'event_date', 'location', 'status', 'is_featured', 'created_at',
            'slug', 'view_count'
        ]
    
    def get_thumbnail_url(self, obj):
        """Generate absolute URL for thumbnail"""
        request = self.context.get('request')
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        elif obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    
    def get_media_url(self, obj):
        """Generate absolute URL for media file"""
        request = self.context.get('request')
        if obj.type == 'video' and obj.video:
            return request.build_absolute_uri(obj.video.url) if request else obj.video.url
        elif obj.type == 'photo' and obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class StorySerializer(serializers.ModelSerializer):
    """Serializer for Stories"""
    
    image_url = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y-%m-%d', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%d', read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id', 'title', 'patient_name', 'age', 'condition', 'story',
            'image', 'image_url', 'location', 'story_date', 'status',
            'is_featured', 'created_at', 'updated_at', 'slug', 'view_count'
        ]
        read_only_fields = ['slug', 'view_count', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Generate absolute URL for story image"""
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    
    def validate_age(self, value):
        """Validate age is within reasonable range"""
        if value < 0 or value > 150:
            raise serializers.ValidationError("Age must be between 0 and 150.")
        return value
    
    def create(self, validated_data):
        """Create a new story"""
        # Generate slug from title
        title = validated_data['title']
        slug = slugify(title)
        counter = 1
        original_slug = slug
        
        while Story.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        return super().create(validated_data)


class StoryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for story lists"""
    
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Story
        fields = [
            'id', 'title', 'patient_name', 'age', 'condition', 'story', 'image_url',
            'location', 'story_date', 'status', 'is_featured', 'created_at',
            'slug', 'view_count'
        ]
    
    def get_image_url(self, obj):
        """Generate absolute URL for story image"""
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class GalleryStatsSerializer(serializers.ModelSerializer):
    """Serializer for Gallery Statistics"""
    
    class Meta:
        model = GalleryStats
        fields = [
            'total_gallery_items', 'published_gallery_items',
            'total_stories', 'published_stories', 'total_views',
            'last_updated'
        ]


class GalleryItemStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating gallery item status"""
    
    status = serializers.ChoiceField(choices=GalleryItem.STATUS_CHOICES)
    
    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save()
        return instance


class StoryStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating story status"""
    
    status = serializers.ChoiceField(choices=Story.STATUS_CHOICES)
    
    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save()
        return instance


class GalleryItemFeatureToggleSerializer(serializers.Serializer):
    """Serializer for toggling featured status of gallery items"""
    
    is_featured = serializers.BooleanField()
    
    def update(self, instance, validated_data):
        instance.is_featured = validated_data['is_featured']
        instance.save()
        return instance


class StoryFeatureToggleSerializer(serializers.Serializer):
    """Serializer for toggling featured status of stories"""
    
    is_featured = serializers.BooleanField()
    
    def update(self, instance, validated_data):
        instance.is_featured = validated_data['is_featured']
        instance.save()
        return instance


class GalleryItemBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk actions on gallery items"""
    
    item_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    action = serializers.ChoiceField(choices=[
        ('publish', 'Publish'),
        ('draft', 'Move to Draft'),
        ('archive', 'Archive'),
        ('delete', 'Delete'),
        ('feature', 'Feature'),
        ('unfeature', 'Unfeature'),
    ])


class StoryBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk actions on stories"""
    
    story_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    action = serializers.ChoiceField(choices=[
        ('publish', 'Publish'),
        ('draft', 'Move to Draft'),
        ('archive', 'Archive'),
        ('delete', 'Delete'),
        ('feature', 'Feature'),
        ('unfeature', 'Unfeature'),
    ])