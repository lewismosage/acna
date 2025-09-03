from django.db import models
from django.utils import timezone
import json
import os


class EBooklet(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="Short description for listing pages")
    abstract = models.TextField(blank=True, null=True, help_text="Detailed abstract")
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    is_featured = models.BooleanField(default=False)
    
    # Files
    image = models.ImageField(upload_to='ebooklets/images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to='ebooklets/files/', blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    file_size = models.CharField(max_length=50, blank=True, null=True)
    
    # Content Details (JSON fields for arrays)
    authors = models.JSONField(default=list, help_text="List of author names")
    target_audience = models.JSONField(default=list, help_text="List of target audiences")
    file_formats = models.JSONField(default=list, help_text="Available file formats")
    table_of_contents = models.JSONField(default=list, help_text="Table of contents items")
    keywords = models.JSONField(default=list, help_text="Keywords for search")
    tags = models.JSONField(default=list, help_text="Tags for categorization")
    
    # Metadata
    pages = models.PositiveIntegerField(default=0)
    language = models.CharField(max_length=50, default='English')
    isbn = models.CharField(max_length=17, blank=True, null=True)
    publisher = models.CharField(max_length=200, blank=True, null=True)
    edition = models.CharField(max_length=50, blank=True, null=True)
    
    # Analytics
    download_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    
    # Dates
    publication_date = models.DateField(auto_now_add=True)
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
        if not isinstance(self.authors, list):
            self.authors = []
        if not isinstance(self.target_audience, list):
            self.target_audience = []
        if not isinstance(self.file_formats, list):
            self.file_formats = []
        if not isinstance(self.table_of_contents, list):
            self.table_of_contents = []
        if not isinstance(self.keywords, list):
            self.keywords = []
        if not isinstance(self.tags, list):
            self.tags = []
            
        super().save(*args, **kwargs)
    
    @property
    def last_updated(self):
        return self.updated_at


class EBookletView(models.Model):
    """Track views for analytics"""
    ebooklet = models.ForeignKey(EBooklet, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['ebooklet', 'ip_address']
        

class EBookletDownload(models.Model):
    """Track downloads for analytics"""
    ebooklet = models.ForeignKey(EBooklet, on_delete=models.CASCADE, related_name='downloads')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-downloaded_at']