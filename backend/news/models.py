from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
import os

def news_image_path(instance, filename):
    """Generate upload path for news images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('news', 'images', filename)

def author_image_path(instance, filename):
    """Generate upload path for author images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('authors', 'images', filename)

class NewsItem(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]
    
    TYPE_CHOICES = [
        ('News Article', 'News Article'),
        ('Press Release', 'Press Release'),
        ('Announcement', 'Announcement'),
        ('Research Update', 'Research Update'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='News Article')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Draft')
    category = models.CharField(max_length=100)
    date = models.DateField(default=timezone.now)
    read_time = models.CharField(max_length=20, default='5 min')
    views = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    
    # Image - support both uploaded files and external URLs
    image = models.ImageField(upload_to=news_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="External image URL or uploaded image path")
    
    # Content
    introduction = models.TextField()
    sections = models.TextField(blank=True, help_text="Stores sections as JSON")
    conclusion = models.TextField(blank=True)
    
    # Tags (stored as comma-separated values)
    tags = models.TextField(blank=True)
    
    # Author info - updated to support image uploads
    author_name = models.CharField(max_length=100, blank=True)
    author_title = models.CharField(max_length=150, blank=True)
    author_organization = models.CharField(max_length=150, blank=True)
    author_bio = models.TextField(blank=True)
    author_image = models.ImageField(upload_to=author_image_path, blank=True, null=True)
    author_image_url = models.URLField(blank=True, null=True, help_text="External author image URL or uploaded image path")
    
    # Source info
    source_name = models.CharField(max_length=200, blank=True)
    source_url = models.URLField(blank=True)
    
    # Contact info
    contact_name = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'News Item'
        verbose_name_plural = 'News Items'
    
    def __str__(self):
        return self.title
    
    @property
    def image_url_display(self):
        """
        Return the appropriate image URL with priority:
        1. Uploaded image file (self.image)
        2. External image URL (self.image_url)
        3. Fallback placeholder
        """
        # Priority 1: Check if we have an uploaded image file
        if self.image and hasattr(self.image, 'url'):
            try:
                return self.image.url
            except ValueError:
                # Handle case where image file doesn't exist
                pass
        
        # Priority 2: Check if we have an external URL
        if self.image_url:
            return self.image_url
        
        # Priority 3: Return None (let frontend handle placeholder)
        return None
    
    @property
    def author_image_url_display(self):
        """
        Return the appropriate author image URL with priority:
        1. Uploaded author image file (self.author_image)
        2. External author image URL (self.author_image_url)
        3. Fallback placeholder
        """
        # Priority 1: Check if we have an uploaded image file
        if self.author_image and hasattr(self.author_image, 'url'):
            try:
                return self.author_image.url
            except ValueError:
                # Handle case where image file doesn't exist
                pass
        
        # Priority 2: Check if we have an external URL
        if self.author_image_url:
            return self.author_image_url
        
        # Priority 3: Return None (let frontend handle placeholder)
        return None
    
    @property
    def tags_list(self):
        """Return tags as a list"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []
    
    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])
    
    def save(self, *args, **kwargs):
        """Override save to handle image_url when image is uploaded"""
        # Handle main image
        if self.image and not self.image_url:
            # This will be set after the file is saved, so we need to save twice
            super().save(*args, **kwargs)
            if not self.image_url and self.image:
                self.image_url = self.image.url
                super().save(update_fields=['image_url'])
        # Handle author image
        elif self.author_image and not self.author_image_url:
            super().save(*args, **kwargs)
            if not self.author_image_url and self.author_image:
                self.author_image_url = self.author_image.url
                super().save(update_fields=['author_image_url'])
        else:
            super().save(*args, **kwargs)

class NewsView(models.Model):
    """Track individual news views for analytics"""
    news_item = models.ForeignKey(NewsItem, related_name='view_records', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.news_item.title} - {self.viewed_at}"