from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator
import os

def job_application_file_path(instance, filename):
    """Generate file path for job application files"""
    ext = filename.split('.')[-1]
    filename = f"{instance.applicant_name}_{instance.id}.{ext}"
    return os.path.join('careers', 'applications', filename)

class JobOpportunity(models.Model):
    """Main model for Job Opportunities"""
    
    TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Internship', 'Internship'),
        ('Volunteer', 'Volunteer'),
    ]
    
    LEVEL_CHOICES = [
        ('Entry-level', 'Entry-level'),
        ('Mid-level', 'Mid-level'),
        ('Senior', 'Senior'),
        ('Executive', 'Executive'),
    ]
    
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Active', 'Active'),
        ('Closed', 'Closed'),
    ]
    
    WORK_ARRANGEMENT_CHOICES = [
        ('On-site', 'On-site'),
        ('Remote', 'Remote'),
        ('Hybrid', 'Hybrid'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Full-time')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Mid-level')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    description = models.TextField()
    salary = models.CharField(max_length=100)
    
    # Dates
    closing_date = models.DateField()
    contract_duration = models.CharField(max_length=100, blank=True, null=True)
    work_arrangement = models.CharField(max_length=20, choices=WORK_ARRANGEMENT_CHOICES, default='On-site')
    
    # JSON Fields for Arrays (like other backends)
    responsibilities = models.JSONField(default=list, help_text="List of key responsibilities")
    requirements = models.JSONField(default=list, help_text="List of requirements")
    qualifications = models.JSONField(default=list, help_text="List of qualifications")
    benefits = models.JSONField(default=list, help_text="List of benefits and perks")
    
    # Timestamps
    posted_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['department']),
            models.Index(fields=['location']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.responsibilities, list):
            self.responsibilities = []
        if not isinstance(self.requirements, list):
            self.requirements = []
        if not isinstance(self.qualifications, list):
            self.qualifications = []
        if not isinstance(self.benefits, list):
            self.benefits = []
        
        # Handle posted_date logic
        if self.status == 'Active' and not self.posted_date:
            self.posted_date = timezone.now().date()
        elif self.status != 'Active':
            self.posted_date = None
        
        super().save(*args, **kwargs)
    
    @property
    def applications_count(self):
        """Get count of applications for this job"""
        return self.applications.count()


class JobApplication(models.Model):
    """Model for Job Applications"""
    
    STATUS_CHOICES = [
        ('New', 'New'),
        ('Under Review', 'Under Review'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
    ]
    
    # Job relationship
    opportunity = models.ForeignKey(
        JobOpportunity,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    # Applicant Information
    applicant_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=200)
    cover_letter = models.TextField(blank=True, null=True)
    cover_letter_file = models.FileField(
        upload_to=job_application_file_path,
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])],
        blank=True,
        null=True
    )
    resume = models.FileField(
        upload_to=job_application_file_path,
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx'])]
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    
    # Timestamps - FIXED: removed duplicate applied_date
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['opportunity', 'email']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['opportunity']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.applicant_name} - {self.opportunity.title}"
    
    @property
    def applied_date(self):
        """Alias for created_at for API compatibility"""
        return self.created_at
    
    @property
    def opportunity_title(self):
        """Get opportunity title for API compatibility"""
        return self.opportunity.title if self.opportunity else ""


class VolunteerSubmission(models.Model):
    """Model for Volunteer Submissions"""
    
    STATUS_CHOICES = [
        ('Pending Review', 'Pending Review'),
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=200)
    availability = models.CharField(max_length=200)
    experience = models.TextField()
    motivation = models.TextField()
    
    # JSON Fields for Arrays (like other backends)
    interests = models.JSONField(default=list, help_text="List of interests")
    skills = models.JSONField(default=list, help_text="List of skills")
    projects = models.JSONField(default=list, help_text="List of projects")
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending Review')
    hours_contributed = models.PositiveIntegerField(default=0)
    join_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['email']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.email}"
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.interests, list):
            self.interests = []
        if not isinstance(self.skills, list):
            self.skills = []
        if not isinstance(self.projects, list):
            self.projects = []
        
        # Handle join_date logic
        if self.status == 'Active' and not self.join_date:
            self.join_date = timezone.now().date()
        elif self.status != 'Active':
            self.join_date = None
        
        super().save(*args, **kwargs)