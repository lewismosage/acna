from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
import os

def webinar_image_path(instance, filename):
    """Generate upload path for webinar images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('webinars', 'images', filename)

def speaker_image_path(instance, filename):
    """Generate upload path for speaker images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('speakers', 'images', filename)

class Webinar(models.Model):
    STATUS_CHOICES = [
        ('Planning', 'Planning'),
        ('Registration Open', 'Registration Open'),
        ('Live', 'Live'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('Live', 'Live'),
        ('Recorded', 'Recorded'),
        ('Hybrid', 'Hybrid'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    duration = models.CharField(max_length=50, default='60 min')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='Live')
    is_featured = models.BooleanField(default=False)
    registration_count = models.PositiveIntegerField(default=0)
    capacity = models.PositiveIntegerField(default=100)
    
    # Image - support both uploaded files and external URLs
    image = models.ImageField(upload_to=webinar_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="External image URL or uploaded image path")
    
    # Links
    registration_link = models.URLField(blank=True)
    recording_link = models.URLField(blank=True)
    slides_link = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'Webinar'
        verbose_name_plural = 'Webinars'
    
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
        if self.image and hasattr(self.image, 'url'):
            try:
                return self.image.url
            except ValueError:
                pass
        
        if self.image_url:
            return self.image_url
        
        return None
    
    @property
    def is_upcoming(self):
        """Check if webinar is upcoming (planning or registration open)"""
        return self.status in ['Planning', 'Registration Open']
    
    @property
    def registration_progress(self):
        """Calculate registration progress percentage"""
        if self.capacity == 0:
            return 0
        return round((self.registration_count / self.capacity) * 100)
    
    def increment_registration(self):
        """Increment registration count"""
        self.registration_count += 1
        self.save(update_fields=['registration_count'])
    
    def toggle_featured(self):
        """Toggle featured status"""
        self.is_featured = not self.is_featured
        self.save(update_fields=['is_featured'])

class Speaker(models.Model):
    webinar = models.ForeignKey(
        Webinar, 
        related_name='speakers', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    credentials = models.CharField(max_length=150, blank=True)
    affiliation = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to=speaker_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.name} - {self.webinar.title}"
    
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

class WebinarTag(models.Model):
    webinar = models.ForeignKey(
        Webinar, 
        related_name='tags', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ('webinar', 'name')
    
    def __str__(self):
        return self.name

class WebinarLanguage(models.Model):
    webinar = models.ForeignKey(
        Webinar, 
        related_name='languages', 
        on_delete=models.CASCADE
    )
    language = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ('webinar', 'language')
    
    def __str__(self):
        return self.language

class WebinarAudience(models.Model):
    webinar = models.ForeignKey(
        Webinar, 
        related_name='target_audience', 
        on_delete=models.CASCADE
    )
    audience = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('webinar', 'audience')
    
    def __str__(self):
        return self.audience

class WebinarObjective(models.Model):
    webinar = models.ForeignKey(
        Webinar, 
        related_name='learning_objectives', 
        on_delete=models.CASCADE
    )
    objective = models.TextField()
    order = models.PositiveSmallIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Objective {self.order} for {self.webinar.title}"

class Registration(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Free', 'Free'),
        ('Failed', 'Failed'),
    ]
    
    REGISTRATION_TYPE_CHOICES = [
        ('Free', 'Free'),
        ('Paid', 'Paid'),
        ('Student', 'Student'),
        ('Professional', 'Professional'),
    ]
    
    webinar = models.ForeignKey(
        Webinar, 
        related_name='registrations', 
        on_delete=models.CASCADE
    )
    attendee_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=150, blank=True)
    registration_type = models.CharField(
        max_length=20, 
        choices=REGISTRATION_TYPE_CHOICES,
        default='Free'
    )
    payment_status = models.CharField(
        max_length=10, 
        choices=PAYMENT_STATUS_CHOICES,
        default='Pending'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.attendee_name} - {self.webinar.title}"

class WebinarView(models.Model):
    """Track webinar views for analytics"""
    webinar = models.ForeignKey(Webinar, related_name='view_records', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.webinar.title} - {self.viewed_at}"