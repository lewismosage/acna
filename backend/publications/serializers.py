from rest_framework import serializers
from .models import Publication, PublicationView, PublicationDownload
import json
from django.core.files.storage import default_storage


class PublicationSerializer(serializers.ModelSerializer):
    # Computed fields for frontend compatibility
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = [
            'id', 'title', 'excerpt', 'abstract', 'full_content', 'type', 'category', 
            'status', 'access_type', 'is_featured', 'journal', 'volume', 'issue', 
            'pages', 'publisher', 'isbn', 'language', 'image', 'image_url', 
            'download_url', 'external_url', 'authors', 'target_audience', 'tags', 
            'keywords', 'downloads', 'view_count', 'citation_count', 'date', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date', 'created_at', 'updated_at', 'downloads', 'view_count', 'citation_count']
    
    def get_image_url(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or '/api/placeholder/400/250'
    
    def validate_authors(self, value):
        """Ensure authors is a list of author objects"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for authors")
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Authors must be a list")
        
        # Validate each author object
        for i, author in enumerate(value):
            if not isinstance(author, dict):
                raise serializers.ValidationError(f"Author {i+1} must be an object")
            
            required_fields = ['name', 'affiliation']
            for field in required_fields:
                if not author.get(field, '').strip():
                    raise serializers.ValidationError(f"Author {i+1}: {field} is required")
        
        return value
    
    def validate_target_audience(self, value):
        """Ensure target_audience is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Target audience must be a list")
        
        return [str(audience).strip() for audience in value if str(audience).strip()]
    
    def validate_tags(self, value):
        """Ensure tags is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list")
        
        return [str(tag).strip() for tag in value if str(tag).strip()]
    
    def validate_keywords(self, value):
        """Ensure keywords is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Keywords must be a list")
        
        return [str(keyword).strip() for keyword in value if str(keyword).strip()]
    
    def validate_isbn(self, value):
        """Basic ISBN validation"""
        if value and value.strip():
            # Remove hyphens and spaces for validation
            isbn_clean = value.replace('-', '').replace(' ', '')
            if not (len(isbn_clean) in [10, 13] and isbn_clean.replace('X', '').replace('x', '').isdigit()):
                raise serializers.ValidationError("Invalid ISBN format")
        return value
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Format dates for frontend consistency
        if data.get('date'):
            data['date'] = data['date']
        if data.get('created_at'):
            data['createdAt'] = data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at'])
        if data.get('updated_at'):
            data['updatedAt'] = data['updated_at'].split('T')[0] if 'T' in str(data['updated_at']) else str(data['updated_at'])
        
        # Rename fields for frontend compatibility
        data['accessType'] = data.get('access_type', 'Open Access')
        data['isFeatured'] = data.get('is_featured', False)
        data['targetAudience'] = data.get('target_audience', [])
        data['fullContent'] = data.get('full_content', '')
        data['imageUrl'] = data.get('image_url', '/api/placeholder/400/250')
        data['downloadUrl'] = data.get('download_url', '')
        data['externalUrl'] = data.get('external_url', '')
        data['viewCount'] = data.get('view_count', 0)
        data['citationCount'] = data.get('citation_count', 0)
        
        return data


class PublicationAnalyticsSerializer(serializers.Serializer):
    """Serializer for publication analytics data"""
    total = serializers.IntegerField()
    draft = serializers.IntegerField()
    published = serializers.IntegerField()
    archived = serializers.IntegerField()
    featured = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    monthly_downloads = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_citations = serializers.IntegerField()
    publications_by_category = serializers.DictField(child=serializers.IntegerField())
    publications_by_type = serializers.DictField(child=serializers.IntegerField())
    top_publications = serializers.ListField(child=serializers.DictField())
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'total': data.get('total', 0),
            'draft': data.get('draft', 0),
            'published': data.get('published', 0),
            'archived': data.get('archived', 0),
            'featured': data.get('featured', 0),
            'totalDownloads': data.get('total_downloads', 0),
            'monthlyDownloads': data.get('monthly_downloads', 0),
            'totalViews': data.get('total_views', 0),
            'totalCitations': data.get('total_citations', 0),
            'publicationsByCategory': data.get('publications_by_category', {}),
            'publicationsByType': data.get('publications_by_type', {}),
            'topPublications': data.get('top_publications', []),
        }


class PublicationViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationView
        fields = ['id', 'publication', 'ip_address', 'user_agent', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']


class PublicationDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationDownload
        fields = ['id', 'publication', 'ip_address', 'user_agent', 'downloaded_at']
        read_only_fields = ['id', 'downloaded_at']