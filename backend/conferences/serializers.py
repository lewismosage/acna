from rest_framework import serializers
from .models import Conference, Registration
from django.utils.text import slugify
import json

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = [
            'id', 'name', 'email', 'phone', 'organization',
            'registration_date', 'registration_type', 'payment_status'
        ]

class ConferenceSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    earlyBirdDeadline = serializers.DateField(source='early_bird_deadline')
    regularFee = serializers.CharField(source='regular_fee')
    earlyBirdFee = serializers.CharField(source='early_bird_fee')
    registrationCount = serializers.IntegerField(source='registration_count')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    registrations = RegistrationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conference
        fields = [
            'id', 'title', 'date', 'location', 'venue', 'type', 'status',
            'theme', 'description', 'imageUrl', 'attendees', 'speakers',
            'countries', 'earlyBirdDeadline', 'regularFee', 'earlyBirdFee',
            'registrationCount', 'capacity', 'highlights', 'createdAt',
            'updatedAt', 'registrations'
        ]
    
    def get_imageUrl(self, obj):
        """Get the image URL with proper handling"""
        image_url = obj.image_url_display
        if image_url and not image_url.startswith('http'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image_url)
        return image_url

class CreateConferenceSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, write_only=True)
    imageUrl = serializers.CharField(required=False, allow_blank=True, write_only=True)
    earlyBirdDeadline = serializers.DateField(source='early_bird_deadline', required=False)
    regularFee = serializers.CharField(source='regular_fee', required=False)
    earlyBirdFee = serializers.CharField(source='early_bird_fee', required=False)
    registrationCount = serializers.IntegerField(source='registration_count', required=False)
    
    class Meta:
        model = Conference
        fields = [
            'title', 'date', 'location', 'venue', 'type', 'status',
            'theme', 'description', 'image', 'imageUrl', 'attendees', 'speakers',
            'countries', 'earlyBirdDeadline', 'regularFee', 'earlyBirdFee',
            'registrationCount', 'capacity', 'highlights'
        ]
    
    def create(self, validated_data):
        # Handle image upload
        image = validated_data.pop('image', None)
        image_url = validated_data.pop('imageUrl', '')
        
        conference = Conference.objects.create(**validated_data)
        
        if image:
            conference.image = image
            conference.save()
        elif image_url:
            conference.image_url = image_url
            conference.save()
            
        return conference
    
    def update(self, instance, validated_data):
        # Handle image upload
        image = validated_data.pop('image', None)
        image_url = validated_data.pop('imageUrl', None)
        
        if image is not None:
            # If a new image is provided, use it and clear the URL
            instance.image = image
            instance.image_url = ''
        elif image_url is not None:
            # If a new URL is provided, use it and clear the uploaded image
            instance.image_url = image_url
            if image_url == '':
                # If empty string is passed, clear both
                instance.image = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance