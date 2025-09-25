from rest_framework import serializers
from .models import User, VerificationCode, AdminInvite
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
            'organization_address', 'website',
            'specialization',
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

class UserProfileSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            'first_name', 
            'last_name', 
            'institution', 
            'profile_photo',
            'mobile_number',
            'physical_address',
            'country',
            'gender',
            'age_bracket',
            'specialization'
        ]
        extra_kwargs = {
            'profile_photo': {'required': False},
            'mobile_number': {'required': False},
            'physical_address': {'required': False},
            'country': {'required': False},
            'gender': {'required': False},
            'age_bracket': {'required': False},
            'institution': {'required': False}
        }

    def validate_profile_photo(self, value):
        if value and value.size > 2 * 1024 * 1024:  # 2MB limit
            raise serializers.ValidationError("Image size cannot exceed 2MB")
        return value

    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.profile_photo.url)
        return None

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        validate_password(data['new_password'])
        return data

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'mobile_number',
            'country',
            'membership_class',
            'institution',
            'specialization',
            'is_active_member',
            'membership_valid_until',
            'profile_photo',
            'membership_id', 
            'date_joined',
        ]
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.profile_photo:
            request = self.context.get('request')
            data['profile_photo'] = request.build_absolute_uri(instance.profile_photo.url)
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'is_admin', 'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_last_login(self, obj):
        return obj.last_login.isoformat() if obj.last_login else None

class AdminInviteSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminInvite
        fields = [
            'id', 'email', 'invited_by_name', 'created_at', 
            'expires_at', 'is_used', 'is_valid'
        ]
        read_only_fields = ['id', 'invited_by_name', 'created_at', 'expires_at', 'is_used', 'is_valid']
    
    def get_invited_by_name(self, obj):
        return obj.invited_by.get_full_name()

class SendAdminInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        # Check if user already exists
        if User.objects.filter(email__iexact=value).exists():
            user = User.objects.get(email__iexact=value)
            if user.is_admin:
                raise serializers.ValidationError("This email already has admin privileges.")
            else:
                raise serializers.ValidationError("A user with this email already exists. They need to be granted admin privileges through user management.")
        
        # Check if there's already a pending invite
        if AdminInvite.objects.filter(email__iexact=value, is_used=False).exists():
            invite = AdminInvite.objects.get(email__iexact=value, is_used=False)
            if invite.is_valid:
                raise serializers.ValidationError("An admin invitation has already been sent to this email address.")
        
        return value.lower()

class AdminSignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    invite_token = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm_password', 'first_name', 
            'last_name', 'invite_token'
        ]
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": ["Password fields didn't match."]
            })
        
        # Validate invite token
        try:
            invite = AdminInvite.objects.get(token=data['invite_token'])
            if not invite.is_valid:
                raise serializers.ValidationError({
                    "invite_token": ["This invitation has expired or been used."]
                })
            if invite.email.lower() != data['email'].lower():
                raise serializers.ValidationError({
                    "email": ["Email does not match the invitation."]
                })
        except AdminInvite.DoesNotExist:
            raise serializers.ValidationError({
                "invite_token": ["Invalid invitation token."]
            })
        
        return data
    
    def create(self, validated_data):
        invite_token = validated_data.pop('invite_token')
        validated_data.pop('confirm_password')
        
        # Create admin user
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            is_admin=True,
            **validated_data
        )
        
        # Mark invite as used
        invite = AdminInvite.objects.get(token=invite_token)
        invite.is_used = True
        invite.save()
        
        return user