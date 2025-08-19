from rest_framework import serializers
from .models import (
    Webinar, Speaker, WebinarTag, WebinarLanguage, 
    WebinarAudience, WebinarObjective, Registration
)
from django.utils.text import slugify
import json

class SpeakerSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    
    class Meta:
        model = Speaker
        fields = [
            'id', 'name', 'credentials', 'affiliation', 
            'bio', 'imageUrl', 'order'
        ]
    
    def get_imageUrl(self, obj):
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url and not image_url.startswith('http'):
            return request.build_absolute_uri(image_url)
        return image_url

class WebinarTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebinarTag
        fields = ['id', 'name']

class WebinarLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebinarLanguage
        fields = ['id', 'language']

class WebinarAudienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebinarAudience
        fields = ['id', 'audience']

class WebinarObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebinarObjective
        fields = ['id', 'objective', 'order']

class RegistrationSerializer(serializers.ModelSerializer):
    webinarTitle = serializers.CharField(source='webinar.title', read_only=True)
    
    class Meta:
        model = Registration
        fields = [
            'id', 'webinar', 'webinarTitle', 'attendee_name', 
            'email', 'phone', 'organization', 'registration_type',
            'payment_status', 'amount', 'country', 'registration_date'
        ]

class WebinarSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    isUpcoming = serializers.BooleanField(source='is_upcoming', read_only=True)
    isFeatured = serializers.BooleanField(source='is_featured')
    registrationCount = serializers.IntegerField(source='registration_count')
    registrationProgress = serializers.IntegerField(source='registration_progress', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    
    speakers = SpeakerSerializer(many=True, read_only=True)
    tags = WebinarTagSerializer(many=True, read_only=True)
    languages = WebinarLanguageSerializer(many=True, read_only=True)
    targetAudience = WebinarAudienceSerializer(source='target_audience', many=True, read_only=True)
    learningObjectives = WebinarObjectiveSerializer(source='learning_objectives', many=True, read_only=True)
    
    class Meta:
        model = Webinar
        fields = [
            'id', 'title', 'description', 'category', 'date', 'time', 
            'duration', 'status', 'type', 'isFeatured', 'registrationCount',
            'capacity', 'imageUrl', 'registration_link', 'recording_link',
            'slides_link', 'isUpcoming', 'registrationProgress', 'createdAt',
            'updatedAt', 'speakers', 'tags', 'languages', 'targetAudience',
            'learningObjectives'
        ]
    
    def get_imageUrl(self, obj):
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url and not image_url.startswith('http'):
            return request.build_absolute_uri(image_url)
        return image_url

class CreateWebinarSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(required=False, allow_blank=True)
    isFeatured = serializers.BooleanField(source='is_featured', required=False)
    speakers = serializers.JSONField(required=False, write_only=True)
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
    learningObjectives = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = Webinar
        fields = [
            'title', 'description', 'category', 'date', 'time', 'duration',
            'status', 'type', 'isFeatured', 'capacity', 'imageUrl',
            'registration_link', 'recording_link', 'slides_link',
            'speakers', 'tags', 'languages', 'targetAudience', 'learningObjectives'
        ]
    
    def validate_imageUrl(self, value):
        if value:
            value = value.strip()
            if value and not (value.startswith('http://') or value.startswith('https://') or value.startswith('/')):
                if not value.startswith('/'):
                    value = '/' + value
        return value
    
    def create(self, validated_data):
        # Extract nested data
        speakers_data = validated_data.pop('speakers', [])
        tags_data = validated_data.pop('tags', [])
        languages_data = validated_data.pop('languages', [])
        audience_data = validated_data.pop('targetAudience', [])
        objectives_data = validated_data.pop('learningObjectives', [])
        
        # Handle image URL
        image_url = validated_data.pop('imageUrl', '')
        if image_url:
            validated_data['image_url'] = image_url
        
        # Create the webinar
        webinar = Webinar.objects.create(**validated_data)
        
        # Create related objects
        self._create_speakers(webinar, speakers_data)
        self._create_tags(webinar, tags_data)
        self._create_languages(webinar, languages_data)
        self._create_audience(webinar, audience_data)
        self._create_objectives(webinar, objectives_data)
        
        return webinar
    
    def update(self, instance, validated_data):
        # Extract nested data
        speakers_data = validated_data.pop('speakers', None)
        tags_data = validated_data.pop('tags', None)
        languages_data = validated_data.pop('languages', None)
        audience_data = validated_data.pop('targetAudience', None)
        objectives_data = validated_data.pop('learningObjectives', None)
        
        # Handle image URL
        if 'imageUrl' in validated_data:
            image_url = validated_data.pop('imageUrl', '')
            if image_url:
                instance.image_url = image_url
            else:
                instance.image_url = ''
        
        # Update webinar fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update related objects if provided
        if speakers_data is not None:
            instance.speakers.all().delete()
            self._create_speakers(instance, speakers_data)
        
        if tags_data is not None:
            instance.tags.all().delete()
            self._create_tags(instance, tags_data)
        
        if languages_data is not None:
            instance.languages.all().delete()
            self._create_languages(instance, languages_data)
        
        if audience_data is not None:
            instance.target_audience.all().delete()
            self._create_audience(instance, audience_data)
        
        if objectives_data is not None:
            instance.learning_objectives.all().delete()
            self._create_objectives(instance, objectives_data)
        
        return instance
    
    def _create_speakers(self, webinar, speakers_data):
        for i, speaker_data in enumerate(speakers_data):
            Speaker.objects.create(
                webinar=webinar,
                name=speaker_data.get('name', ''),
                credentials=speaker_data.get('credentials', ''),
                affiliation=speaker_data.get('affiliation', ''),
                bio=speaker_data.get('bio', ''),
                image_url=speaker_data.get('imageUrl', ''),
                order=i
            )
    
    def _create_tags(self, webinar, tags_data):
        for tag in tags_data:
            WebinarTag.objects.create(webinar=webinar, name=tag)
    
    def _create_languages(self, webinar, languages_data):
        for language in languages_data:
            WebinarLanguage.objects.create(webinar=webinar, language=language)
    
    def _create_audience(self, webinar, audience_data):
        for audience in audience_data:
            WebinarAudience.objects.create(webinar=webinar, audience=audience)
    
    def _create_objectives(self, webinar, objectives_data):
        for i, objective in enumerate(objectives_data):
            WebinarObjective.objects.create(
                webinar=webinar,
                objective=objective,
                order=i
            )