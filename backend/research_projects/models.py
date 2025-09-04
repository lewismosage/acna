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

class ResearchPaper(models.Model):
    """Model for uploaded research papers"""
    
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Revision Required', 'Revision Required'),
        ('Accepted', 'Accepted'),
        ('Published', 'Published'),
        ('Rejected', 'Rejected'),
    ]
    
    RESEARCH_TYPE_CHOICES = [
        ('Clinical Trial', 'Clinical Trial'),
        ('Observational Study', 'Observational Study'),
        ('Case Report', 'Case Report'),
        ('Case Series', 'Case Series'),
        ('Systematic Review', 'Systematic Review'),
        ('Meta-Analysis', 'Meta-Analysis'),
        ('Basic Science Research', 'Basic Science Research'),
        ('Epidemiological Study', 'Epidemiological Study'),
        ('Other', 'Other'),
    ]
    
    CATEGORY_CHOICES = [
        ('Pediatric Epilepsy', 'Pediatric Epilepsy'),
        ('Cerebral Palsy', 'Cerebral Palsy'),
        ('Neurodevelopmental Disorders', 'Neurodevelopmental Disorders'),
        ('Pediatric Stroke', 'Pediatric Stroke'),
        ('Infectious Diseases of CNS', 'Infectious Diseases of CNS'),
        ('Genetic Neurological Disorders', 'Genetic Neurological Disorders'),
        ('Neurooncology', 'Neurooncology'),
        ('Other', 'Other'),
    ]
    
    STUDY_DESIGN_CHOICES = [
        ('Randomized Controlled Trial', 'Randomized Controlled Trial'),
        ('Cohort Study', 'Cohort Study'),
        ('Case-Control Study', 'Case-Control Study'),
        ('Cross-Sectional Study', 'Cross-Sectional Study'),
        ('Qualitative Study', 'Qualitative Study'),
        ('Mixed Methods', 'Mixed Methods'),
        ('Other', 'Other'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    abstract = models.TextField(help_text="Research abstract")
    keywords = models.JSONField(default=list, help_text="List of keywords")
    
    # Classification
    research_type = models.CharField(max_length=50, choices=RESEARCH_TYPE_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    study_design = models.CharField(max_length=50, choices=STUDY_DESIGN_CHOICES, blank=True, null=True)
    
    # Study Details
    participants = models.TextField(blank=True, null=True, help_text="Study participants description")
    ethics_approval = models.BooleanField(default=False)
    ethics_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Funding & Compliance
    funding_source = models.CharField(max_length=300, blank=True, null=True)
    conflict_of_interest = models.TextField(blank=True, null=True)
    acknowledgments = models.TextField(blank=True, null=True)
    
    # Publication
    target_journal = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Submitted')
    
    # File Storage
    manuscript_file = models.FileField(upload_to='research_papers/manuscripts/', help_text="Main manuscript file")
    
    # Authors (JSON field to store author information)
    authors = models.JSONField(default=list, help_text="List of author objects with name, email, affiliation, isCorresponding")
    
    # Relationship to Research Project (optional)
    research_project = models.ForeignKey(
        ResearchProject, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='research_papers',
        help_text="Link to related research project"
    )
    
    # Metadata
    submission_date = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    review_deadline = models.DateField(blank=True, null=True)
    
    class Meta:
        ordering = ['-submission_date']
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.keywords, list):
            self.keywords = []
        if not isinstance(self.authors, list):
            self.authors = []
        super().save(*args, **kwargs)
    
    @property
    def corresponding_author(self):
        """Get the corresponding author"""
        if isinstance(self.authors, list):
            for author in self.authors:
                if isinstance(author, dict) and author.get('isCorresponding'):
                    return author
        return None
    
    @property
    def author_count(self):
        """Get the number of authors"""
        return len(self.authors) if isinstance(self.authors, list) else 0
    
    @property
    def is_under_review(self):
        """Check if paper is currently under review"""
        return self.status in ['Submitted', 'Under Review', 'Revision Required']


class ResearchPaperFile(models.Model):
    """Model for supplementary files attached to research papers"""
    
    FILE_TYPE_CHOICES = [
        ('supplementary', 'Supplementary Material'),
        ('figure', 'Figure'),
        ('dataset', 'Dataset'),
        ('appendix', 'Appendix'),
        ('other', 'Other'),
    ]
    
    research_paper = models.ForeignKey(ResearchPaper, on_delete=models.CASCADE, related_name='supplementary_files')
    file = models.FileField(upload_to='research_papers/supplementary/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='supplementary')
    description = models.CharField(max_length=200, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['file_type', 'uploaded_at']
    
    def __str__(self):
        return f"{self.research_paper.title} - {self.file.name}"


class ResearchPaperReview(models.Model):
    """Model for tracking research paper review process"""
    
    REVIEW_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    
    RECOMMENDATION_CHOICES = [
        ('Accept', 'Accept'),
        ('Minor Revisions', 'Minor Revisions'),
        ('Major Revisions', 'Major Revisions'),
        ('Reject', 'Reject'),
    ]
    
    research_paper = models.ForeignKey(ResearchPaper, on_delete=models.CASCADE, related_name='reviews')
    reviewer_name = models.CharField(max_length=200)
    reviewer_email = models.EmailField()
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='Pending')
    recommendation = models.CharField(max_length=20, choices=RECOMMENDATION_CHOICES, blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    
    # Timestamps
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"Review of {self.research_paper.title} by {self.reviewer_name}"


class ResearchPaperComment(models.Model):
    """Model for comments/feedback on research papers"""
    
    research_paper = models.ForeignKey(ResearchPaper, on_delete=models.CASCADE, related_name='comments')
    commenter_name = models.CharField(max_length=200)
    commenter_email = models.EmailField()
    comment = models.TextField()
    is_internal = models.BooleanField(default=False, help_text="Internal comment visible only to reviewers")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment on {self.research_paper.title} by {self.commenter_name}"