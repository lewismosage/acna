from rest_framework import serializers
from .models import NewsItem
from django.utils.text import slugify
import json

class NewsItemSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    readTime = serializers.CharField(source='read_time')
    isFeatured = serializers.BooleanField(source='is_featured')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    tags = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()
    
    class Meta:
        model = NewsItem
        fields = [
            'id', 'title', 'subtitle', 'type', 'status', 'category', 
            'date', 'readTime', 'views', 'imageUrl', 'content',
            'tags', 'isFeatured', 'createdAt', 'updatedAt',
            'author', 'source', 'contact'
        ]
    
    def get_imageUrl(self, obj):
        """Get the image URL with proper handling"""
        image_url = obj.image_url_display
        if image_url and not image_url.startswith('http'):
            # If it's a relative URL, you might need to add the domain
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image_url)
        return image_url
    
    def get_tags(self, obj):
        return obj.tags_list
    
    def get_content(self, obj):
        # Parse sections from JSON
        try:
            sections = json.loads(obj.sections) if obj.sections else []
        except json.JSONDecodeError:
            sections = []
        
        return {
            'introduction': obj.introduction,
            'sections': sections,
            'conclusion': obj.conclusion or ''
        }
    
    def get_author(self, obj):
        if any([obj.author_name, obj.author_title, obj.author_organization, obj.author_bio, obj.author_image_url_display]):
            author_image_url = obj.author_image_url_display
            # Handle relative URLs for author images
            if author_image_url and not author_image_url.startswith('http'):
                request = self.context.get('request')
                if request:
                    author_image_url = request.build_absolute_uri(author_image_url)
            
            return {
                'name': obj.author_name or '',
                'title': obj.author_title or '',
                'organization': obj.author_organization or '',
                'bio': obj.author_bio or '',
                'imageUrl': author_image_url or ''
            }
        return None
    
    def get_source(self, obj):
        if obj.source_name or obj.source_url:
            return {
                'name': obj.source_name or '',
                'url': obj.source_url or ''
            }
        return None
    
    def get_contact(self, obj):
        if any([obj.contact_name, obj.contact_email, obj.contact_phone]):
            return {
                'name': obj.contact_name or '',
                'email': obj.contact_email or '',
                'phone': obj.contact_phone or ''
            }
        return None

class CreateNewsSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(required=False, allow_blank=True)
    readTime = serializers.CharField(source='read_time', required=False)
    isFeatured = serializers.BooleanField(source='is_featured', required=False)
    content = serializers.JSONField(required=False, write_only=True)
    author = serializers.JSONField(required=False, write_only=True)
    source = serializers.JSONField(required=False, write_only=True)
    contact = serializers.JSONField(required=False, write_only=True)
    authorImage = serializers.FileField(required=False, write_only=True)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = NewsItem
        fields = [
            'title', 'subtitle', 'type', 'status', 'category', 'date',
            'readTime', 'imageUrl', 'tags', 'isFeatured', 'content',
            'author', 'source', 'contact', 'authorImage'
        ]
    
    def validate_imageUrl(self, value):
        """Validate and clean the image URL"""
        if value:
            # Remove any extra whitespace
            value = value.strip()
            # Ensure the URL is properly formatted
            if value and not (value.startswith('http://') or value.startswith('https://') or value.startswith('/')):
                # If it's a relative path without leading slash, add it
                if not value.startswith('/'):
                    value = '/' + value
        return value
    
    def validate_tags(self, value):
        """Ensure tags is a list and convert to the format expected by the model"""
        if isinstance(value, list):
            # Clean up tags - remove empty strings and strip whitespace
            cleaned_tags = [tag.strip() for tag in value if tag and tag.strip()]
            return cleaned_tags
        elif isinstance(value, str):
            # If somehow a string is passed, split it
            return [tag.strip() for tag in value.split(',') if tag.strip()]
        return []
    
    def create(self, validated_data):
        # Extract nested data
        content_data = validated_data.pop('content', {})
        author_data = validated_data.pop('author', {})
        source_data = validated_data.pop('source', {})
        contact_data = validated_data.pop('contact', {})
        author_image = validated_data.pop('authorImage', None)
        
        # Handle image URL properly
        image_url = validated_data.pop('imageUrl', '')
        if image_url:
            validated_data['image_url'] = image_url
        
        # Handle tags - convert list to comma-separated string for the model
        tags_list = validated_data.pop('tags', [])
        if isinstance(tags_list, list):
            validated_data['tags'] = ', '.join(tags_list)
        else:
            validated_data['tags'] = ''
        
        # Handle content
        if content_data:
            validated_data['introduction'] = content_data.get('introduction', '')
            validated_data['conclusion'] = content_data.get('conclusion', '')
            # Store sections as JSON in a text field
            validated_data['sections'] = json.dumps(content_data.get('sections', []))
        
        # Handle author data
        if author_data:
            validated_data['author_name'] = author_data.get('name', '')
            validated_data['author_title'] = author_data.get('title', '')
            validated_data['author_organization'] = author_data.get('organization', '')
            validated_data['author_bio'] = author_data.get('bio', '')
            # Only set author_image_url if no file is being uploaded
            if not author_image:
                validated_data['author_image_url'] = author_data.get('imageUrl', '')
        
        # Handle source data
        if source_data:
            validated_data['source_name'] = source_data.get('name', '')
            validated_data['source_url'] = source_data.get('url', '')
        
        # Handle contact data
        if contact_data:
            validated_data['contact_name'] = contact_data.get('name', '')
            validated_data['contact_email'] = contact_data.get('email', '')
            validated_data['contact_phone'] = contact_data.get('phone', '')
        
        # Create the news item
        news_item = NewsItem.objects.create(**validated_data)
        
        # Handle author image upload after creation
        if author_image:
            news_item.author_image = author_image
            news_item.save()
        
        return news_item
    
    def update(self, instance, validated_data):
        # Extract nested data
        content_data = validated_data.pop('content', {})
        author_data = validated_data.pop('author', {})
        source_data = validated_data.pop('source', {})
        contact_data = validated_data.pop('contact', {})
        author_image = validated_data.pop('authorImage', None)
        
        # Handle image URL properly
        if 'imageUrl' in validated_data:
            image_url = validated_data.pop('imageUrl', '')
            if image_url:
                instance.image_url = image_url
            else:
                instance.image_url = ''
        
        # Handle tags - convert list to comma-separated string for the model
        if 'tags' in validated_data:
            tags_list = validated_data.pop('tags', [])
            if isinstance(tags_list, list):
                instance.tags = ', '.join(tags_list)
            else:
                instance.tags = ''
        
        # Handle content
        if content_data:
            instance.introduction = content_data.get('introduction', instance.introduction)
            instance.conclusion = content_data.get('conclusion', instance.conclusion)
            # Update sections
            instance.sections = json.dumps(content_data.get('sections', json.loads(instance.sections or '[]')))
        
        # Handle author data
        if author_data:
            instance.author_name = author_data.get('name', instance.author_name)
            instance.author_title = author_data.get('title', instance.author_title)
            instance.author_organization = author_data.get('organization', instance.author_organization)
            instance.author_bio = author_data.get('bio', instance.author_bio)
            # Only update author_image_url if no file is being uploaded
            if not author_image:
                instance.author_image_url = author_data.get('imageUrl', instance.author_image_url)
        
        # Handle author image upload
        if author_image is not None:
            if author_image:
                instance.author_image = author_image
                # Clear the URL field since we're using an uploaded file
                instance.author_image_url = ''
            else:
                instance.author_image = None
                instance.author_image_url = ''
        
        # Handle source data
        if source_data:
            instance.source_name = source_data.get('name', instance.source_name)
            instance.source_url = source_data.get('url', instance.source_url)
        
        # Handle contact data
        if contact_data:
            instance.contact_name = contact_data.get('name', instance.contact_name)
            instance.contact_email = contact_data.get('email', instance.contact_email)
            instance.contact_phone = contact_data.get('phone', instance.contact_phone)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance