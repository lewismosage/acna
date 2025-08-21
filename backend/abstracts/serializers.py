# serializers.py
from rest_framework import serializers
from .models import Abstract, Author

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