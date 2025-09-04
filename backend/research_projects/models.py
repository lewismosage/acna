from django.db import models
from django.utils import timezone
import json


class ResearchProject(models.Model):
    STATUS_CHOICES = [
        ('Planning', 'Planning'),
        ('Active', 'Active'),
        ('Recruiting', 'Recruiting'),
        ('Data Collection', 'Data Collection'),
        ('Analysis', 'Analysis'),
        ('Completed', 'Completed'),
        ('Suspended', 'Suspended'),
        ('Terminated', 'Terminated'),
    ]
    
    TYPE_CHOICES = [
        ('Clinical Trial', 'Clinical Trial'),
        ('Observational Study', 'Observational Study'),
        ('Intervention Study', 'Intervention Study'),
        ('Epidemiological Study', 'Epidemiological Study'),
        ('Genetic Research', 'Genetic Research'),
        ('Cohort Study', 'Cohort Study'),
        ('Case-Control Study', 'Case-Control Study'),
        ('Systematic Review', 'Systematic Review'),
        ('Meta-Analysis', 'Meta-Analysis'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    description = models.TextField(help_text="Brief description of the research project")
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Clinical Trial')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')
    principal_investigator = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., NCT12345678")
    
    # Timeline
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Funding
    funding_source = models.CharField(max_length=200, blank=True, null=True)
    funding_amount = models.CharField(max_length=100, blank=True, null=True)
    
    # Study Population
    target_population = models.CharField(max_length=300)
    sample_size = models.PositiveIntegerField(blank=True, null=True)
    
    # Study Details
    methodology = models.TextField(blank=True, null=True, help_text="Research methodology and approach")
    ethics_approval = models.BooleanField(default=False)
    
    # Media
    image = models.ImageField(upload_to='research_projects/images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    
    # JSON fields for complex data
    investigators = models.JSONField(default=list, help_text="List of investigator objects with name, role, affiliation, email")
    institutions = models.JSONField(default=list, help_text="List of participating institutions")
    objectives = models.JSONField(default=list, help_text="List of research objectives")
    keywords = models.JSONField(default=list, help_text="List of keywords for search")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.investigators, list):
            self.investigators = []
        if not isinstance(self.institutions, list):
            self.institutions = []
        if not isinstance(self.objectives, list):
            self.objectives = []
        if not isinstance(self.keywords, list):
            self.keywords = []
            
        super().save(*args, **kwargs)
    
    @property
    def image_url_display(self):
        """Get the image URL, prioritizing uploaded file over URL field"""
        if self.image:
            return self.image.url
        return self.image_url or 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400'
    
    @property
    def duration_days(self):
        """Calculate project duration in days"""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days
        return None
    
    @property
    def is_active(self):
        """Check if project is currently active"""
        return self.status in ['Active', 'Recruiting', 'Data Collection']
    
    @property
    def investigator_count(self):
        """Get the number of investigators"""
        return len(self.investigators) if isinstance(self.investigators, list) else 0


class ResearchProjectView(models.Model):
    """Track views for analytics"""
    research_project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['research_project', 'ip_address']
        ordering = ['-viewed_at']


class ResearchProjectUpdate(models.Model):
    """Track project updates and milestones"""
    research_project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    description = models.TextField()
    update_type = models.CharField(max_length=50, choices=[
        ('Milestone', 'Milestone'),
        ('Status Change', 'Status Change'),
        ('Publication', 'Publication'),
        ('General Update', 'General Update'),
    ], default='General Update')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.research_project.title} - {self.title}"