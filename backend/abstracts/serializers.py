# serializers.py
from rest_framework import serializers
from .models import Abstract, Author, ImportantDates

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = [
            'id', 'first_name', 'last_name', 'email', 'institution', 'country',
            'is_presenter', 'is_corresponding', 'order'
        ]

class AbstractSerializer(serializers.ModelSerializer):
    authors = serializers.SerializerMethodField()  # Change to SerializerMethodField
    abstractFileUrl = serializers.SerializerMethodField()
    ethicalApprovalUrl = serializers.SerializerMethodField()
    supplementaryFilesUrl = serializers.SerializerMethodField()
    submittedDate = serializers.DateTimeField(source='submitted_date')
    lastUpdated = serializers.DateTimeField(source='updated_at')
    createdAt = serializers.DateTimeField(source='created_at')
    updatedAt = serializers.DateTimeField(source='updated_at')
    presentationPreference = serializers.CharField(source='presentation_preference')
    conflictOfInterest = serializers.CharField(source='conflict_of_interest')
    reviewerComments = serializers.CharField(source='reviewer_comments')
    assignedReviewer = serializers.CharField(source='assigned_reviewer')
    isFeatured = serializers.BooleanField(source='is_featured')

    class Meta:
        model = Abstract
        fields = [
            'id', 'title', 'authors', 'category', 'presentationPreference',
            'keywords', 'background', 'methods', 'results', 'conclusions',
            'conflictOfInterest', 'status', 'submittedDate', 'lastUpdated',
            'abstractFileUrl', 'ethicalApprovalUrl', 'supplementaryFilesUrl',
            'reviewerComments', 'assignedReviewer', 'isFeatured',
            'createdAt', 'updatedAt'
        ]

    def get_authors(self, obj):
        # Explicitly fetch and serialize the authors
        authors = obj.authors.all().order_by('order', 'last_name', 'first_name')
        return AuthorSerializer(authors, many=True).data

    def get_abstractFileUrl(self, obj):
        abstract_url = obj.abstract_file_url
        request = self.context.get('request')
        if request and abstract_url and not abstract_url.startswith('http'):
            return request.build_absolute_uri(abstract_url)
        return abstract_url

    def get_ethicalApprovalUrl(self, obj):
        ethical_url = obj.ethical_approval_url
        request = self.context.get('request')
        if request and ethical_url and not ethical_url.startswith('http'):
            return request.build_absolute_uri(ethical_url)
        return ethical_url

    def get_supplementaryFilesUrl(self, obj):
        supplementary_url = obj.supplementary_files_url
        request = self.context.get('request')
        if request and supplementary_url and not supplementary_url.startswith('http'):
            return request.build_absolute_uri(supplementary_url)
        return supplementary_url

class CreateAbstractSerializer(serializers.ModelSerializer):
    authors = serializers.JSONField()
    keywords = serializers.JSONField()

    class Meta:
        model = Abstract
        fields = [
            'title', 'category', 'presentation_preference', 'keywords',
            'background', 'methods', 'results', 'conclusions', 'conflict_of_interest',
            'abstract_file', 'ethical_approval_file', 'supplementary_files', 'authors'
        ]

    def create(self, validated_data):
        authors_data = validated_data.pop('authors', [])
        abstract = Abstract.objects.create(**validated_data)
        
        # Create authors
        for author_data in authors_data:
            Author.objects.create(abstract=abstract, **author_data)
        
        return abstract

class UpdateAbstractSerializer(serializers.ModelSerializer):
    authors = serializers.JSONField(required=False)
    keywords = serializers.JSONField(required=False)

    class Meta:
        model = Abstract
        fields = [
            'title', 'category', 'presentation_preference', 'keywords',
            'background', 'methods', 'results', 'conclusions', 'conflict_of_interest',
            'status', 'reviewer_comments', 'assigned_reviewer', 'is_featured',
            'abstract_file', 'ethical_approval_file', 'supplementary_files', 'authors'
        ]

    def update(self, instance, validated_data):
        authors_data = validated_data.pop('authors', None)

        # Update abstract fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Update authors if provided
        if authors_data is not None:
            # Delete existing authors
            instance.authors.all().delete()

            # Create new authors
            for author_data in authors_data:
                Author.objects.create(abstract=instance, **author_data)

        return instance
    
    def to_representation(self, instance):
        # Use the main AbstractSerializer for the response
        return AbstractSerializer(instance, context=self.context).data
    
class ImportantDatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantDates
        fields = [
            'id', 'year', 'abstract_submission_opens', 'abstract_submission_deadline',
            'abstract_review_completion', 'acceptance_notifications', 
            'final_abstract_submission', 'conference_presentation',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ImportantDatesFormattedSerializer(serializers.ModelSerializer):
    """Serializer that returns formatted dates with proper structure"""
    
    abstractSubmissionOpens = serializers.SerializerMethodField()
    abstractSubmissionDeadline = serializers.SerializerMethodField()
    abstractReviewCompletion = serializers.SerializerMethodField()
    acceptanceNotifications = serializers.SerializerMethodField()
    finalAbstractSubmission = serializers.SerializerMethodField()
    conferencePresentation = serializers.SerializerMethodField()
    
    class Meta:
        model = ImportantDates
        fields = [
            'id', 'year', 'abstractSubmissionOpens', 'abstractSubmissionDeadline',
            'abstractReviewCompletion', 'acceptanceNotifications',
            'finalAbstractSubmission', 'conferencePresentation', 'is_active'
        ]
    
    def _format_date_with_year(self, date_str, year):
        """Helper method to format date with year"""
        if str(year) not in date_str:
            if '-' in date_str and not date_str.endswith(str(year)):
                return f"{date_str}, {year}"
            elif not date_str.endswith(str(year)):
                return f"{date_str}, {year}"
        return date_str
    
    def get_abstractSubmissionOpens(self, obj):
        return self._format_date_with_year(obj.abstract_submission_opens, obj.year)
    
    def get_abstractSubmissionDeadline(self, obj):
        return self._format_date_with_year(obj.abstract_submission_deadline, obj.year)
    
    def get_abstractReviewCompletion(self, obj):
        return self._format_date_with_year(obj.abstract_review_completion, obj.year)
    
    def get_acceptanceNotifications(self, obj):
        return self._format_date_with_year(obj.acceptance_notifications, obj.year)
    
    def get_finalAbstractSubmission(self, obj):
        return self._format_date_with_year(obj.final_abstract_submission, obj.year)
    
    def get_conferencePresentation(self, obj):
        return self._format_date_with_year(obj.conference_presentation, obj.year)

class CreateUpdateImportantDatesSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating important dates"""
    
    class Meta:
        model = ImportantDates
        fields = [
            'year', 'abstract_submission_opens', 'abstract_submission_deadline',
            'abstract_review_completion', 'acceptance_notifications',
            'final_abstract_submission', 'conference_presentation',
            'is_active'
        ]
    
    def create(self, validated_data):
        # Set created_by if user is available in context
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Update created_by field when updating
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        
        return super().update(instance, validated_data)
    
    def to_representation(self, instance):
        # Use the formatted serializer for response
        return ImportantDatesFormattedSerializer(instance, context=self.context).data