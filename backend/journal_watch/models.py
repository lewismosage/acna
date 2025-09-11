from django.db import models
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator
import json


class JournalArticle(models.Model):
    RELEVANCE_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]
    
    ACCESS_CHOICES = [
        ('Open', 'Open Access'),
        ('Subscription', 'Subscription Required'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    authors = models.CharField(max_length=500)
    journal = models.CharField(max_length=200)
    summary = models.TextField(help_text="Brief summary of the article")
    abstract = models.TextField(blank=True, null=True, help_text="Full abstract (optional)")
    
    # Research Details
    relevance = models.CharField(max_length=10, choices=RELEVANCE_CHOICES, default='Medium')
    study_type = models.CharField(max_length=100)
    population = models.CharField(max_length=300)
    access = models.CharField(max_length=20, choices=ACCESS_CHOICES, default='Open')
    commentary = models.TextField(blank=True, null=True, help_text="ACNA commentary on the article")
    
    # JSON Fields for arrays
    key_findings = models.JSONField(default=list, help_text="List of key findings")
    country_focus = models.JSONField(default=list, help_text="Countries the study focuses on")
    tags = models.JSONField(default=list, help_text="Tags for categorization and search")
    
    # Status and Analytics
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    
    # Dates
    publication_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['relevance']),
            models.Index(fields=['study_type']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.key_findings, list):
            self.key_findings = []
        if not isinstance(self.country_focus, list):
            self.country_focus = []
        if not isinstance(self.tags, list):
            self.tags = []
            
        super().save(*args, **kwargs)
    
    @property
    def last_updated(self):
        return self.updated_at


class JournalArticleView(models.Model):
    """Track views for analytics"""
    article = models.ForeignKey(JournalArticle, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['article', 'ip_address']
        ordering = ['-viewed_at']


class JournalArticleDownload(models.Model):
    """Track downloads for analytics"""
    article = models.ForeignKey(JournalArticle, on_delete=models.CASCADE, related_name='downloads')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-downloaded_at']