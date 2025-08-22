# workshops/models.py
from django.db import models
from django.utils import timezone
import uuid
import os

def workshop_image_path(instance, filename):
    """Generate upload path for workshop images"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('workshops', 'images', filename)

class Workshop(models.Model):
    STATUS_CHOICES = [
        ('Planning', 'Planning'),
        ('Registration Open', 'Registration Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('Online', 'Online'),
        ('In-Person', 'In-Person'),
        ('Hybrid', 'Hybrid'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=200)
    instructor = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    duration = models.CharField(max_length=50, default='3 hours')
    location = models.CharField(max_length=200)
    venue = models.CharField(max_length=200, blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='In-Person')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')
    description = models.TextField()
    
    # Image - support both uploaded files and external URLs
    image = models.ImageField(upload_to=workshop_image_path, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="External image URL or uploaded image path")
    
    # Registration details
    capacity = models.PositiveIntegerField(default=30)
    registered = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'Workshop'
        verbose_name_plural = 'Workshops'
    
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
    def registration_progress(self):
        """Calculate registration progress percentage"""
        if self.capacity == 0:
            return 0
        return round((self.registered / self.capacity) * 100)
    
    def increment_registration(self):
        """Increment registration count"""
        self.registered += 1
        self.save(update_fields=['registered'])
    
    def toggle_featured(self):
        """Toggle featured status"""
        self.is_featured = not self.is_featured
        self.save(update_fields=['is_featured'])

class WorkshopPrerequisite(models.Model):
    workshop = models.ForeignKey(
        Workshop, 
        related_name='prerequisites', 
        on_delete=models.CASCADE
    )
    prerequisite = models.CharField(max_length=200)
    
    class Meta:
        unique_together = ('workshop', 'prerequisite')
    
    def __str__(self):
        return self.prerequisite

class WorkshopMaterial(models.Model):
    workshop = models.ForeignKey(
        Workshop, 
        related_name='materials', 
        on_delete=models.CASCADE
    )
    material = models.CharField(max_length=200)
    
    class Meta:
        unique_together = ('workshop', 'material')
    
    def __str__(self):
        return self.material

class CollaborationSubmission(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Needs Info', 'Needs Info'),
    ]
    
    # Project details
    project_title = models.CharField(max_length=200)
    project_description = models.TextField()
    institution = models.CharField(max_length=200)
    project_lead = models.CharField(max_length=100)
    contact_email = models.EmailField()
    commitment_level = models.CharField(max_length=50)
    duration = models.CharField(max_length=50)
    additional_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Collaboration Submission'
        verbose_name_plural = 'Collaboration Submissions'
    
    def __str__(self):
        return self.project_title

class CollaborationSkill(models.Model):
    collaboration = models.ForeignKey(
        CollaborationSubmission, 
        related_name='skills_needed', 
        on_delete=models.CASCADE
    )
    skill = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('collaboration', 'skill')
    
    def __str__(self):
        return self.skill