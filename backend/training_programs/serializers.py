from rest_framework import serializers
from .models import TrainingProgram, Registration, ScheduleItem, Speaker
import json


class ScheduleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleItem
        fields = ['day', 'time', 'activity', 'speaker']
    
    def validate_activity(self, value):
        """Ensure activity is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Activity is required")
        return value.strip()


class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = ['name', 'title', 'organization', 'bio']
    
    def validate_name(self, value):
        """Ensure speaker name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Speaker name is required")
        return value.strip()


class TrainingProgramSerializer(serializers.ModelSerializer):
    image_url_display = serializers.SerializerMethodField()
    schedule = ScheduleItemSerializer(many=True, required=False)
    speakers = SpeakerSerializer(many=True, required=False)
    
    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'title', 'description', 'type', 'category', 'status', 'is_featured',
            'duration', 'format', 'location', 'timezone', 'language',
            'max_participants', 'current_enrollments', 'instructor',
            'start_date', 'end_date', 'registration_deadline',
            'price', 'currency', 'image', 'image_url', 'image_url_display',
            'prerequisites', 'learning_outcomes', 'topics', 'target_audience', 'materials',
            'certificate_type', 'cme_credits', 'assessment_method', 'passing_score',
            'schedule', 'speakers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_enrollments', 'created_at', 'updated_at']
    
    def get_image_url_display(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required")
        return value.strip()
    
    def validate_category(self, value):
        """Validate category is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Category is required")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required")
        return value.strip()
    
    def validate_instructor(self, value):
        """Validate instructor is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Instructor is required")
        return value.strip()
    
    def validate_max_participants(self, value):
        """Validate max participants is positive"""
        if value is None:
            return 1  # Default minimum
        if value <= 0:
            raise serializers.ValidationError("Maximum participants must be greater than 0")
        return value
    
    def validate_price(self, value):
        """Validate price is not negative"""
        if value is None:
            return 0.0  # Default to free
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value
    
    def validate_cme_credits(self, value):
        """Validate CME credits"""
        if value is None:
            return 0  # Default to no credits
        if value < 0:
            raise serializers.ValidationError("CME credits cannot be negative")
        return value
    
    def validate_image_url(self, value):
        """Validate image URL - allow empty values"""
        if not value or not value.strip():
            return ""  # Allow empty image URLs
        return value
    
    def validate(self, data):
        """Cross-field validation with better error handling"""
        # Provide defaults for missing required fields
        if 'start_date' not in data or not data['start_date']:
            raise serializers.ValidationError({
                'start_date': 'Start date is required'
            })
        if 'end_date' not in data or not data['end_date']:
            raise serializers.ValidationError({
                'end_date': 'End date is required'
            })
        if 'registration_deadline' not in data or not data['registration_deadline']:
            raise serializers.ValidationError({
                'registration_deadline': 'Registration deadline is required'
            })
            
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        registration_deadline = data.get('registration_deadline')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date'
            })
        
        if registration_deadline and start_date and registration_deadline > start_date:
            raise serializers.ValidationError({
                'registration_deadline': 'Registration deadline cannot be after start date'
            })
        
        # Ensure required numeric fields have valid values
        if 'max_participants' not in data or data['max_participants'] is None:
            data['max_participants'] = 1
        if 'price' not in data or data['price'] is None:
            data['price'] = 0.0
        if 'cme_credits' not in data or data['cme_credits'] is None:
            data['cme_credits'] = 0
            
        return data
    
    def validate_prerequisites(self, value):
        """Ensure prerequisites is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Prerequisites must be a list")
        
        validated_prerequisites = [str(prereq).strip() for prereq in value if str(prereq).strip()]
        return validated_prerequisites
    
    def validate_learning_outcomes(self, value):
        """Ensure learning outcomes is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Learning outcomes must be a list")
        
        validated_outcomes = [str(outcome).strip() for outcome in value if str(outcome).strip()]
        return validated_outcomes
    
    def validate_topics(self, value):
        """Ensure topics is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Topics must be a list")
        
        validated_topics = [str(topic).strip() for topic in value if str(topic).strip()]
        return validated_topics
    
    def validate_target_audience(self, value):
        """Ensure target audience is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Target audience must be a list")
        
        validated_audience = [str(audience).strip() for audience in value if str(audience).strip()]
        return validated_audience
    
    def validate_materials(self, value):
        """Ensure materials is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Materials must be a list")
        
        validated_materials = [str(material).strip() for material in value if str(material).strip()]
        return validated_materials
    
    def validate_schedule(self, value):
        """Validate schedule data"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Schedule must be a list")
        
        # Filter out empty schedule items
        validated_schedule = []
        for item in value:
            if isinstance(item, dict) and item.get('activity', '').strip():
                validated_schedule.append({
                    'day': item.get('day', '').strip(),
                    'time': item.get('time', '').strip(),
                    'activity': item.get('activity', '').strip(),
                    'speaker': item.get('speaker', '').strip(),
                })
        
        return validated_schedule
    
    def validate_speakers(self, value):
        """Validate speakers data"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Speakers must be a list")
        
        # Filter out empty speaker entries
        validated_speakers = []
        for speaker in value:
            if isinstance(speaker, dict) and speaker.get('name', '').strip():
                validated_speakers.append({
                    'name': speaker.get('name', '').strip(),
                    'title': speaker.get('title', '').strip(),
                    'organization': speaker.get('organization', '').strip(),
                    'bio': speaker.get('bio', '').strip(),
                })
        
        return validated_speakers
    
    def create(self, validated_data):
        """Create a new training program with related objects"""
        schedule_data = validated_data.pop('schedule', [])
        speakers_data = validated_data.pop('speakers', [])
        
        # Create the program
        program = TrainingProgram.objects.create(**validated_data)
        
        # Create schedule items
        for schedule_item in schedule_data:
            ScheduleItem.objects.create(program=program, **schedule_item)
        
        # Create speakers
        for speaker_data in speakers_data:
            Speaker.objects.create(program=program, **speaker_data)
        
        return program
    
    def update(self, instance, validated_data):
        """Update training program and related objects"""
        schedule_data = validated_data.pop('schedule', None)
        speakers_data = validated_data.pop('speakers', None)
        
        # Update the program fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update schedule items if provided
        if schedule_data is not None:
            instance.schedule.all().delete()
            for schedule_item in schedule_data:
                ScheduleItem.objects.create(program=instance, **schedule_item)
        
        # Update speakers if provided
        if speakers_data is not None:
            instance.speakers.all().delete()
            for speaker_data in speakers_data:
                Speaker.objects.create(program=instance, **speaker_data)
        
        return instance
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Convert snake_case to camelCase for frontend
        camel_case_data = {
            'id': data['id'],
            'title': data['title'],
            'description': data['description'],
            'type': data['type'],
            'category': data['category'],
            'status': data['status'],
            'isFeatured': data['is_featured'],
            'duration': data['duration'],
            'format': data['format'],
            'location': data['location'],
            'timezone': data['timezone'],
            'language': data['language'],
            'maxParticipants': data['max_participants'],
            'currentEnrollments': data['current_enrollments'],
            'instructor': data['instructor'],
            'startDate': data['start_date'],
            'endDate': data['end_date'],
            'registrationDeadline': data['registration_deadline'],
            'price': data['price'],
            'currency': data['currency'],
            'imageUrl': data.get('image_url_display', ''),
            'prerequisites': data.get('prerequisites', []),
            'learningOutcomes': data.get('learning_outcomes', []),
            'topics': data.get('topics', []),
            'targetAudience': data.get('target_audience', []),
            'materials': data.get('materials', []),
            'certificationType': data['certificate_type'],
            'cmeCredits': data['cme_credits'],
            'assessmentMethod': data['assessment_method'],
            'passingScore': data['passing_score'],
            'schedule': data.get('schedule', []),
            'speakers': data.get('speakers', []),
            'createdAt': data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at']),
            'updatedAt': data['updated_at'].split('T')[0] if 'T' in str(data['updated_at']) else str(data['updated_at']),
        }
        
        return camel_case_data


class RegistrationSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source='program.title', read_only=True)
    
    class Meta:
        model = Registration
        fields = [
            'id', 'program', 'program_title', 'participant_name', 'participant_email',
            'participant_phone', 'organization', 'profession', 'experience',
            'status', 'payment_status', 'special_requests', 'registration_date'
        ]
        read_only_fields = ['id', 'program_title', 'registration_date']
    
    def validate_participant_name(self, value):
        """Validate participant name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Participant name is required")
        return value.strip()
    
    def validate_participant_email(self, value):
        """Validate participant email format and uniqueness per program"""
        if not value or not value.strip():
            raise serializers.ValidationError("Participant email is required")
        
        # Check for duplicate registration in the same program
        program_id = None
        if self.instance:
            program_id = self.instance.program_id
        elif 'program' in self.initial_data:
            program_id = self.initial_data['program']
        
        if program_id:
            existing = Registration.objects.filter(
                program_id=program_id,
                participant_email=value.lower().strip()
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            if existing.exists():
                raise serializers.ValidationError("This email is already registered for this program")
        
        return value.lower().strip()
    
    def validate_organization(self, value):
        """Validate organization is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Organization is required")
        return value.strip()
    
    def validate_profession(self, value):
        """Validate profession is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Profession is required")
        return value.strip()
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Convert snake_case to camelCase for frontend
        camel_case_data = {
            'id': data['id'],
            'programId': data['program'],
            'programTitle': data['program_title'],
            'participantName': data['participant_name'],
            'participantEmail': data['participant_email'],
            'participantPhone': data['participant_phone'],
            'organization': data['organization'],
            'profession': data['profession'],
            'experience': data['experience'],
            'status': data['status'],
            'paymentStatus': data['payment_status'],
            'specialRequests': data['special_requests'],
            'registrationDate': data['registration_date'].split('T')[0] if 'T' in str(data['registration_date']) else str(data['registration_date']),
        }
        
        return camel_case_data


class TrainingProgramAnalyticsSerializer(serializers.Serializer):
    """Serializer for training program analytics data"""
    total_programs = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_fill_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    programs_by_status = serializers.DictField(child=serializers.IntegerField())
    programs_by_type = serializers.DictField(child=serializers.IntegerField())
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    upcoming_programs = serializers.IntegerField()
    top_programs = serializers.ListField(child=serializers.DictField(), required=False)
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'totalPrograms': data.get('total_programs', 0),
            'totalEnrollments': data.get('total_enrollments', 0),
            'totalRevenue': float(data.get('total_revenue', 0)),
            'averageFillRate': float(data.get('average_fill_rate', 0)),
            'programsByStatus': data.get('programs_by_status', {}),
            'programsByType': data.get('programs_by_type', {}),
            'monthlyRevenue': float(data.get('monthly_revenue', 0)),
            'upcomingPrograms': data.get('upcoming_programs', 0),
            'topPrograms': data.get('top_programs', []),
        }