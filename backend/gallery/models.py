from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import os
from uuid import uuid4


def gallery_image_path(instance, filename):
    """Generate upload path for gallery images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join('gallery', 'images', filename)


def gallery_thumbnail_path(instance, filename):
    """Generate upload path for gallery thumbnails"""
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}_thumb.{ext}"
    return os.path.join('gallery', 'thumbnails', filename)


def gallery_video_path(instance, filename):
    """Generate upload path for gallery videos"""
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join('gallery', 'videos', filename)


def story_image_path(instance, filename):
    """Generate upload path for story images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join('stories', 'images', filename)


class GalleryItem(models.Model):
    """Model for gallery items (photos and videos)"""
    
    TYPE_CHOICES = [
        ('photo', 'Photo'),
        ('video', 'Video'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    CATEGORY_CHOICES = [
        ('conferences', 'Conferences'),
        ('training', 'Training'),
        ('community', 'Community'),
        ('events', 'Events'),
        ('outreach', 'Outreach'),
        ('medical', 'Medical'),
        ('education', 'Education'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='photo')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    
    # Media Files
    image = models.ImageField(
        upload_to=gallery_image_path,
        null=True,
        blank=True,
        help_text="Main image for photo items"
    )
    video = models.FileField(
        upload_to=gallery_video_path,
        null=True,
        blank=True,
        help_text="Video file for video items"
    )
    thumbnail = models.ImageField(
        upload_to=gallery_thumbnail_path,
        null=True,
        blank=True,
        help_text="Thumbnail image (auto-generated if not provided)"
    )
    
    # Event Details
    event_date = models.CharField(
        max_length=100,
        blank=True,
        help_text="Date when the event occurred (e.g., 'July 10, 2025')"
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Location where the event took place"
    )
    duration = models.CharField(
        max_length=20,
        blank=True,
        help_text="Duration for videos (e.g., '4:32')"
    )
    
    # Status and Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(
        default=False,
        help_text="Mark as featured item"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SEO and Display
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Gallery Item'
        verbose_name_plural = 'Gallery Items'
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['category', 'type']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"
    
    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while GalleryItem.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    @property
    def media_url(self):
        """Return the URL of the main media file"""
        if self.type == 'video' and self.video:
            return self.video.url
        elif self.type == 'photo' and self.image:
            return self.image.url
        return None
    
    @property
    def thumbnail_url(self):
        """Return thumbnail URL, fallback to main image if no thumbnail"""
        if self.thumbnail:
            return self.thumbnail.url
        elif self.image:
            return self.image.url
        return None


class Story(models.Model):
    """Model for patient success stories"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    # Story Information
    title = models.CharField(max_length=200)
    patient_name = models.CharField(
        max_length=100,
        help_text="Patient's name (can be anonymized)"
    )
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(150)],
        help_text="Patient's age in years"
    )
    condition = models.CharField(
        max_length=100,
        help_text="Medical condition (e.g., Epilepsy, Cerebral Palsy)"
    )
    
    # Story Content
    story = models.TextField(help_text="The full story of transformation")
    image = models.ImageField(
        upload_to=story_image_path,
        help_text="Image associated with the story"
    )
    
    # Location and Date
    location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Location where the story took place"
    )
    story_date = models.CharField(
        max_length=100,
        blank=True,
        help_text="Date when the story occurred (e.g., 'June 15, 2025')"
    )
    
    # Status and Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(
        default=False,
        help_text="Mark as featured story"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SEO and Display
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Story'
        verbose_name_plural = 'Stories'
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['condition']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.patient_name}"
    
    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Story.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    @property
    def image_url(self):
        """Return the URL of the story image"""
        if self.image:
            return self.image.url
        return None


class GalleryStats(models.Model):
    """Model to track gallery statistics"""
    
    total_gallery_items = models.PositiveIntegerField(default=0)
    published_gallery_items = models.PositiveIntegerField(default=0)
    total_stories = models.PositiveIntegerField(default=0)
    published_stories = models.PositiveIntegerField(default=0)
    total_views = models.PositiveIntegerField(default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Gallery Statistics'
        verbose_name_plural = 'Gallery Statistics'
    
    def __str__(self):
        return f"Gallery Stats - Updated: {self.last_updated}"
    
    @classmethod
    def update_stats(cls):
        """Update gallery statistics"""
        stats, created = cls.objects.get_or_create(id=1)
        
        stats.total_gallery_items = GalleryItem.objects.count()
        stats.published_gallery_items = GalleryItem.objects.filter(status='published').count()
        stats.total_stories = Story.objects.count()
        stats.published_stories = Story.objects.filter(status='published').count()
        stats.total_views = (
            GalleryItem.objects.aggregate(total=models.Sum('view_count'))['total'] or 0
        ) + (
            Story.objects.aggregate(total=models.Sum('view_count'))['total'] or 0
        )
        
        stats.save()
        return stats