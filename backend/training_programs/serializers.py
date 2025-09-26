# serializers.py - Improved version

from rest_framework import serializers
from .models import TrainingProgram, Registration, ScheduleItem, Speaker, TrainingProgramPayment
import json
import logging

logger = logging.getLogger(__name__)


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
        return obj.image_url or ''
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Title is required and cannot be empty")
        return str(value).strip()
    
    def validate_category(self, value):
        """Validate category is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Category is required and cannot be empty")
        return str(value).strip()
    
    def validate_description(self, value):
        """Validate description is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Description is required and cannot be empty")
        return str(value).strip()
    
    def validate_instructor(self, value):
        """Validate instructor is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Instructor is required and cannot be empty")
        return str(value).strip()
    
    def validate_duration(self, value):
        """Validate duration is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Duration is required and cannot be empty")
        return str(value).strip()
    
    def validate_max_participants(self, value):
        """Validate max participants is positive"""
        if value is None or value == '':
            return 1  # Default minimum
        
        try:
            int_value = int(float(str(value)))  # Handle string numbers and decimals
            if int_value <= 0:
                raise serializers.ValidationError("Maximum participants must be greater than 0")
            return int_value
        except (ValueError, TypeError):
            raise serializers.ValidationError("Maximum participants must be a valid number")
    
    def validate_price(self, value):
        """Validate price is not negative"""
        if value is None or value == '':
            return 0.0  # Default to free
        
        try:
            float_value = float(value)
            if float_value < 0:
                raise serializers.ValidationError("Price cannot be negative")
            return float_value
        except (ValueError, TypeError):
            raise serializers.ValidationError("Price must be a valid number")
    
    def validate_cme_credits(self, value):
        """Validate CME credits"""
        if value is None or value == '':
            return 0  # Default to no credits
        
        try:
            int_value = int(float(str(value)))
            if int_value < 0:
                raise serializers.ValidationError("CME credits cannot be negative")
            return int_value
        except (ValueError, TypeError):
            raise serializers.ValidationError("CME credits must be a valid number")
    
    def validate_passing_score(self, value):
        """Validate passing score"""
        if value is None or value == '':
            return None  # Optional field
        
        try:
            int_value = int(float(str(value)))
            if int_value < 0 or int_value > 100:
                raise serializers.ValidationError("Passing score must be between 0 and 100")
            return int_value
        except (ValueError, TypeError):
            raise serializers.ValidationError("Passing score must be a valid number")
    
    def validate_start_date(self, value):
        """Validate start date is provided"""
        if not value:
            raise serializers.ValidationError("Start date is required")
        return value
    
    def validate_end_date(self, value):
        """Validate end date is provided"""
        if not value:
            raise serializers.ValidationError("End date is required")
        return value
    
    def validate_registration_deadline(self, value):
        """Validate registration deadline is provided"""
        if not value:
            raise serializers.ValidationError("Registration deadline is required")
        return value
    
    def validate_image_url(self, value):
        """Validate image URL - allow empty values but validate format if provided"""
        if not value or not str(value).strip():
            return ""  # Allow empty image URLs
        
        url_str = str(value).strip()
        if not (url_str.startswith('http://') or url_str.startswith('https://') or url_str == ''):
            raise serializers.ValidationError("Please enter a valid URL starting with http:// or https://")
        
        return url_str
    
    def validate(self, data):
        """Cross-field validation with better error handling"""
        logger.info(f"Validating data with keys: {list(data.keys())}")
        
        # Check for required fields
        required_fields = ['title', 'description', 'category', 'instructor', 
                         'start_date', 'end_date', 'registration_deadline']
        
        missing_fields = []
        for field in required_fields:
            if field not in data or not data[field]:
                missing_fields.append(field)
        
        if missing_fields:
            raise serializers.ValidationError({
                field: f"{field.replace('_', ' ').title()} is required"
                for field in missing_fields
            })
            
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        registration_deadline = data.get('registration_deadline')
        
        # Validate date relationships
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date'
            })
        
        if registration_deadline and start_date and registration_deadline > start_date:
            raise serializers.ValidationError({
                'registration_deadline': 'Registration deadline cannot be after start date'
            })
        
        # Ensure numeric fields have valid values
        if 'max_participants' not in data or data['max_participants'] is None:
            data['max_participants'] = 1
        if 'price' not in data or data['price'] is None:
            data['price'] = 0.0
        if 'cme_credits' not in data or data['cme_credits'] is None:
            data['cme_credits'] = 0
        
        # Ensure boolean fields have values
        if 'is_featured' not in data:
            data['is_featured'] = False
        
        # Ensure array fields exist and are lists
        array_fields = ['prerequisites', 'learning_outcomes', 'topics', 'target_audience', 'materials']
        for field in array_fields:
            if field not in data:
                data[field] = []
        
        logger.info(f"Validation completed successfully")
        return data
    
    def validate_prerequisites(self, value):
        """Ensure prerequisites is a list of non-empty strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            return []
        
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
            return []
        
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
            return []
        
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
            return []
        
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
            return []
        
        validated_materials = [str(material).strip() for material in value if str(material).strip()]
        return validated_materials
    
    def validate_schedule(self, value):
        """Validate schedule data"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                return []
        
        if not isinstance(value, list):
            return []
        
        # Filter out empty schedule items
        validated_schedule = []
        for item in value:
            if isinstance(item, dict) and item.get('activity', '').strip():
                validated_schedule.append({
                    'day': str(item.get('day', '')).strip(),
                    'time': str(item.get('time', '')).strip(),
                    'activity': str(item.get('activity', '')).strip(),
                    'speaker': str(item.get('speaker', '')).strip(),
                })
        
        return validated_schedule
    
    def validate_speakers(self, value):
        """Validate speakers data"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                return []
        
        if not isinstance(value, list):
            return []
        
        # Filter out empty speaker entries
        validated_speakers = []
        for speaker in value:
            if isinstance(speaker, dict) and speaker.get('name', '').strip():
                validated_speakers.append({
                    'name': str(speaker.get('name', '')).strip(),
                    'title': str(speaker.get('title', '')).strip(),
                    'organization': str(speaker.get('organization', '')).strip(),
                    'bio': str(speaker.get('bio', '')).strip(),
                })
        
        return validated_speakers
    
    def create(self, validated_data):
        """Create a new training program with related objects"""
        schedule_data = validated_data.pop('schedule', [])
        speakers_data = validated_data.pop('speakers', [])
        
        logger.info(f"Creating program with validated data keys: {list(validated_data.keys())}")
        
        # Create the program
        program = TrainingProgram.objects.create(**validated_data)
        logger.info(f"Program created with ID: {program.id}")
        
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
        
        logger.info(f"Updating program {instance.id} with data keys: {list(validated_data.keys())}")
        
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
    
    def validate(self, data):
        """Add comprehensive validation with detailed error messages"""
        logger.info(f"Registration validation - data keys: {list(data.keys())}")
        logger.info(f"Registration validation - data values: {data}")
        
        # Check for required fields
        required_fields = ['participant_name', 'participant_email', 'organization', 'profession', 'experience']
        missing_fields = []
        
        for field in required_fields:
            if field not in data or not data[field] or str(data[field]).strip() == '':
                missing_fields.append(field)
        
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            raise serializers.ValidationError({
                field: f"{field.replace('_', ' ').title()} is required"
                for field in missing_fields
            })
        
        logger.info("Registration validation passed")
        return data
    
    def validate_participant_name(self, value):
        """Validate participant name is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Participant name is required")
        return str(value).strip()
    
    def validate_participant_email(self, value):
        """Validate participant email format and uniqueness per program"""
        if not value or not str(value).strip():
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
                raise serializers.ValidationError("This email is already registered for this training program")
        
        return str(value).lower().strip()
    
    def validate_organization(self, value):
        """Validate organization is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Organization is required")
        return str(value).strip()
    
    def validate_profession(self, value):
        """Validate profession is not empty"""
        if not value or not str(value).strip():
            raise serializers.ValidationError("Profession is required")
        return str(value).strip()
    
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


class TrainingProgramPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingProgramPayment
        fields = [
            'id', 'program', 'registration', 'amount', 'currency',
            'stripe_checkout_session_id', 'status', 'payment_type',
            'registration_type', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']