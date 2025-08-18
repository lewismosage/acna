from django.db import models
from django.utils import timezone
import uuid
import os

def conference_image_path(instance, filename):
    """Generate upload path for conference images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('conferences', 'images', filename)

class Conference(models.Model):
    STATUS_CHOICES = [
        ('Planning', 'Planning'),
        ('Registration Open', 'Registration Open'),
        ('Coming Soon', 'Coming Soon'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('In-person', 'In-person'),
        ('Virtual', 'Virtual'),
        ('Hybrid', 'Hybrid'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=200)
    date = models.CharField(max_length=50)  # Can be "March 15-17, 2026" or specific date
    location = models.CharField(max_length=100)
    venue = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='In-person')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')
    theme = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    
    # Image - support both uploaded files and external URLs
    image = models.ImageField(upload_to=conference_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="External image URL or uploaded image path")
    
    # Attendance info
    attendees = models.CharField(max_length=20, blank=True)
    speakers = models.CharField(max_length=20, blank=True)
    countries = models.CharField(max_length=20, blank=True)
    
    # Registration info
    early_bird_deadline = models.DateField(blank=True, null=True)
    regular_fee = models.CharField(max_length=50, blank=True)
    early_bird_fee = models.CharField(max_length=50, blank=True)
    registration_count = models.PositiveIntegerField(default=0)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    
    # Additional info
    highlights = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Conference'
        verbose_name_plural = 'Conferences'
    
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
    
    def increment_registrations(self):
        """Increment registration count"""
        if self.registration_count is not None:
            self.registration_count += 1
            self.save(update_fields=['registration_count'])

class Registration(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    ]
    
    REGISTRATION_TYPE_CHOICES = [
        ('Early Bird', 'Early Bird'),
        ('Regular', 'Regular'),
    ]
    
    conference = models.ForeignKey(Conference, related_name='registrations', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=100, blank=True)
    registration_date = models.DateField(default=timezone.now)
    registration_type = models.CharField(max_length=20, choices=REGISTRATION_TYPE_CHOICES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    
    class Meta:
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.name} - {self.conference.title}"

class ConferenceView(models.Model):
    """Track individual conference views for analytics"""
    conference = models.ForeignKey(Conference, related_name='view_records', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.conference.title} - {self.viewed_at}"