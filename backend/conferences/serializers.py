from rest_framework import serializers
from .models import Conference, Speaker, Session, Registration
from django.core.files.base import ContentFile
import base64
import uuid
import json

class SpeakerSerializer(serializers.ModelSerializer):
    display_image_url = serializers.SerializerMethodField()
    expertise = serializers.SerializerMethodField()

    class Meta:
        model = Speaker
        fields = [
            'id', 'name', 'title', 'organization', 'bio', 'image', 'image_url',
            'display_image_url', 'expertise', 'is_keynote', 'email', 'linkedin', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_display_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return obj.image_url

    def get_expertise(self, obj):
        """Return expertise as a list"""
        return obj.expertise_list

    def validate_image(self, value):
        if value and value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Image size should be less than 5MB")
        return value

class SessionSerializer(serializers.ModelSerializer):
    end_time = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'duration_minutes',
            'duration_display', 'session_type', 'location', 'speaker_names',
            'moderator', 'capacity', 'materials_required', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_end_time(self, obj):
        return obj.end_time

    def get_duration_display(self, obj):
        return obj.duration_display

class RegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            'id', 'conference', 'first_name', 'last_name', 'full_name', 'email',
            'phone', 'organization', 'job_title', 'country', 'registration_type',
            'payment_status', 'amount_paid', 'dietary_requirements',
            'accessibility_needs', 'registered_at'
        ]
        read_only_fields = ['id', 'registered_at']

    def get_full_name(self, obj):
        return obj.full_name

    def validate(self, data):
        # Check if email is already registered for this conference
        conference = data.get('conference')
        email = data.get('email')
        
        if conference and email:
            # Check if this email is already registered for this conference
            if Registration.objects.filter(conference=conference, email=email).exists():
                raise serializers.ValidationError({
                    'email': 'This email is already registered for this conference.'
                })
        
        # Ensure required fields are present
        required_fields = ['first_name', 'last_name', 'email', 'conference']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f'{field.replace("_", " ").title()} is required.'
                })
        
        return data

class ConferenceSerializer(serializers.ModelSerializer):
    display_image_url = serializers.SerializerMethodField()
    speakers = SpeakerSerializer(many=True, read_only=True)
    sessions = SessionSerializer(many=True, read_only=True)
    registrations = RegistrationSerializer(many=True, read_only=True)
    registration_count = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()

    class Meta:
        model = Conference
        fields = [
            'id', 'title', 'theme', 'description', 'full_description', 'date', 'time',
            'location', 'venue', 'type', 'status', 'image', 'image_url', 'display_image_url',
            'capacity', 'regular_fee', 'early_bird_fee', 'early_bird_deadline',
            'expected_attendees', 'countries_represented', 'highlights', 'organizer_name',
            'organizer_email', 'organizer_phone', 'organizer_website', 'registration_count',
            'speakers', 'sessions', 'registrations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'registration_count']

    def get_registration_count(self, obj):
        return obj.registration_count

    def get_display_image_url(self, obj):
        """Return absolute URL for the image"""
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url:
            return request.build_absolute_uri(image_url)
        return image_url

    def get_highlights(self, obj):
        """Return highlights as a list"""
        return obj.highlights_list

    def validate_image(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("Image size should be less than 10MB")
        return value

    def validate_date(self, value):
        """Ensure date is properly formatted"""
        if not value:
            raise serializers.ValidationError("Date is required")
        return value

    def validate_title(self, value):
        """Ensure title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required")
        return value.strip()

    def validate_location(self, value):
        """Ensure location is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Location is required")
        return value.strip()

    def validate_description(self, value):
        """Ensure description is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required")
        return value.strip()

    def create(self, validated_data):
        """Create conference with proper data handling"""
        try:
            # Handle highlights
            if 'highlights' in validated_data:
                highlights = validated_data['highlights']
                if isinstance(highlights, list):
                    validated_data['highlights'] = json.dumps(highlights)
                elif isinstance(highlights, str):
                    # Try to parse if it's already JSON
                    try:
                        json.loads(highlights)
                    except json.JSONDecodeError:
                        # If not valid JSON, treat as single item
                        validated_data['highlights'] = json.dumps([highlights])

            conference = Conference.objects.create(**validated_data)
            return conference
        except Exception as e:
            raise serializers.ValidationError(f"Error creating conference: {str(e)}")

    def update(self, instance, validated_data):
        """Update conference with proper data handling"""
        try:
            # Handle highlights
            if 'highlights' in validated_data:
                highlights = validated_data['highlights']
                if isinstance(highlights, list):
                    validated_data['highlights'] = json.dumps(highlights)
                elif isinstance(highlights, str):
                    # Try to parse if it's already JSON
                    try:
                        json.loads(highlights)
                    except json.JSONDecodeError:
                        # If not valid JSON, treat as single item
                        validated_data['highlights'] = json.dumps([highlights])

            # Update instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
            return instance
        except Exception as e:
            raise serializers.ValidationError(f"Error updating conference: {str(e)}")

class ConferenceAnalyticsSerializer(serializers.Serializer):
    total_conferences = serializers.IntegerField()
    conferences_by_status = serializers.DictField(child=serializers.IntegerField())
    conferences_by_type = serializers.DictField(child=serializers.IntegerField())
    total_registrations = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_attendance = serializers.DecimalField(max_digits=6, decimal_places=2)
    upcoming_conferences = serializers.IntegerField()
    completed_conferences = serializers.IntegerField()
    monthly_registrations = serializers.ListField(child=serializers.DictField())
    top_conferences = serializers.ListField(child=serializers.DictField())