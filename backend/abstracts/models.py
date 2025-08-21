from django.db import models
from django.utils import timezone
import uuid
import os

def abstract_file_path(instance, filename):
    """Generate upload path for abstract files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('abstracts', 'files', filename)

def ethical_approval_path(instance, filename):
    """Generate upload path for ethical approval files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('abstracts', 'ethical_approval', filename)

def supplementary_file_path(instance, filename):
    """Generate upload path for supplementary files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('abstracts', 'supplementary', filename)

class Abstract(models.Model):
    CATEGORY_CHOICES = [
        ('Clinical Research', 'Clinical Research'),
        ('Basic Science & Translational Research', 'Basic Science & Translational Research'),
        ('Healthcare Technology & Innovation', 'Healthcare Technology & Innovation'),
        ('Medical Education & Training', 'Medical Education & Training'),
        ('Public Health & Policy', 'Public Health & Policy'),
        ('Case Reports', 'Case Reports'),
    ]
    
    PRESENTATION_CHOICES = [
        ('Oral Presentation', 'Oral Presentation'),
        ('Poster Presentation', 'Poster Presentation'),
        ('E-Poster', 'E-Poster'),
        ('No Preference', 'No Preference'),
    ]
    
    STATUS_CHOICES = [
        ('Under Review', 'Under Review'),
        ('Accepted', 'Accepted'),
        ('Revision Required', 'Revision Required'),
        ('Rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=500)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    presentation_preference = models.CharField(max_length=20, choices=PRESENTATION_CHOICES, default='No Preference')
    keywords = models.JSONField(default=list)  # Store as list of strings
    
    # Abstract content sections
    background = models.TextField()
    methods = models.TextField()
    results = models.TextField()
    conclusions = models.TextField()
    conflict_of_interest = models.TextField()
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Under Review')
    reviewer_comments = models.TextField(blank=True, null=True)
    assigned_reviewer = models.CharField(max_length=255, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    
    # Files
    abstract_file = models.FileField(upload_to=abstract_file_path, blank=True, null=True)
    ethical_approval_file = models.FileField(upload_to=ethical_approval_path, blank=True, null=True)
    supplementary_files = models.FileField(upload_to=supplementary_file_path, blank=True, null=True)
    
    # Timestamps
    submitted_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submitted_date']
    
    def __str__(self):
        return self.title
    
    @property
    def abstract_file_url(self):
        if self.abstract_file and hasattr(self.abstract_file, 'url'):
            try:
                return self.abstract_file.url
            except ValueError:
                pass
        return None
    
    @property
    def ethical_approval_url(self):
        if self.ethical_approval_file and hasattr(self.ethical_approval_file, 'url'):
            try:
                return self.ethical_approval_file.url
            except ValueError:
                pass
        return None
    
    @property
    def supplementary_files_url(self):
        if self.supplementary_files and hasattr(self.supplementary_files, 'url'):
            try:
                return self.supplementary_files.url
            except ValueError:
                pass
        return None

class Author(models.Model):
    abstract = models.ForeignKey(Abstract, on_delete=models.CASCADE, related_name='authors')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    institution = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    is_presenter = models.BooleanField(default=False)
    is_corresponding = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"