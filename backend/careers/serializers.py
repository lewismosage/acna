from rest_framework import serializers
from django.utils import timezone
from .models import JobOpportunity, JobApplication, VolunteerSubmission
import json


class JobOpportunitySerializer(serializers.ModelSerializer):
    applications_count = serializers.ReadOnlyField()
    
    class Meta:
        model = JobOpportunity
        fields = [
            'id', 'title', 'department', 'location', 'type', 'level', 'status',
            'description', 'salary', 'closing_date', 'contract_duration', 'work_arrangement',
            'responsibilities', 'requirements', 'qualifications', 'benefits',
            'applications_count', 'posted_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'applications_count', 'posted_date', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Title is required and cannot be empty")
        return str(value).strip()
    
    def validate_department(self, value):
        """Validate department is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Department is required and cannot be empty")
        return str(value).strip()
    
    def validate_location(self, value):
        """Validate location is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Location is required and cannot be empty")
        return str(value).strip()
    
    def validate_description(self, value):
        """Validate description is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Description is required and cannot be empty")
        return str(value).strip()
    
    def validate_salary(self, value):
        """Validate salary is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Salary is required and cannot be empty")
        return str(value).strip()
    
    def validate_responsibilities(self, value):
        """Ensure responsibilities is a list of non-empty strings"""
        return self._validate_json_array(value, "Responsibilities")
    
    def validate_requirements(self, value):
        """Ensure requirements is a list of non-empty strings"""
        return self._validate_json_array(value, "Requirements")
    
    def validate_qualifications(self, value):
        """Ensure qualifications is a list of non-empty strings"""
        return self._validate_json_array(value, "Qualifications")
    
    def validate_benefits(self, value):
        """Ensure benefits is a list of non-empty strings"""
        return self._validate_json_array(value, "Benefits")
    
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


class JobOpportunityListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    applications_count = serializers.ReadOnlyField()
    
    class Meta:
        model = JobOpportunity
        fields = [
            'id', 'title', 'department', 'location', 'type', 'level', 'status',
            'salary', 'closing_date', 'applications_count', 'posted_date', 'created_at'
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    opportunity_title = serializers.ReadOnlyField(source='opportunity.title')
    applied_date = serializers.ReadOnlyField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'opportunity', 'opportunity_title', 'applicant_name', 'email', 'phone',
            'location', 'experience', 'status', 'cover_letter', 'resume',
            'applied_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'opportunity_title', 'applied_date', 'created_at', 'updated_at']
    
    def validate_applicant_name(self, value):
        """Validate applicant name is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Applicant name is required and cannot be empty")
        return str(value).strip()
    
    def validate_email(self, value):
        """Ensure unique email per opportunity"""
        opportunity = self.initial_data.get('opportunity')
        if opportunity:
            # Check if this is an update
            if self.instance:
                existing = JobApplication.objects.filter(
                    opportunity=opportunity, 
                    email=value
                ).exclude(id=self.instance.id)
            else:
                existing = JobApplication.objects.filter(
                    opportunity=opportunity, 
                    email=value
                )
            
            if existing.exists():
                raise serializers.ValidationError(
                    "An application with this email already exists for this opportunity."
                )
        return value
    
    def validate_phone(self, value):
        """Validate phone is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Phone number is required and cannot be empty")
        return str(value).strip()
    
    def validate_location(self, value):
        """Validate location is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Location is required and cannot be empty")
        return str(value).strip()
    
    def validate_experience(self, value):
        """Validate experience is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Experience is required and cannot be empty")
        return str(value).strip()
    
    def validate_cover_letter(self, value):
        """Validate cover letter is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Cover letter is required and cannot be empty")
        return str(value).strip()


class JobApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    opportunity_title = serializers.ReadOnlyField(source='opportunity.title')
    applied_date = serializers.ReadOnlyField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'opportunity', 'opportunity_title', 'applicant_name', 'email',
            'phone', 'status', 'applied_date', 'created_at'
        ]


class VolunteerSubmissionSerializer(serializers.ModelSerializer):
    join_date = serializers.DateField(read_only=True)
    
    class Meta:
        model = VolunteerSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'location', 'availability',
            'experience', 'motivation', 'status', 'hours_contributed',
            'join_date', 'interests', 'skills', 'projects',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'join_date', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate name is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Name is required and cannot be empty")
        return str(value).strip()
    
    def validate_email(self, value):
        """Handle email uniqueness validation with better error message"""
        if self.instance:
            # This is an update, check for duplicates excluding current instance
            existing = VolunteerSubmission.objects.filter(email=value).exclude(id=self.instance.id)
        else:
            # This is a create, check for any existing
            existing = VolunteerSubmission.objects.filter(email=value)
        
        if existing.exists():
            raise serializers.ValidationError(
                "A volunteer application with this email address already exists. "
                "Please use a different email address or contact us if you need to update your application."
            )
        return value
    
    def validate_phone(self, value):
        """Validate phone is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Phone number is required and cannot be empty")
        return str(value).strip()
    
    def validate_location(self, value):
        """Validate location is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Location is required and cannot be empty")
        return str(value).strip()
    
    def validate_availability(self, value):
        """Validate availability is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Availability is required and cannot be empty")
        return str(value).strip()
    
    def validate_experience(self, value):
        """Validate experience is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Experience is required and cannot be empty")
        return str(value).strip()
    
    def validate_motivation(self, value):
        """Validate motivation is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Motivation is required and cannot be empty")
        return str(value).strip()
    
    def validate_interests(self, value):
        """Ensure interests is a list of non-empty strings"""
        return self._validate_json_array(value, "Interests")
    
    def validate_skills(self, value):
        """Ensure skills is a list of non-empty strings"""
        return self._validate_json_array(value, "Skills")
    
    def validate_projects(self, value):
        """Ensure projects is a list of non-empty strings"""
        return self._validate_json_array(value, "Projects")
    
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


class VolunteerSubmissionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = VolunteerSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'location', 'status',
            'availability', 'hours_contributed', 'join_date', 'created_at'
        ]


# Status update serializers
class JobOpportunityStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOpportunity
        fields = ['status']
    
    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        # Handle posted_date logic
        if instance.status == 'Active' and not instance.posted_date:
            instance.posted_date = timezone.now().date()
        elif instance.status != 'Active':
            instance.posted_date = None
        instance.save()
        return instance


class JobApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status']


class VolunteerSubmissionStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerSubmission
        fields = ['status']
    
    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        # Handle join_date logic
        if instance.status == 'Active' and not instance.join_date:
            instance.join_date = timezone.now().date()
        elif instance.status != 'Active':
            instance.join_date = None
        instance.save()
        return instance