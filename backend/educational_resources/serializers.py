from rest_framework import serializers
from .models import EducationalResource, CaseStudySubmission, ResourceView, ResourceDownload
import json
from django.core.files.storage import default_storage


class EducationalResourceSerializer(serializers.ModelSerializer):
    # Computed fields for frontend compatibility
    image_url_display = serializers.SerializerMethodField()
    file_url_display = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalResource
        fields = [
            'id', 'title', 'description', 'full_description', 'category', 
            'resource_type', 'condition', 'status', 'is_featured', 'is_free',
            'image', 'image_url', 'image_url_display', 'file', 'file_url', 
            'file_url_display', 'video_url', 'external_url', 'languages', 
            'tags', 'target_audience', 'related_conditions', 'learning_objectives',
            'prerequisites', 'references', 'age_group', 'difficulty', 'duration',
            'file_size', 'file_format', 'author', 'reviewed_by', 'institution',
            'location', 'impact_statement', 'accreditation', 'download_count',
            'view_count', 'rating', 'publication_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'download_count', 'view_count', 'created_at', 'updated_at']
    
    def get_image_url_display(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url
    
    def get_file_url_display(self, obj):
        """Get the file URL, prioritizing uploaded file over URL field"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return obj.file_url
    
    def validate_languages(self, value):
        """Ensure languages is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list")
        
        return [str(lang).strip() for lang in value if str(lang).strip()]
    
    # Similar validation methods for other JSON fields
    def validate_tags(self, value):
        return self._validate_json_array(value, "Tags")
    
    def validate_target_audience(self, value):
        return self._validate_json_array(value, "Target audience")
    
    def validate_related_conditions(self, value):
        return self._validate_json_array(value, "Related conditions")
    
    def validate_learning_objectives(self, value):
        return self._validate_json_array(value, "Learning objectives")
    
    def validate_prerequisites(self, value):
        return self._validate_json_array(value, "Prerequisites")
    
    def validate_references(self, value):
        return self._validate_json_array(value, "References")
    
    def _validate_json_array(self, value, field_name):
        """Generic validation for JSON array fields"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError(f"{field_name} must be a list")
        
        return [str(item).strip() for item in value if str(item).strip()]
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        
        # Rename fields for frontend compatibility
        camel_case_mapping = {
            'resource_type': 'type',
            'full_description': 'fullDescription',
            'is_featured': 'isFeatured',
            'is_free': 'isFree',
            'image_url_display': 'imageUrl',
            'file_url_display': 'fileUrl',
            'video_url': 'videoUrl',
            'external_url': 'externalUrl',
            'target_audience': 'targetAudience',
            'related_conditions': 'relatedConditions',
            'learning_objectives': 'learningObjectives',
            'file_size': 'fileSize',
            'file_format': 'fileFormat',
            'reviewed_by': 'reviewedBy',
            'impact_statement': 'impactStatement',
            'download_count': 'downloadCount',
            'view_count': 'viewCount',
            'publication_date': 'publicationDate',
            'created_at': 'createdAt',
            'updated_at': 'updatedAt',
        }
        
        result = {}
        for key, value in data.items():
            if key in camel_case_mapping:
                result[camel_case_mapping[key]] = value
            else:
                result[key] = value
        
        return result


class CaseStudySubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudySubmission
        fields = [
            'id', 'title', 'submitted_by', 'institution', 'email', 'phone',
            'location', 'category', 'excerpt', 'full_content', 'impact',
            'status', 'review_notes', 'reviewed_by', 'attachments',
            'image_url', 'submission_date', 'review_date', 'published_date'
        ]
        read_only_fields = ['id', 'submission_date']
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        
        # Rename fields for frontend compatibility
        camel_case_mapping = {
            'submitted_by': 'submittedBy',
            'full_content': 'fullContent',
            'review_notes': 'reviewNotes',
            'reviewed_by': 'reviewedBy',
            'submission_date': 'submissionDate',
            'review_date': 'reviewDate',
            'published_date': 'publishedDate',
        }
        
        result = {}
        for key, value in data.items():
            if key in camel_case_mapping:
                result[camel_case_mapping[key]] = value
            else:
                result[key] = value
        
        return result


class ResourceAnalyticsSerializer(serializers.Serializer):
    """Serializer for resource analytics data"""
    total = serializers.IntegerField()
    published = serializers.IntegerField()
    draft = serializers.IntegerField()
    under_review = serializers.IntegerField()
    archived = serializers.IntegerField()
    featured = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    monthly_downloads = serializers.IntegerField()
    total_views = serializers.IntegerField()
    monthly_views = serializers.IntegerField()
    pending_submissions = serializers.IntegerField()
    resources_by_category = serializers.DictField(child=serializers.IntegerField())
    top_resources = serializers.ListField(child=serializers.DictField())
    recent_activity = serializers.ListField(child=serializers.DictField())
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'total': data.get('total', 0),
            'published': data.get('published', 0),
            'draft': data.get('draft', 0),
            'underReview': data.get('under_review', 0),
            'archived': data.get('archived', 0),
            'featured': data.get('featured', 0),
            'totalDownloads': data.get('total_downloads', 0),
            'monthlyDownloads': data.get('monthly_downloads', 0),
            'totalViews': data.get('total_views', 0),
            'monthlyViews': data.get('monthly_views', 0),
            'pendingSubmissions': data.get('pending_submissions', 0),
            'resourcesByCategory': data.get('resources_by_category', {}),
            'topResources': data.get('top_resources', []),
            'recentActivity': data.get('recent_activity', []),
        }


class ResourceViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceView
        fields = ['id', 'resource', 'ip_address', 'user_agent', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']


class ResourceDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceDownload
        fields = ['id', 'resource', 'ip_address', 'user_agent', 'downloaded_at']
        read_only_fields = ['id', 'downloaded_at']