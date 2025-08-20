from django.db import models
from django.utils import timezone
import uuid
import os

def award_image_path(instance, filename):
    """Generate upload path for award images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('awards', 'images', filename)

def nominee_image_path(instance, filename):
    """Generate upload path for nominee images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('nominees', 'images', filename)

class AwardCategory(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    criteria = models.TextField(blank=True, help_text="Key criteria for this award")
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'title']
        verbose_name_plural = 'Award Categories'
    
    def __str__(self):
        return self.title

class AwardWinner(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Draft', 'Draft'),
        ('Archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=300)
    location = models.CharField(max_length=200)
    achievement = models.TextField()
    category = models.ForeignKey(AwardCategory, on_delete=models.CASCADE, related_name='winners')
    year = models.PositiveIntegerField(default=timezone.now().year)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')
    
    # Image - support both uploaded files and external URLs
    image = models.ImageField(upload_to=award_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', '-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.title}"
    
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

class Nominee(models.Model):
    SOURCE_CHOICES = [
        ('admin', 'Admin Added'),
        ('suggested', 'Suggested Nominee'),
        ('new', 'New Nomination'),
        ('nomination', 'Public Nomination'),
    ] 

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Winner', 'Winner'),
    ]
    
    name = models.CharField(max_length=200)
    institution = models.CharField(max_length=300)
    specialty = models.CharField(max_length=200)
    category = models.ForeignKey(AwardCategory, on_delete=models.CASCADE, related_name='nominees')
    achievement = models.TextField()
    
    # Contact information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Image - support both uploaded files and external URLs
    image = models.ImageField(upload_to=nominee_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    
    # Status and metadata
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    suggested_by = models.CharField(max_length=200, blank=True)
    suggested_date = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='admin')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
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

class AwardNomination(models.Model):
    SOURCE_CHOICES = [
        ('suggested', 'From Suggested Nominee'),
        ('new', 'New Nomination'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    # Nominee information
    nominee_name = models.CharField(max_length=200)
    nominee_email = models.EmailField(blank=True)
    nominee_institution = models.CharField(max_length=300)
    nominee_location = models.CharField(max_length=200, blank=True)
    nominee_specialty = models.CharField(max_length=200, blank=True)
    
    # Award category
    award_category = models.ForeignKey(AwardCategory, on_delete=models.CASCADE, related_name='nominations')
    
    # Nominator information
    nominator_name = models.CharField(max_length=200)
    nominator_email = models.EmailField()
    nominator_relationship = models.CharField(max_length=200, blank=True)
    
    # Nomination details
    achievement_summary = models.TextField()
    additional_info = models.TextField(blank=True)
    
    # Supporting documents
    supporting_documents = models.FileField(upload_to='nominations/documents/', blank=True, null=True)
    
    # Status and metadata
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='Pending')
    submission_date = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='new')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submission_date']
    
    def __str__(self):
        return f"Nomination for {self.nominee_name} by {self.nominator_name}"