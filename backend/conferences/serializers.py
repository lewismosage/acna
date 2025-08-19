from rest_framework import serializers
from .models import Conference, Speaker, Session, Registration
from django.core.files.base import ContentFile
import base64
import uuid

class SpeakerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    expertise = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Speaker
        fields = [
            'id', 'name', 'title', 'organization', 'bio', 'image', 'image_url',
            'expertise', 'is_keynote', 'email', 'linkedin', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return obj.image_url

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

class ConferenceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    speakers = SpeakerSerializer(many=True, required=False)
    sessions = SessionSerializer(many=True, required=False)
    registrations = RegistrationSerializer(many=True, required=False)
    registration_count = serializers.SerializerMethodField()

    class Meta:
        model = Conference
        fields = [
            'id', 'title', 'theme', 'description', 'full_description', 'date', 'time',
            'location', 'venue', 'type', 'status', 'image', 'image_url',
            'capacity', 'regular_fee', 'early_bird_fee', 'early_bird_deadline',
            'expected_attendees', 'countries_represented', 'highlights', 'organizer_name',
            'organizer_email', 'organizer_phone', 'organizer_website', 'registration_count',
            'speakers', 'sessions', 'registrations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_registration_count(self, obj):
        return obj.registration_count

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return obj.image_url

    def validate_image(self, value):
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("Image size should be less than 10MB")
        return value

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        conference = Conference.objects.create(**validated_data)
        if image:
            conference.image.save(
                f'conference_{conference.id}_{uuid.uuid4().hex[:6]}.jpg',
                ContentFile(image.read()),
                save=True
            )
        return conference

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if image:
            instance.image.save(
                f'conference_{instance.id}_{uuid.uuid4().hex[:6]}.jpg',
                ContentFile(image.read()),
                save=True
            )
        instance.save()
        return instance

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