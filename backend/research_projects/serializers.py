from rest_framework import serializers
from .models import (
    ResearchProject, ResearchProjectView, ResearchProjectUpdate,
    ResearchPaper, ResearchPaperFile, ResearchPaperReview, ResearchPaperComment
)
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


class AuthorSerializer(serializers.Serializer):
    """Serializer for author objects within ResearchPaper"""
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    affiliation = serializers.CharField(max_length=200)
    isCorresponding = serializers.BooleanField(default=False)


class ResearchPaperFileSerializer(serializers.ModelSerializer):
    """Serializer for supplementary files"""
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ResearchPaperFile
        fields = ['id', 'file', 'file_url', 'file_type', 'description', 'uploaded_at', 'file_size']
        read_only_fields = ['id', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None


class ResearchPaperSerializer(serializers.ModelSerializer):
    # Computed fields
    manuscript_url = serializers.SerializerMethodField()
    corresponding_author = serializers.ReadOnlyField()
    author_count = serializers.ReadOnlyField()
    is_under_review = serializers.ReadOnlyField()
    supplementary_files = ResearchPaperFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = ResearchPaper
        fields = [
            'id', 'title', 'abstract', 'keywords', 'research_type', 'category', 
            'study_design', 'participants', 'ethics_approval', 'ethics_number',
            'funding_source', 'conflict_of_interest', 'acknowledgments', 
            'target_journal', 'status', 'manuscript_file', 'manuscript_url',
            'authors', 'research_project', 'submission_date', 'last_modified',
            'review_deadline', 'corresponding_author', 'author_count', 
            'is_under_review', 'supplementary_files'
        ]
        read_only_fields = [
            'id', 'submission_date', 'last_modified', 'corresponding_author', 
            'author_count', 'is_under_review', 'supplementary_files'
        ]
    
    def get_manuscript_url(self, obj):
        if obj.manuscript_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.manuscript_file.url)
            return obj.manuscript_file.url
        return None
    
    def validate_authors(self, value):
        """Ensure authors is a list of author objects"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for authors")
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Authors must be a list")
        
        if len(value) == 0:
            raise serializers.ValidationError("At least one author is required")
        
        corresponding_authors = 0
        
        # Validate each author object
        for i, author in enumerate(value):
            if not isinstance(author, dict):
                raise serializers.ValidationError(f"Author {i+1} must be an object")
            
            required_fields = ['name', 'email', 'affiliation']
            for field in required_fields:
                if not author.get(field, '').strip():
                    raise serializers.ValidationError(f"Author {i+1}: {field} is required")
            
            # Validate email format
            try:
                serializers.EmailField().to_internal_value(author['email'])
            except serializers.ValidationError:
                raise serializers.ValidationError(f"Author {i+1}: Invalid email format")
            
            # Count corresponding authors
            if author.get('isCorresponding', False):
                corresponding_authors += 1
        
        # Ensure at least one corresponding author
        if corresponding_authors == 0:
            raise serializers.ValidationError("At least one corresponding author is required")
        
        return value
    
    def validate_keywords(self, value):
        """Ensure keywords is a list of strings"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Keywords must be a list")
        
        if len(value) < 3:
            raise serializers.ValidationError("At least 3 keywords are required")
        
        return [str(keyword).strip() for keyword in value if str(keyword).strip()]
    
    def validate_manuscript_file(self, value):
        """Validate manuscript file"""
        if not value:
            raise serializers.ValidationError("Manuscript file is required")
        
        # Check file size (limit to 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Manuscript file size must be less than 10MB")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_extension = value.name.lower().split('.')[-1] if '.' in value.name else ''
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError("Only PDF, DOC, and DOCX files are allowed")
        
        return value
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Format dates for frontend consistency
        if data.get('submission_date'):
            data['submissionDate'] = data['submission_date'].split('T')[0] if 'T' in str(data['submission_date']) else str(data['submission_date'])
        if data.get('last_modified'):
            data['lastModified'] = data['last_modified'].split('T')[0] if 'T' in str(data['last_modified']) else str(data['last_modified'])
        if data.get('review_deadline'):
            data['reviewDeadline'] = data['review_deadline']
        
        # Rename fields for frontend compatibility
        data['researchType'] = data.get('research_type', '')
        data['studyDesign'] = data.get('study_design', '')
        data['ethicsApproval'] = data.get('ethics_approval', False)
        data['ethicsNumber'] = data.get('ethics_number', '')
        data['fundingSource'] = data.get('funding_source', '')
        data['conflictOfInterest'] = data.get('conflict_of_interest', '')
        data['targetJournal'] = data.get('target_journal', '')
        data['manuscriptFile'] = data.get('manuscript_file', '')
        data['manuscriptUrl'] = data.get('manuscript_url', '')
        data['researchProject'] = data.get('research_project')
        data['correspondingAuthor'] = data.get('corresponding_author')
        data['authorCount'] = data.get('author_count', 0)
        data['isUnderReview'] = data.get('is_under_review', False)
        data['supplementaryFiles'] = data.get('supplementary_files', [])
        
        return data


class ResearchPaperReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchPaperReview
        fields = [
            'id', 'research_paper', 'reviewer_name', 'reviewer_email', 
            'review_status', 'recommendation', 'comments', 'assigned_at', 'completed_at'
        ]
        read_only_fields = ['id', 'assigned_at']
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Format dates for frontend consistency
        if data.get('assigned_at'):
            data['assignedAt'] = data['assigned_at'].split('T')[0] if 'T' in str(data['assigned_at']) else str(data['assigned_at'])
        if data.get('completed_at'):
            data['completedAt'] = data['completed_at'].split('T')[0] if 'T' in str(data['completed_at']) else str(data['completed_at'])
        
        # Rename fields for frontend compatibility
        data['researchPaper'] = data.get('research_paper')
        data['reviewerName'] = data.get('reviewer_name', '')
        data['reviewerEmail'] = data.get('reviewer_email', '')
        data['reviewStatus'] = data.get('review_status', 'Pending')
        
        return data


class ResearchPaperCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchPaperComment
        fields = [
            'id', 'research_paper', 'commenter_name', 'commenter_email', 
            'comment', 'is_internal', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def to_representation(self, instance):
        """Customize the output representation for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Format dates for frontend consistency
        if data.get('created_at'):
            data['createdAt'] = data['created_at'].split('T')[0] if 'T' in str(data['created_at']) else str(data['created_at'])
        
        # Rename fields for frontend compatibility
        data['researchPaper'] = data.get('research_paper')
        data['commenterName'] = data.get('commenter_name', '')
        data['commenterEmail'] = data.get('commenter_email', '')
        data['isInternal'] = data.get('is_internal', False)
        
        return data


class ResearchPaperAnalyticsSerializer(serializers.Serializer):
    """Serializer for research paper analytics data"""
    total_papers = serializers.IntegerField()
    submitted = serializers.IntegerField()
    under_review = serializers.IntegerField()
    revision_required = serializers.IntegerField()
    accepted = serializers.IntegerField()
    published = serializers.IntegerField()
    rejected = serializers.IntegerField()
    papers_by_category = serializers.DictField(child=serializers.IntegerField())
    papers_by_research_type = serializers.DictField(child=serializers.IntegerField())
    papers_by_status = serializers.DictField(child=serializers.IntegerField())
    total_authors = serializers.IntegerField()
    papers_with_ethics_approval = serializers.IntegerField()
    avg_review_time_days = serializers.FloatField(allow_null=True)
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'totalPapers': data.get('total_papers', 0),
            'submitted': data.get('submitted', 0),
            'underReview': data.get('under_review', 0),
            'revisionRequired': data.get('revision_required', 0),
            'accepted': data.get('accepted', 0),
            'published': data.get('published', 0),
            'rejected': data.get('rejected', 0),
            'papersByCategory': data.get('papers_by_category', {}),
            'papersByResearchType': data.get('papers_by_research_type', {}),
            'papersByStatus': data.get('papers_by_status', {}),
            'totalAuthors': data.get('total_authors', 0),
            'papersWithEthicsApproval': data.get('papers_with_ethics_approval', 0),
            'avgReviewTimeDays': data.get('avg_review_time_days'),
        }