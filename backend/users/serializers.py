from rest_framework import serializers
from .models import User, VerificationCode
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'mobile_number', 'physical_address',
            'country', 'gender', 'age_bracket', 'membership_class',
            'is_organization', 'organization_name', 'organization_type',
            'registration_number', 'contact_person_title', 'organization_phone',
            'organization_address', 'website'
        ]
    
    def validate(self, data):
        email = data.get('email')
        username = data.get('username')
        
        # Check for existing email
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                'email': ['This email address is already in use. Please use a different email or login.']
            })
        
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                'username': ['This username is already taken. Please choose a different one.']
            })

        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": ["Password fields didn't match."]
            })
        
        if data.get('is_organization'):
            # Organization-specific validation
            required_fields = [
                'organization_name', 'organization_type', 
                'contact_person_title', 'organization_phone',
                'organization_address'
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: ["This field is required for organizations."]
                    })
        else:
            # Individual-specific validation
            required_fields = [
                'first_name', 'last_name', 'gender',
                'age_bracket', 'membership_class'
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: ["This field is required for individuals."]
                    })
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

class VerificationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6)
    email = serializers.EmailField()

class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()