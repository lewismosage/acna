from django.db import models
from django.utils import timezone
import json
import os


class Publication(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]
    
    TYPE_CHOICES = [
        ('Research Paper', 'Research Paper'),
        ('Clinical Guidelines', 'Clinical Guidelines'),
        ('Educational Resource', 'Educational Resource'),
        ('Policy Brief', 'Policy Brief'),
        ('Research Report', 'Research Report'),
    ]
    
    ACCESS_TYPE_CHOICES = [
        ('Open Access', 'Open Access'),
        ('Free Access', 'Free Access'),
        ('Member Access', 'Member Access'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    excerpt = models.TextField(help_text="Brief description for listing pages")
    abstract = models.TextField(blank=True, null=True, help_text="Detailed abstract")
    full_content = models.TextField(blank=True, null=True, help_text="Full publication content")
    
    # Classification
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Research Paper')
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    access_type = models.CharField(max_length=20, choices=ACCESS_TYPE_CHOICES, default='Open Access')
    is_featured = models.BooleanField(default=False)
    
    # Publication Details
    journal = models.CharField(max_length=200, blank=True, null=True)
    volume = models.CharField(max_length=20, blank=True, null=True)
    issue = models.CharField(max_length=20, blank=True, null=True)
    pages = models.CharField(max_length=50, blank=True, null=True)
    publisher = models.CharField(max_length=200, blank=True, null=True)
    isbn = models.CharField(max_length=17, blank=True, null=True)
    language = models.CharField(max_length=50, default='English')
    
    # Files and URLs
    image = models.ImageField(upload_to='publications/images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    download_url = models.URLField(blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    
    # JSON fields for complex data
    authors = models.JSONField(default=list, help_text="List of author objects with name, credentials, affiliation, email")
    target_audience = models.JSONField(default=list, help_text="List of target audiences")
    tags = models.JSONField(default=list, help_text="List of tags")
    keywords = models.JSONField(default=list, help_text="List of keywords for search")
    
    # Analytics
    downloads = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    citation_count = models.PositiveIntegerField(default=0)
    
    # Dates
    date = models.DateField(auto_now_add=True)  # Publication date
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.authors, list):
            self.authors = []
        if not isinstance(self.target_audience, list):
            self.target_audience = []
        if not isinstance(self.tags, list):
            self.tags = []
        if not isinstance(self.keywords, list):
            self.keywords = []
            
        super().save(*args, **kwargs)
    
    @property
    def image_url_display(self):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if self.image:
            return self.image.url
        return self.image_url or '/api/placeholder/400/250'


class PublicationView(models.Model):
    """Track views for analytics"""
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['publication', 'ip_address']
        

class PublicationDownload(models.Model):
    """Track downloads for analytics"""
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='download_records')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-downloaded_at']