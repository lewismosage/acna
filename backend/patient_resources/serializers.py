from rest_framework import serializers
from .models import PatientResource, ResourceTag, ResourceLanguage, ResourceAudience

class ResourceTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceTag
        fields = ['id', 'name']

class ResourceLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceLanguage
        fields = ['id', 'language']

class ResourceAudienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceAudience
        fields = ['id', 'audience']

class PatientResourceSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    fileUrl = serializers.SerializerMethodField()
    externalUrl = serializers.SerializerMethodField()
    isFeatured = serializers.BooleanField(source='is_featured')
    isFree = serializers.BooleanField(source='is_free')
    downloadCount = serializers.IntegerField(source='download_count')
    viewCount = serializers.IntegerField(source='view_count')
    ageGroup = serializers.CharField(source='age_group')
    reviewedBy = serializers.CharField(source='reviewed_by', allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    lastReviewDate = serializers.DateTimeField(source='last_review_date', allow_null=True)
    
    tags = ResourceTagSerializer(many=True, read_only=True)
    languages = ResourceLanguageSerializer(many=True, read_only=True)
    targetAudience = ResourceAudienceSerializer(source='target_audience', many=True, read_only=True)
    
    # ADD THIS: Also provide 'language' field for frontend compatibility
    language = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientResource
        fields = [
            'id', 'title', 'description', 'full_description', 'category', 'type',
            'condition', 'status', 'isFeatured', 'isFree', 'imageUrl', 'fileUrl',
            'externalUrl', 'ageGroup', 'difficulty', 'duration', 'downloadCount',
            'viewCount', 'rating', 'author', 'reviewedBy', 'createdAt', 'updatedAt',
            'lastReviewDate', 'tags', 'languages', 'language', 'targetAudience' 
        ]
    
    def get_language(self, obj):
        """Return languages as simple array for frontend compatibility"""
        return [lang.language for lang in obj.languages.all()]
    
    def get_imageUrl(self, obj):
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url and not image_url.startswith('http'):
            return request.build_absolute_uri(image_url)
        return image_url
    
    def get_fileUrl(self, obj):
        file_url = obj.file_url_display
        request = self.context.get('request')
        if request and file_url and not file_url.startswith('http'):
            return request.build_absolute_uri(file_url)
        return file_url
    
    def get_externalUrl(self, obj):
        return obj.external_url

class CreatePatientResourceSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(required=False, allow_blank=True)
    fileUrl = serializers.CharField(required=False, allow_blank=True)
    externalUrl = serializers.CharField(required=False, allow_blank=True)
    isFeatured = serializers.BooleanField(source='is_featured', required=False)
    isFree = serializers.BooleanField(source='is_free', required=False)
    ageGroup = serializers.CharField(source='age_group')
    reviewedBy = serializers.CharField(source='reviewed_by', required=False, allow_blank=True)
    
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
        write_only=True
    )
    languages = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
        write_only=True
    )
    targetAudience = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = PatientResource
        fields = [
            'title', 'description', 'full_description', 'category', 'type',
            'condition', 'status', 'isFeatured', 'isFree', 'imageUrl', 'fileUrl',
            'externalUrl', 'ageGroup', 'difficulty', 'duration', 'author', 'reviewedBy',
            'tags', 'languages', 'targetAudience'
        ]
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        languages_data = validated_data.pop('languages', [])
        audience_data = validated_data.pop('targetAudience', [])
        
        # Handle URLs
        image_url = validated_data.pop('imageUrl', '')
        file_url = validated_data.pop('fileUrl', '')
        external_url = validated_data.pop('externalUrl', '')
        
        if image_url:
            validated_data['image_url'] = image_url
        if file_url:
            validated_data['file_url'] = file_url
        if external_url:
            validated_data['external_url'] = external_url
        
        # Create the resource
        resource = PatientResource.objects.create(**validated_data)
        
        # Create related objects
        self._create_tags(resource, tags_data)
        self._create_languages(resource, languages_data)
        self._create_audience(resource, audience_data)
        
        return resource
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        languages_data = validated_data.pop('languages', None)
        audience_data = validated_data.pop('targetAudience', None)
        
        # Handle URLs
        if 'imageUrl' in validated_data:
            image_url = validated_data.pop('imageUrl', '')
            if image_url:
                instance.image_url = image_url
            else:
                instance.image_url = ''
        
        if 'fileUrl' in validated_data:
            file_url = validated_data.pop('fileUrl', '')
            if file_url:
                instance.file_url = file_url
            else:
                instance.file_url = ''
        
        if 'externalUrl' in validated_data:
            external_url = validated_data.pop('externalUrl', '')
            if external_url:
                instance.external_url = external_url
            else:
                instance.external_url = ''
        
        # Update resource fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update related objects if provided
        if tags_data is not None:
            instance.tags.all().delete()
            self._create_tags(instance, tags_data)
        
        if languages_data is not None:
            instance.languages.all().delete()
            self._create_languages(instance, languages_data)
        
        if audience_data is not None:
            instance.target_audience.all().delete()
            self._create_audience(instance, audience_data)
        
        return instance
    
    def _create_tags(self, resource, tags_data):
        for tag in tags_data:
            if tag.strip():  
                ResourceTag.objects.create(resource=resource, name=tag.strip())
    
    def _create_languages(self, resource, languages_data):
        for language in languages_data:
            if language.strip():  
                ResourceLanguage.objects.create(resource=resource, language=language.strip())
    
    def _create_audience(self, resource, audience_data):
        for audience in audience_data:
            if audience.strip():  
                ResourceAudience.objects.create(resource=resource, audience=audience.strip())