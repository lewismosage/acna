from django.db import models
from django.utils import timezone
import uuid
import os

def resource_image_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('resources', 'images', filename)

def resource_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('resources', 'files', filename)

class PatientResource(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
        ('Under Review', 'Under Review'),
    ]
    
    TYPE_CHOICES = [
        ('Guide', 'Guide'),
        ('Video', 'Video'),
        ('Audio', 'Audio'),
        ('Checklist', 'Checklist'),
        ('App', 'App'),
        ('Website', 'Website'),
        ('Infographic', 'Infographic'),
        ('Handbook', 'Handbook'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=200)
    description = models.TextField()
    full_description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Guide')
    condition = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    is_featured = models.BooleanField(default=False)
    is_free = models.BooleanField(default=True)
    
    # Media
    image = models.ImageField(upload_to=resource_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to=resource_file_path, blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    
    # Metadata
    age_group = models.CharField(max_length=50)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    duration = models.CharField(max_length=50, blank=True, null=True)
    
    # Statistics
    download_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Authorship
    author = models.CharField(max_length=100)
    reviewed_by = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_review_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Patient Resource'
        verbose_name_plural = 'Patient Resources'
    
    def __str__(self):
        return self.title
    
    @property
    def image_url_display(self):
        if self.image and hasattr(self.image, 'url'):
            try:
                return self.image.url
            except ValueError:
                pass
        if self.image_url:
            return self.image_url
        return None
    
    @property
    def file_url_display(self):
        if self.file and hasattr(self.file, 'url'):
            try:
                return self.file.url
            except ValueError:
                pass
        if self.file_url:
            return self.file_url
        return None
    
    def increment_download(self):
        self.download_count += 1
        self.save(update_fields=['download_count'])
    
    def increment_view(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def toggle_featured(self):
        self.is_featured = not self.is_featured
        self.save(update_fields=['is_featured'])

class ResourceTag(models.Model):
    resource = models.ForeignKey(PatientResource, related_name='tags', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ('resource', 'name')
    
    def __str__(self):
        return self.name

class ResourceLanguage(models.Model):
    resource = models.ForeignKey(PatientResource, related_name='languages', on_delete=models.CASCADE)
    language = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ('resource', 'language')
    
    def __str__(self):
        return self.language

class ResourceAudience(models.Model):
    resource = models.ForeignKey(PatientResource, related_name='target_audience', on_delete=models.CASCADE)
    audience = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('resource', 'audience')
    
    def __str__(self):
        return self.audience

class ResourceView(models.Model):
    resource = models.ForeignKey(PatientResource, related_name='view_records', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.resource.title} - {self.viewed_at}"

class ResourceDownload(models.Model):
    resource = models.ForeignKey(PatientResource, related_name='download_records', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-downloaded_at']
    
    def __str__(self):
        return f"{self.resource.title} - {self.downloaded_at}"