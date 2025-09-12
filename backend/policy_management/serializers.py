from rest_framework import serializers
from .models import PolicyBelief, PositionalStatement, ContentView, ContentDownload
import json


class PolicyBeliefSerializer(serializers.ModelSerializer):
    image_url_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PolicyBelief
        fields = [
            'id', 'title', 'category', 'summary', 'status', 'image', 'image_url', 'image_url_display',
            'tags', 'priority', 'target_audience', 'key_recommendations', 'region',
            'view_count', 'download_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'view_count', 'download_count', 'created_at', 'updated_at']

    def get_image_url_display(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url
    
    def validate_target_audience(self, value):
        """Ensure target_audience is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Target audience must be a list")
        
        validated_audience = [str(audience).strip() for audience in value if str(audience).strip()]
        
        if not validated_audience:
            raise serializers.ValidationError("At least one target audience is required")
        
        return validated_audience
    
    def validate_key_recommendations(self, value):
        """Ensure key_recommendations is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Key recommendations must be a list")
        
        validated_recommendations = [str(rec).strip() for rec in value if str(rec).strip()]
        
        if not validated_recommendations:
            raise serializers.ValidationError("At least one key recommendation is required")
        
        return validated_recommendations
    
    def validate_region(self, value):
        """Ensure region is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Region must be a list")
        
        validated_regions = [str(region).strip() for region in value if str(region).strip()]
        
        if not validated_regions:
            raise serializers.ValidationError("At least one region is required")
        
        return validated_regions
    
    def validate_tags(self, value):
        """Ensure tags is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list")
        
        validated_tags = [str(tag).strip() for tag in value if str(tag).strip()]
        
        if not validated_tags:
            raise serializers.ValidationError("At least one tag is required")
        
        return validated_tags
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required")
        return value.strip()
    
    def validate_category(self, value):
        """Validate category is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Category is required")
        return value.strip()
    
    def validate_summary(self, value):
        """Validate summary is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Summary is required")
        return value.strip()
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Convert snake_case to camelCase for frontend
        camel_case_data = {
            'id': data['id'],
            'type': 'PolicyBelief',  # Changed from 'PositionalStatement'
            'title': data['title'],
            'category': data['category'],
            'summary': data['summary'],
            'status': data['status'],
            'imageUrl': data.get('image_url_display', ''),
            'tags': data.get('tags', []),
            'priority': data['priority'],  # Added priority field
            'targetAudience': data.get('target_audience', []),  # Added targetAudience
            'keyRecommendations': data.get('key_recommendations', []),  # Added keyRecommendations
            'region': data.get('region', []),  # Added region
            'viewCount': data.get('view_count', 0),
            'downloadCount': data.get('download_count', 0),
            'createdAt': data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at']),
            'updatedAt': data['updated_at'].split('T')[0] if 'T' in str(data['updated_at']) else str(data['updated_at']),
        }
        
        return camel_case_data


class PositionalStatementSerializer(serializers.ModelSerializer):
    image_url_display = serializers.SerializerMethodField()  
    
    class Meta:
        model = PositionalStatement
        fields = [
            'id', 'title', 'category', 'summary', 'status', 'image', 'image_url', 'image_url_display',
            'tags', 'page_count', 'key_points', 'country_focus', 'related_policies',
            'view_count', 'download_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'view_count', 'download_count', 'created_at', 'updated_at']

    def get_image_url_display(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url
    
    def validate_key_points(self, value):
        """Ensure key_points is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Key points must be a list")
        
        validated_points = [str(point).strip() for point in value if str(point).strip()]
        
        if not validated_points:
            raise serializers.ValidationError("At least one key point is required")
        
        return validated_points
    
    def validate_country_focus(self, value):
        """Ensure country_focus is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Country focus must be a list")
        
        validated_countries = [str(country).strip() for country in value if str(country).strip()]
        
        if not validated_countries:
            raise serializers.ValidationError("At least one country focus is required")
        
        return validated_countries
    
    def validate_related_policies(self, value):
        """Ensure related_policies is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Related policies must be a list")
        
        validated_policies = [str(policy).strip() for policy in value if str(policy).strip()]
        
        # Related policies are optional, so empty list is allowed
        return validated_policies
    
    def validate_tags(self, value):
        """Ensure tags is a list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list")
        
        validated_tags = [str(tag).strip() for tag in value if str(tag).strip()]
        
        if not validated_tags:
            raise serializers.ValidationError("At least one tag is required")
        
        return validated_tags
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required")
        return value.strip()
    
    def validate_category(self, value):
        """Validate category is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Category is required")
        return value.strip()
    
    def validate_summary(self, value):
        """Validate summary is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Summary is required")
        return value.strip()
    
    def validate_page_count(self, value):
        """Validate page count is positive"""
        if value <= 0:
            raise serializers.ValidationError("Page count must be greater than 0")
        return value
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Convert snake_case to camelCase for frontend
        camel_case_data = {
            'id': data['id'],
            'type': 'PositionalStatement',
            'title': data['title'],
            'category': data['category'],
            'summary': data['summary'],
            'status': data['status'],
            'imageUrl': data.get('image_url_display', ''),
            'tags': data.get('tags', []),
            'pageCount': data['page_count'],
            'keyPoints': data.get('key_points', []),
            'countryFocus': data.get('country_focus', []),
            'relatedPolicies': data.get('related_policies', []),
            'viewCount': data.get('view_count', 0),
            'downloadCount': data.get('download_count', 0),
            'createdAt': data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at']),
            'updatedAt': data['updated_at'].split('T')[0] if 'T' in str(data['updated_at']) else str(data['updated_at']),
        }
        
        return camel_case_data


class ContentAnalyticsSerializer(serializers.Serializer):
    """Serializer for content analytics data"""
    total = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    monthly_views = serializers.IntegerField()
    monthly_downloads = serializers.IntegerField()
    published = serializers.IntegerField()
    draft = serializers.IntegerField()
    archived = serializers.IntegerField()
    content_by_category = serializers.DictField(child=serializers.IntegerField(), required=False)
    top_content = serializers.ListField(child=serializers.DictField(), required=False)
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'total': data.get('total', 0),
            'totalViews': data.get('total_views', 0),
            'totalDownloads': data.get('total_downloads', 0),
            'monthlyViews': data.get('monthly_views', 0),
            'monthlyDownloads': data.get('monthly_downloads', 0),
            'published': data.get('published', 0),
            'draft': data.get('draft', 0),
            'archived': data.get('archived', 0),
            'contentByCategory': data.get('content_by_category', {}),
            'topContent': data.get('top_content', []),
        }


class ContentViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentView
        fields = ['id', 'content_type', 'content_id', 'ip_address', 'user_agent', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']


class ContentDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentDownload
        fields = ['id', 'content_type', 'content_id', 'ip_address', 'user_agent', 'downloaded_at']
        read_only_fields = ['id', 'downloaded_at']