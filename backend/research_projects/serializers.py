from rest_framework import serializers
from .models import ResearchProject, ResearchProjectView, ResearchProjectUpdate
import json
from datetime import datetime


class InvestigatorSerializer(serializers.Serializer):
    """Serializer for investigator objects within ResearchProject"""
    name = serializers.CharField(max_length=200)
    role = serializers.CharField(max_length=100)
    affiliation = serializers.CharField(max_length=200)
    email = serializers.EmailField(required=False, allow_blank=True)


class ResearchProjectSerializer(serializers.ModelSerializer):
    # Computed fields for frontend compatibility
    image_url = serializers.SerializerMethodField()
    investigator_count = serializers.ReadOnlyField()
    duration_days = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = ResearchProject
        fields = [
            'id', 'title', 'description', 'type', 'status', 'principal_investigator', 
            'registration_number', 'start_date', 'end_date', 'funding_source', 
            'funding_amount', 'target_population', 'sample_size', 'methodology', 
            'ethics_approval', 'image', 'image_url', 'investigators', 'institutions', 
            'objectives', 'keywords', 'created_at', 'updated_at', 'investigator_count',
            'duration_days', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'investigator_count', 'duration_days', 'is_active']
    
    def get_image_url(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400'
    
    def validate_investigators(self, value):
        """Ensure investigators is a list of investigator objects"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for investigators")
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Investigators must be a list")
        
        # Validate each investigator object
        for i, investigator in enumerate(value):
            if not isinstance(investigator, dict):
                raise serializers.ValidationError(f"Investigator {i+1} must be an object")
            
            required_fields = ['name', 'role', 'affiliation']
            for field in required_fields:
                if not investigator.get(field, '').strip():
                    raise serializers.ValidationError(f"Investigator {i+1}: {field} is required")
            
            # Validate email if provided
            email = investigator.get('email', '').strip()
            if email:
                try:
                    serializers.EmailField().to_internal_value(email)
                except serializers.ValidationError:
                    raise serializers.ValidationError(f"Investigator {i+1}: Invalid email format")
        
        return value
    
    def validate_institutions(self, value):
        """Ensure institutions is a list of strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Institutions must be a list")
        
        return [str(inst).strip() for inst in value if str(inst).strip()]
    
    def validate_objectives(self, value):
        """Ensure objectives is a list of strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Objectives must be a list")
        
        return [str(obj).strip() for obj in value if str(obj).strip()]
    
    def validate_keywords(self, value):
        """Ensure keywords is a list of strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Keywords must be a list")
        
        return [str(keyword).strip() for keyword in value if str(keyword).strip()]
    
    def validate(self, data):
        """Cross-field validation"""
        # Date validation
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("End date must be after start date")
        
        # Sample size validation
        sample_size = data.get('sample_size')
        if sample_size is not None and sample_size < 1:
            raise serializers.ValidationError("Sample size must be a positive number")
        
        return data
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Format dates for frontend consistency
        if data.get('start_date'):
            data['startDate'] = data['start_date']
        if data.get('end_date'):
            data['endDate'] = data['end_date']
        if data.get('created_at'):
            data['createdAt'] = data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at'])
        if data.get('updated_at'):
            data['updatedAt'] = data['updated_at'].split('T')[0] if 'T' in str(data['updated_at']) else str(data['updated_at'])
        
        # Rename fields for frontend compatibility
        data['principalInvestigator'] = data.get('principal_investigator', '')
        data['registrationNumber'] = data.get('registration_number', '')
        data['fundingSource'] = data.get('funding_source', '')
        data['fundingAmount'] = data.get('funding_amount', '')
        data['targetPopulation'] = data.get('target_population', '')
        data['sampleSize'] = data.get('sample_size')
        data['ethicsApproval'] = data.get('ethics_approval', False)
        data['imageUrl'] = data.get('image_url', 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400')
        data['investigatorCount'] = data.get('investigator_count', 0)
        data['durationDays'] = data.get('duration_days')
        data['isActive'] = data.get('is_active', False)
        
        return data


class ResearchProjectAnalyticsSerializer(serializers.Serializer):
    """Serializer for research project analytics data"""
    total = serializers.IntegerField()
    planning = serializers.IntegerField()
    active = serializers.IntegerField()
    recruiting = serializers.IntegerField()
    data_collection = serializers.IntegerField()
    analysis = serializers.IntegerField()
    completed = serializers.IntegerField()
    suspended = serializers.IntegerField()
    terminated = serializers.IntegerField()
    projects_by_type = serializers.DictField(child=serializers.IntegerField())
    projects_by_status = serializers.DictField(child=serializers.IntegerField())
    total_investigators = serializers.IntegerField()
    projects_with_ethics_approval = serializers.IntegerField()
    avg_duration_days = serializers.FloatField(allow_null=True)
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'total': data.get('total', 0),
            'planning': data.get('planning', 0),
            'active': data.get('active', 0),
            'recruiting': data.get('recruiting', 0),
            'dataCollection': data.get('data_collection', 0),
            'analysis': data.get('analysis', 0),
            'completed': data.get('completed', 0),
            'suspended': data.get('suspended', 0),
            'terminated': data.get('terminated', 0),
            'projectsByType': data.get('projects_by_type', {}),
            'projectsByStatus': data.get('projects_by_status', {}),
            'totalInvestigators': data.get('total_investigators', 0),
            'projectsWithEthicsApproval': data.get('projects_with_ethics_approval', 0),
            'avgDurationDays': data.get('avg_duration_days'),
        }


class ResearchProjectViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchProjectView
        fields = ['id', 'research_project', 'ip_address', 'user_agent', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']


class ResearchProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchProjectUpdate
        fields = ['id', 'research_project', 'title', 'description', 'update_type', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Format date for frontend consistency
        if data.get('created_at'):
            data['createdAt'] = data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at'])
        
        # Rename fields for frontend compatibility
        data['researchProject'] = data.get('research_project')
        data['updateType'] = data.get('update_type', 'General Update')
        
        return data