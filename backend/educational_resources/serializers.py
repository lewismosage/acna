from rest_framework import serializers
from .models import EducationalResource, CaseStudySubmission, ResourceView, ResourceDownload
import json
from django.core.files.storage import default_storage
from django.utils import timezone
import os
import uuid
from django.core.files.base import ContentFile
from django.conf import settings


class EducationalResourceSerializer(serializers.ModelSerializer):
    # Computed fields for frontend compatibility
    image_url_display = serializers.SerializerMethodField()
    file_url_display = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalResource
        fields = [
            'id', 'title', 'description', 'full_description', 'category', 
            'resource_type', 'condition', 'status', 'is_featured', 'is_free',
            'image', 'image_url', 'image_url_display', 'file', 'file_url', 
            'file_url_display', 'video_url', 'external_url', 'languages', 
            'tags', 'target_audience', 'related_conditions', 'learning_objectives',
            'prerequisites', 'references', 'age_group', 'difficulty', 'duration',
            'file_size', 'file_format', 'author', 'reviewed_by', 'institution',
            'location', 'impact_statement', 'accreditation', 'download_count',
            'view_count', 'rating', 'publication_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'download_count', 'view_count', 'created_at', 'updated_at']
    
    def get_image_url_display(self, obj):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url
    
    def get_file_url_display(self, obj):
        """Get the file URL, prioritizing uploaded file over URL field"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return obj.file_url
    
    def validate_languages(self, value):
        """Ensure languages is a list of non-empty strings"""
        return self._validate_json_array(value, "Languages")
    
    def validate_tags(self, value):
        return self._validate_json_array(value, "Tags")
    
    def validate_target_audience(self, value):
        return self._validate_json_array(value, "Target audience")
    
    def validate_related_conditions(self, value):
        return self._validate_json_array(value, "Related conditions")
    
    def validate_learning_objectives(self, value):
        return self._validate_json_array(value, "Learning objectives")
    
    def validate_prerequisites(self, value):
        return self._validate_json_array(value, "Prerequisites")
    
    def validate_references(self, value):
        return self._validate_json_array(value, "References")
    
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
    
    def create(self, validated_data):
        """Create a new resource with proper file handling"""
        image_file = validated_data.pop('image', None)
        resource_file = validated_data.pop('file', None)
        
        resource = EducationalResource.objects.create(**validated_data)
        
        if image_file:
            resource.image = image_file
        if resource_file:
            resource.file = resource_file
        
        if image_file or resource_file:
            resource.save()
            
        return resource
    
    def update(self, instance, validated_data):
        """Update a resource with proper file handling"""
        image_file = validated_data.pop('image', None)
        resource_file = validated_data.pop('file', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if image_file:
            if instance.image:
                try:
                    instance.image.delete(save=False)
                except:
                    pass
            instance.image = image_file
            
        if resource_file:
            if instance.file:
                try:
                    instance.file.delete(save=False)
                except:
                    pass
            instance.file = resource_file
            
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        
        camel_case_mapping = {
            'resource_type': 'type',
            'full_description': 'fullDescription',
            'is_featured': 'isFeatured',
            'is_free': 'isFree',
            'image_url_display': 'imageUrl',
            'file_url_display': 'fileUrl',
            'video_url': 'videoUrl',
            'external_url': 'externalUrl',
            'target_audience': 'targetAudience',
            'related_conditions': 'relatedConditions',
            'learning_objectives': 'learningObjectives',
            'age_group': 'ageGroup',
            'file_size': 'fileSize',
            'file_format': 'fileFormat',
            'reviewed_by': 'reviewedBy',
            'impact_statement': 'impactStatement',
            'download_count': 'downloadCount',
            'view_count': 'viewCount',
            'publication_date': 'publicationDate',
            'created_at': 'createdAt',
            'updated_at': 'updatedAt',
        }
        
        result = {}
        for key, value in data.items():
            if key in camel_case_mapping:
                result[camel_case_mapping[key]] = value
            else:
                result[key] = value
        
        return result


class CaseStudySubmissionSerializer(serializers.ModelSerializer):
    attachment_urls = serializers.SerializerMethodField()
    image_url_display = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseStudySubmission
        fields = [
            'id', 'title', 'submitted_by', 'institution', 'email', 'phone',
            'location', 'category', 'excerpt', 'full_content', 'impact',
            'status', 'review_notes', 'reviewed_by', 'attachments', 'attachment_urls',
            'image_url', 'image_url_display', 'submission_date', 'review_date', 
            'published_date'
        ]
        read_only_fields = ['id', 'submission_date', 'review_date', 'published_date', 
                          'attachments', 'image_url', 'attachment_urls', 'image_url_display']

    def _build_file_url(self, file_path):
        """Build proper file URL from path with improved error handling"""
        if not file_path:
            return None
            
        # If it's already a full URL, return it
        if file_path.startswith('http'):
            return file_path
        
        # Clean the file path
        clean_path = file_path.strip()
        if not clean_path:
            return None
            
        # Handle different path formats
        if clean_path.startswith('/media/'):
            # Remove /media/ prefix as Django's url() will add it
            clean_path = clean_path[7:]
        elif clean_path.startswith('media/'):
            # Remove media/ prefix
            clean_path = clean_path[6:]
        
        # Ensure proper case_submissions directory structure
        if not clean_path.startswith('case_submissions/'):
            # If it's just a filename, assume it's in attachments folder
            if '/' not in clean_path:
                clean_path = f"case_submissions/attachments/{clean_path}"
            else:
                clean_path = f"case_submissions/{clean_path}"
        
        try:
            # Check if file exists in storage
            if default_storage.exists(clean_path):
                url = default_storage.url(clean_path)
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                return url
            else:
                # File doesn't exist - log warning but don't break the response
                print(f"Warning: File not found in storage: {clean_path}")
                # Try to construct URL anyway - Django will handle 404s
                url = default_storage.url(clean_path)
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                return url
        except Exception as e:
            print(f"Error building file URL for {clean_path}: {str(e)}")
            return None

    def get_attachment_urls(self, obj):
        """Get full URLs for all attachments"""
        if not obj.attachments:
            return []
        
        urls = []
        for attachment_path in obj.attachments:
            url = self._build_file_url(attachment_path)
            if url:
                urls.append(url)
        return urls

    def get_image_url_display(self, obj):
        """Get the image URL with proper absolute URL"""
        if obj.image_url:
            return self._build_file_url(obj.image_url)
        return None

    def validate_attachments(self, value):
        """Ensure attachments is a valid list"""
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [value] if value.strip() else []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Attachments must be a list")
        
        return [str(attachment).strip() for attachment in value if str(attachment).strip()]

    def create(self, validated_data):
        """Handle creation with file uploads - manually process files from request"""
        request = self.context.get('request')
        
        # Create the submission first
        submission = CaseStudySubmission.objects.create(**validated_data)
        
        # Handle attachments from request.FILES
        if request and hasattr(request, 'FILES'):
            attachment_paths = []
            image_paths = []
            
            # Process all files in request.FILES
            for field_name in request.FILES.keys():
                files = request.FILES.getlist(field_name)
                print(f"Processing field '{field_name}' with {len(files)} files")
                
                for file in files:
                    try:
                        # Generate unique filename while preserving extension
                        name, ext = os.path.splitext(file.name)
                        # Clean the original filename
                        clean_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()
                        clean_name = clean_name[:50]  # Limit length
                        unique_filename = f"{clean_name}_{uuid.uuid4().hex[:8]}{ext}"
                        
                        # Determine file category and save path
                        if field_name in ['attachments'] or field_name.startswith('attachments'):
                            file_path = f"case_submissions/attachments/{unique_filename}"
                            saved_path = default_storage.save(file_path, ContentFile(file.read()))
                            attachment_paths.append(saved_path)
                            print(f"Saved attachment: {saved_path}")
                        
                        elif field_name in ['images'] or field_name.startswith('images'):
                            file_path = f"case_submissions/images/{unique_filename}"
                            saved_path = default_storage.save(file_path, ContentFile(file.read()))
                            image_paths.append(saved_path)
                            print(f"Saved image: {saved_path}")
                    except Exception as e:
                        print(f"Error saving file {file.name}: {str(e)}")
                        continue
            
            # Update submission with file paths
            if attachment_paths or image_paths:
                # Store all file paths in attachments
                all_files = attachment_paths + image_paths
                submission.attachments = all_files
                
                # Set the first image as the main image URL
                if image_paths:
                    submission.image_url = image_paths[0]
                
                submission.save()
                print(f"Final submission attachments: {submission.attachments}")
                print(f"Main image URL: {submission.image_url}")
        
        return submission

    def update(self, instance, validated_data):
        """Handle update with proper field mapping"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update review/published dates based on status changes
        if 'status' in validated_data:
            new_status = validated_data['status']
            if new_status in ['Approved', 'Published', 'Rejected'] and not instance.review_date:
                instance.review_date = timezone.now()
            if new_status == 'Published' and not instance.published_date:
                instance.published_date = timezone.now()
        
        instance.save()
        return instance

    def to_representation(self, instance):
        """Convert to camelCase for frontend response"""
        data = super().to_representation(instance)
        
        # Convert snake_case to camelCase for frontend
        return {
            'id': data['id'],
            'title': data['title'],
            'submittedBy': data['submitted_by'], 
            'institution': data['institution'],
            'email': data['email'],
            'phone': data.get('phone'),
            'location': data['location'],
            'category': data['category'],
            'excerpt': data['excerpt'],
            'fullContent': data.get('full_content'),
            'impact': data.get('impact'),
            'status': data['status'],
            'reviewNotes': data.get('review_notes'),
            'reviewedBy': data.get('reviewed_by'),
            'attachments': data.get('attachments', []),
            'attachmentUrls': data.get('attachment_urls', []),  # This will include full URLs
            'imageUrl': data.get('image_url_display'),
            'submissionDate': data.get('submission_date'),
            'reviewDate': data.get('review_date'),
            'publishedDate': data.get('published_date'),
        }

    def to_internal_value(self, data):
        """Convert camelCase to snake_case for backend processing"""
        field_mapping = {
            'submittedBy': 'submitted_by',
            'fullContent': 'full_content',
            'reviewNotes': 'review_notes',
            'reviewedBy': 'reviewed_by',
            'imageUrl': 'image_url',
            'submissionDate': 'submission_date',
            'reviewDate': 'review_date',
            'publishedDate': 'published_date'
        }
        
        converted_data = {}
        for key, value in data.items():
            if key in field_mapping:
                converted_data[field_mapping[key]] = value
            else:
                converted_data[key] = value
        
        return super().to_internal_value(converted_data)


class ResourceAnalyticsSerializer(serializers.Serializer):
    """Serializer for resource analytics data"""
    total = serializers.IntegerField()
    published = serializers.IntegerField()
    draft = serializers.IntegerField()
    under_review = serializers.IntegerField()
    archived = serializers.IntegerField()
    featured = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    monthly_downloads = serializers.IntegerField()
    total_views = serializers.IntegerField()
    monthly_views = serializers.IntegerField()
    pending_submissions = serializers.IntegerField()
    resources_by_category = serializers.DictField(child=serializers.IntegerField())
    top_resources = serializers.ListField(child=serializers.DictField())
    recent_activity = serializers.ListField(child=serializers.DictField())
    
    def to_representation(self, instance):
        """Convert snake_case to camelCase for frontend"""
        data = super().to_representation(instance)
        return {
            'total': data.get('total', 0),
            'published': data.get('published', 0),
            'draft': data.get('draft', 0),
            'underReview': data.get('under_review', 0),
            'archived': data.get('archived', 0),
            'featured': data.get('featured', 0),
            'totalDownloads': data.get('total_downloads', 0),
            'monthlyDownloads': data.get('monthly_downloads', 0),
            'totalViews': data.get('total_views', 0),
            'monthlyViews': data.get('monthly_views', 0),
            'pendingSubmissions': data.get('pending_submissions', 0),
            'resourcesByCategory': data.get('resources_by_category', {}),
            'topResources': data.get('top_resources', []),
            'recentActivity': data.get('recent_activity', []),
        }


class ResourceViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceView
        fields = ['id', 'resource', 'ip_address', 'user_agent', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']


class ResourceDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceDownload
        fields = ['id', 'resource', 'ip_address', 'user_agent', 'downloaded_at']
        read_only_fields = ['id', 'downloaded_at']