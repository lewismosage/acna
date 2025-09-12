from django.db import models
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator
import json


class BaseContent(models.Model):
    """Abstract base model for all content types"""
    
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    summary = models.TextField(help_text="Brief summary of the content")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Media
    image = models.ImageField(upload_to='content_images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="Alternative to uploaded image")
    
    # JSON Fields for arrays
    tags = models.JSONField(default=list, help_text="Tags for categorization and search")
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.tags, list):
            self.tags = []
        super().save(*args, **kwargs)
    
    @property
    def image_url_final(self):
        """Return the final image URL - either uploaded image or provided URL"""
        if self.image:
            return self.image.url
        return self.image_url or ""


class PolicyBelief(BaseContent):
    """Model for Policy Beliefs"""
    
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    # Policy-specific fields
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    
    # JSON Fields for arrays
    target_audience = models.JSONField(default=list, help_text="List of target audiences")
    key_recommendations = models.JSONField(default=list, help_text="List of key policy recommendations")
    region = models.JSONField(default=list, help_text="Regions this policy focuses on")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['category']),
            models.Index(fields=['-created_at']),
        ]
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.target_audience, list):
            self.target_audience = []
        if not isinstance(self.key_recommendations, list):
            self.key_recommendations = []
        if not isinstance(self.region, list):
            self.region = []
        super().save(*args, **kwargs)


class PositionalStatement(BaseContent):
    """Model for Positional Statements"""
    
    # Statement-specific fields
    page_count = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    
    # JSON Fields for arrays
    key_points = models.JSONField(default=list, help_text="List of key points in the statement")
    country_focus = models.JSONField(default=list, help_text="Countries this statement focuses on")
    related_policies = models.JSONField(default=list, help_text="Related policy documents")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['page_count']),
            models.Index(fields=['-created_at']),
        ]
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.key_points, list):
            self.key_points = []
        if not isinstance(self.country_focus, list):
            self.country_focus = []
        if not isinstance(self.related_policies, list):
            self.related_policies = []
        super().save(*args, **kwargs)


class ContentView(models.Model):
    """Track views for analytics - generic for both content types"""
    content_type = models.CharField(max_length=50)  # 'PolicyBelief' or 'PositionalStatement'
    content_id = models.PositiveIntegerField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['content_type', 'content_id', 'ip_address']
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['content_type', 'content_id']),
            models.Index(fields=['viewed_at']),
        ]


class ContentDownload(models.Model):
    """Track downloads for analytics - generic for both content types"""
    content_type = models.CharField(max_length=50)  # 'PolicyBelief' or 'PositionalStatement'
    content_id = models.PositiveIntegerField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-downloaded_at']
        indexes = [
            models.Index(fields=['content_type', 'content_id']),
            models.Index(fields=['downloaded_at']),
        ]