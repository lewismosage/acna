from django.db import models
from django.utils import timezone
import json
import os
from django.core.validators import FileExtensionValidator

class EducationalResource(models.Model):
    RESOURCE_TYPE_CHOICES = [
        ('Fact Sheet', 'Fact Sheet'),
        ('Case Study', 'Case Study'),
        ('Video', 'Video'),
        ('Document', 'Document'),
        ('Slide Deck', 'Slide Deck'),
        ('Interactive', 'Interactive'),
        ('Webinar', 'Webinar'),
        ('Toolkit', 'Toolkit'),
    ]
    
    STATUS_CHOICES = [
        ('Published', 'Published'),
        ('Draft', 'Draft'),
        ('Under Review', 'Under Review'),
        ('Archived', 'Archived'),
    ]
    
    CATEGORY_CHOICES = [
        ('Epilepsy', 'Epilepsy'),
        ('Cerebral Palsy', 'Cerebral Palsy'),
        ('Neurodevelopment', 'Neurodevelopment'),
        ('Nutrition', 'Nutrition'),
        ('Seizures', 'Seizures'),
        ('Rehabilitation', 'Rehabilitation'),
        ('General', 'General'),
        ('Research', 'Research'),
        ('Training', 'Training'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    full_description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    condition = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    is_featured = models.BooleanField(default=False)
    is_free = models.BooleanField(default=True)
    
    # Media Files
    image = models.ImageField(
        upload_to='resources/images/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp'])]
    )
    image_url = models.URLField(blank=True, null=True)
    file = models.FileField(
        upload_to='resources/files/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx', 'ppt', 'pptx'])]
    )
    file_url = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    
    # Content Details (JSON fields for arrays)
    languages = models.JSONField(default=list)
    tags = models.JSONField(default=list)
    target_audience = models.JSONField(default=list)
    related_conditions = models.JSONField(default=list)
    learning_objectives = models.JSONField(default=list)
    prerequisites = models.JSONField(default=list)
    references = models.JSONField(default=list)
    
    # Metadata
    age_group = models.CharField(max_length=50, blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    duration = models.CharField(max_length=50, blank=True, null=True)
    file_size = models.CharField(max_length=50, blank=True, null=True)
    file_format = models.CharField(max_length=50, blank=True, null=True)
    
    # Author Information
    author = models.CharField(max_length=200)
    reviewed_by = models.CharField(max_length=200, blank=True, null=True)
    institution = models.CharField(max_length=200, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    impact_statement = models.TextField(blank=True, null=True)
    accreditation = models.CharField(max_length=200, blank=True, null=True)
    
    # Analytics
    download_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    
    # Dates
    publication_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Calculate file size if file is present
        if self.file:
            size_bytes = self.file.size
            if size_bytes < 1024:
                self.file_size = f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                self.file_size = f"{size_bytes / 1024:.1f} KB"
            else:
                self.file_size = f"{size_bytes / (1024 * 1024):.1f} MB"
        
        # Ensure arrays are properly formatted
        for field in ['languages', 'tags', 'target_audience', 'related_conditions', 
                     'learning_objectives', 'prerequisites', 'references']:
            value = getattr(self, field)
            if not isinstance(value, list):
                setattr(self, field, [])
                
        super().save(*args, **kwargs)


class CaseStudySubmission(models.Model):
    STATUS_CHOICES = [
        ('Pending Review', 'Pending Review'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Published', 'Published'),
        ('Rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=200)
    submitted_by = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    excerpt = models.TextField()
    full_content = models.TextField(blank=True, null=True)
    impact = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending Review')
    review_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.CharField(max_length=200, blank=True, null=True)
    
    # Files
    attachments = models.JSONField(default=list)
    image_url = models.URLField(blank=True, null=True)
    
    # Dates
    submission_date = models.DateTimeField(auto_now_add=True)
    review_date = models.DateTimeField(blank=True, null=True)
    published_date = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-submission_date']
        
    def __str__(self):
        return self.title

    def get_attachment_urls(self):
        """Get full URLs for all attachments"""
        urls = []
        for attachment_path in self.attachments:
            if attachment_path:
                urls.append(default_storage.url(attachment_path))
        return urls
    
    def get_image_url_display(self):
        """Get the image URL"""
        if self.image_url:
            return self.image_url
        return None


class ResourceView(models.Model):
    resource = models.ForeignKey(EducationalResource, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['resource', 'ip_address']


class ResourceDownload(models.Model):
    resource = models.ForeignKey(EducationalResource, on_delete=models.CASCADE, related_name='downloads')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-downloaded_at']