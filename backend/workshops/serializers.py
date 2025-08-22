# workshops/serializers.py
from rest_framework import serializers
from .models import (
    Workshop, WorkshopPrerequisite, WorkshopMaterial,
    CollaborationSubmission, CollaborationSkill, WorkshopRegistration
)

class WorkshopPrerequisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopPrerequisite
        fields = ['id', 'prerequisite']

class WorkshopMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopMaterial
        fields = ['id', 'material']

class WorkshopSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    prerequisites = WorkshopPrerequisiteSerializer(many=True, read_only=True)
    materials = WorkshopMaterialSerializer(many=True, read_only=True)
    
    class Meta:
        model = Workshop
        fields = [
            'id', 'title', 'instructor', 'date', 'time', 
            'duration', 'location', 'venue', 'type', 'status',
            'description', 'imageUrl', 'capacity', 'registered',
            'price', 'prerequisites', 'materials', 'createdAt',
            'updatedAt'
        ]
    
    def get_imageUrl(self, obj):
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url and not image_url.startswith('http'):
            return request.build_absolute_uri(image_url)
        return image_url

class CreateWorkshopSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(required=False, allow_blank=True, write_only=True)
    prerequisites = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
        write_only=True
    )
    materials = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        default=list,
        write_only=True
    )
    
    class Meta:
        model = Workshop
        fields = [
            'title', 'instructor', 'date', 'time', 'duration',
            'location', 'venue', 'type', 'status', 'description',
            'imageUrl', 'capacity', 'price', 'prerequisites', 'materials'
        ]
    
    def validate(self, data):
        # Convert empty strings to None for optional fields
        if data.get('venue') == '':
            data['venue'] = None
        if data.get('price') == '':
            data['price'] = None
        
        return data
    
    def validate_imageUrl(self, value):
        if value:
            value = value.strip()
            if value and not (value.startswith('http://') or value.startswith('https://') or value.startswith('/')):
                if not value.startswith('/'):
                    value = '/' + value
        return value
    
    def create(self, validated_data):
        # Extract nested data with proper defaults
        prerequisites_data = validated_data.pop('prerequisites', [])
        materials_data = validated_data.pop('materials', [])
        
        # Handle image URL
        image_url = validated_data.pop('imageUrl', '')
        if image_url:
            validated_data['image_url'] = image_url
        
        # Create the workshop
        workshop = Workshop.objects.create(**validated_data)
        
        # Create related objects
        self._create_prerequisites(workshop, prerequisites_data)
        self._create_materials(workshop, materials_data)
        
        return workshop
    
    def update(self, instance, validated_data):
        # Extract nested data
        prerequisites_data = validated_data.pop('prerequisites', None)
        materials_data = validated_data.pop('materials', None)
        
        # Handle image URL
        if 'imageUrl' in validated_data:
            image_url = validated_data.pop('imageUrl', '')
            if image_url:
                instance.image_url = image_url
            else:
                instance.image_url = ''
        
        # Update workshop fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update related objects if provided
        if prerequisites_data is not None:
            instance.prerequisites.all().delete()
            self._create_prerequisites(instance, prerequisites_data)
        
        if materials_data is not None:
            instance.materials.all().delete()
            self._create_materials(instance, materials_data)
        
        return instance
    
    def _create_prerequisites(self, workshop, prerequisites_data):
        for prerequisite in prerequisites_data:
            if prerequisite.strip():  # Only create if not empty
                WorkshopPrerequisite.objects.create(
                    workshop=workshop,
                    prerequisite=prerequisite
                )
    
    def _create_materials(self, workshop, materials_data):
        for material in materials_data:
            if material.strip():  # Only create if not empty
                WorkshopMaterial.objects.create(
                    workshop=workshop,
                    material=material
                )

class CollaborationSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationSkill
        fields = ['id', 'skill']

class CollaborationSubmissionSerializer(serializers.ModelSerializer):
    skillsNeeded = CollaborationSkillSerializer(many=True, read_only=True)
    submittedAt = serializers.DateTimeField(source='submitted_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    
    class Meta:
        model = CollaborationSubmission
        fields = [
            'id', 'project_title', 'project_description', 'institution',
            'project_lead', 'contact_email', 'skillsNeeded', 'commitment_level',
            'duration', 'additional_notes', 'status', 'submittedAt', 'updatedAt'
        ]

class CreateCollaborationSerializer(serializers.ModelSerializer):
    skillsNeeded = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = CollaborationSubmission
        fields = [
            'project_title', 'project_description', 'institution',
            'project_lead', 'contact_email', 'skillsNeeded', 'commitment_level',
            'duration', 'additional_notes'
        ]
    
    def to_internal_value(self, data):
        # Convert camelCase field names to snake_case for the backend
        field_mapping = {
            'projectTitle': 'project_title',
            'projectDescription': 'project_description',
            'projectLead': 'project_lead',
            'contactEmail': 'contact_email',
            'skillsNeeded': 'skillsNeeded', 
            'commitmentLevel': 'commitment_level',
            'additionalNotes': 'additional_notes'
        }
        
        new_data = {}
        for key, value in data.items():
            if key in field_mapping:
                new_data[field_mapping[key]] = value
            else:
                new_data[key] = value
        
        return super().to_internal_value(new_data)
    
    def create(self, validated_data):
        # Extract skills data
        skills_data = validated_data.pop('skillsNeeded', [])
        
        # Create the collaboration submission
        collaboration = CollaborationSubmission.objects.create(**validated_data)
        
        # Create related skills
        self._create_skills(collaboration, skills_data)
        
        return collaboration
    
    def update(self, instance, validated_data):
        # Extract skills data
        skills_data = validated_data.pop('skillsNeeded', None)
        
        # Update collaboration fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update skills if provided
        if skills_data is not None:
            instance.skills_needed.all().delete()
            self._create_skills(instance, skills_data)
        
        return instance
    
    def _create_skills(self, collaboration, skills_data):
        for skill in skills_data:
            if skill.strip():  # Only create if not empty
                CollaborationSkill.objects.create(
                    collaboration=collaboration,
                    skill=skill
                )

class WorkshopRegistrationSerializer(serializers.ModelSerializer):
    workshopTitle = serializers.CharField(source='workshop.title', read_only=True)
    workshopDate = serializers.DateField(source='workshop.date', read_only=True)
    workshopLocation = serializers.CharField(source='workshop.location', read_only=True)
    fullName = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkshopRegistration
        fields = [
            'id', 'workshop', 'workshopTitle', 'workshopDate', 'workshopLocation',
            'first_name', 'last_name', 'fullName', 'email', 'phone', 'organization',
            'profession', 'registration_type', 'payment_status', 'amount', 'country',
            'registered_at'
        ]
    
    def get_fullName(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class CreateWorkshopRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopRegistration
        fields = [
            'workshop', 'first_name', 'last_name', 'email', 'phone', 'organization',
            'profession', 'registration_type', 'amount', 'country'
        ]
    
    def validate(self, data):
        # Check if email is already registered for this workshop
        workshop = data['workshop']
        email = data['email']
        
        if WorkshopRegistration.objects.filter(workshop=workshop, email=email).exists():
            raise serializers.ValidationError(
                "This email is already registered for this workshop."
            )
        
        return data