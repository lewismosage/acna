from rest_framework import serializers
from .models import AwardCategory, AwardWinner, Nominee, AwardNomination
from django.utils.text import slugify

class AwardCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardCategory
        fields = ['id', 'title', 'description', 'criteria', 'active', 'order']

class AwardWinnerSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    categoryTitle = serializers.CharField(source='category.title', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    
    class Meta:
        model = AwardWinner
        fields = [
            'id', 'name', 'title', 'location', 'achievement', 
            'category', 'categoryTitle', 'year', 'status',
            'imageUrl', 'createdAt', 'updatedAt'
        ]
    
    def get_imageUrl(self, obj):
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url and not image_url.startswith('http'):
            return request.build_absolute_uri(image_url)
        return image_url

class NomineeSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    categoryTitle = serializers.CharField(source='category.title', read_only=True)
    suggestedDate = serializers.DateTimeField(source='suggested_date')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    source = serializers.CharField()
    
    class Meta:
        model = Nominee
        fields = [
            'id', 'name', 'institution', 'specialty', 'category', 'categoryTitle',
            'achievement', 'email', 'phone', 'location', 'imageUrl', 'status',
            'suggested_by', 'suggestedDate', 'createdAt', 'updatedAt', 'source'
        ]
    
    def get_imageUrl(self, obj):
        image_url = obj.image_url_display
        request = self.context.get('request')
        if request and image_url and not image_url.startswith('http'):
            return request.build_absolute_uri(image_url)
        return image_url

class AwardNominationSerializer(serializers.ModelSerializer):
    awardCategoryTitle = serializers.CharField(source='award_category.title', read_only=True)
    submissionDate = serializers.DateTimeField(source='submission_date')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    source = serializers.CharField()
    
    class Meta:
        model = AwardNomination
        fields = [
            'id', 'nominee_name', 'nominee_email', 'nominee_institution', 
            'nominee_location', 'nominee_specialty', 'award_category', 
            'awardCategoryTitle', 'nominator_name', 'nominator_email', 
            'nominator_relationship', 'achievement_summary', 'additional_info',
            'supporting_documents', 'status', 'submissionDate', 'createdAt', 
            'updatedAt', 'source'
        ]

class CreateAwardWinnerSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = AwardWinner
        fields = [
            'name', 'title', 'location', 'achievement', 'category', 
            'year', 'status', 'imageUrl'
        ]
    
    def validate_imageUrl(self, value):
        if value:
            value = value.strip()
            if value and not (value.startswith('http://') or value.startswith('https://') or value.startswith('/')):
                if not value.startswith('/'):
                    value = '/' + value
        return value
    
    def create(self, validated_data):
        image_url = validated_data.pop('imageUrl', '')
        if image_url:
            validated_data['image_url'] = image_url
        
        return AwardWinner.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        if 'imageUrl' in validated_data:
            image_url = validated_data.pop('imageUrl', '')
            if image_url:
                instance.image_url = image_url
            else:
                instance.image_url = ''
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class CreateNomineeSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Nominee
        fields = [
            'name', 'institution', 'specialty', 'category', 'achievement',
            'email', 'phone', 'location', 'imageUrl', 'status', 'suggested_by'
        ]
    
    def validate_imageUrl(self, value):
        if value:
            value = value.strip()
            if value and not (value.startswith('http://') or value.startswith('https://') or value.startswith('/')):
                if not value.startswith('/'):
                    value = '/' + value
        return value
    
    def create(self, validated_data):
        image_url = validated_data.pop('imageUrl', '')
        if image_url:
            validated_data['image_url'] = image_url
        
        return Nominee.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        if 'imageUrl' in validated_data:
            image_url = validated_data.pop('imageUrl', '')
            if image_url:
                instance.image_url = image_url
            else:
                instance.image_url = ''
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class CreateAwardNominationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardNomination
        fields = [
            'nominee_name', 'nominee_email', 'nominee_institution', 
            'nominee_location', 'nominee_specialty', 'award_category', 
            'nominator_name', 'nominator_email', 'nominator_relationship', 
            'achievement_summary', 'additional_info', 'supporting_documents'
        ]
    
    def validate(self, data):
        # Check if this email has already voted in this category
        award_category = data.get('award_category')
        nominator_email = data.get('nominator_email')
        
        if award_category and nominator_email:
            # Check if this email has already nominated someone in this category
            if AwardNomination.objects.filter(
                award_category=award_category, 
                nominator_email=nominator_email
            ).exists():
                raise serializers.ValidationError({
                    'nominator_email': 'You have already submitted a nomination for this award category. Each email can only vote once per category.'
                })
        
        # Ensure required fields are present
        required_fields = [
            'nominee_name', 'nominee_institution', 'award_category',
            'nominator_name', 'nominator_email', 'achievement_summary'
        ]
        
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f'{field.replace("_", " ").title()} is required.'
                })
        
        return data
    
    def create(self, validated_data):
        return AwardNomination.objects.create(**validated_data)