from rest_framework import serializers
from .models import JournalArticle, JournalArticleView, JournalArticleDownload
import json


class JournalArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalArticle
        fields = [
            'id', 'title', 'authors', 'journal', 'summary', 'abstract',
            'key_findings', 'relevance', 'study_type', 'population', 
            'country_focus', 'tags', 'access', 'commentary', 'status',
            'view_count', 'download_count', 'publication_date', 
            'created_at', 'updated_at', 'last_updated'
        ]
        read_only_fields = ['id', 'publication_date', 'created_at', 'updated_at', 'last_updated']
    
    def validate_key_findings(self, value):
        """Ensure key_findings is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Key findings must be a list")
        
        # Filter out empty strings and ensure all items are strings
        validated_findings = [str(finding).strip() for finding in value if str(finding).strip()]
        
        if not validated_findings:
            raise serializers.ValidationError("At least one key finding is required")
        
        return validated_findings
    
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
    
    def validate_authors(self, value):
        """Validate authors is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Authors are required")
        return value.strip()
    
    def validate_journal(self, value):
        """Validate journal is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Journal is required")
        return value.strip()
    
    def validate_summary(self, value):
        """Validate summary is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Summary is required")
        return value.strip()
    
    def validate_study_type(self, value):
        """Validate study_type is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Study type is required")
        return value.strip()
    
    def validate_population(self, value):
        """Validate population is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Population is required")
        return value.strip()
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Convert snake_case to camelCase for frontend
        camel_case_data = {
            'id': data['id'],
            'title': data['title'],
            'authors': data['authors'],
            'journal': data['journal'],
            'summary': data['summary'],
            'abstract': data.get('abstract'),
            'keyFindings': data.get('key_findings', []),
            'relevance': data['relevance'],
            'studyType': data['study_type'],
            'population': data['population'],
            'countryFocus': data.get('country_focus', []),
            'tags': data.get('tags', []),
            'access': data['access'],
            'commentary': data.get('commentary'),
            'status': data['status'],
            'viewCount': data.get('view_count', 0),
            'downloadCount': data.get('download_count', 0),
            'publicationDate': data.get('publication_date', ''),
            'createdAt': data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at']),
            'updatedAt': data['updated_at'].split('T')[0] if 'T' in str(data['updated_at']) else str(data['updated_at']),
        }
        
        return camel_case_data


class JournalArticleAnalyticsSerializer(serializers.Serializer):
    """Serializer for journal article analytics data"""
    total = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    monthly_views = serializers.IntegerField()
    monthly_downloads = serializers.IntegerField()
    published = serializers.IntegerField()
    draft = serializers.IntegerField()
    archived = serializers.IntegerField()
    articles_by_study_type = serializers.DictField(child=serializers.IntegerField(), required=False)
    articles_by_country = serializers.DictField(child=serializers.IntegerField(), required=False)
    top_articles = serializers.ListField(child=serializers.DictField(), required=False)
    
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
            'articlesByStudyType': data.get('articles_by_study_type', {}),
            'articlesByCountry': data.get('articles_by_country', {}),
            'topArticles': data.get('top_articles', []),
        }


class JournalArticleViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalArticleView
        fields = ['id', 'article', 'ip_address', 'user_agent', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']


class JournalArticleDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalArticleDownload
        fields = ['id', 'article', 'ip_address', 'user_agent', 'downloaded_at']
        read_only_fields = ['id', 'downloaded_at']