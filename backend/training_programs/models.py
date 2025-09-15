from django.db import models
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator, FileExtensionValidator
from django.urls import reverse
import json


class TrainingProgram(models.Model):
    """Main model for Training Programs"""
    
    TYPE_CHOICES = [
        ('Conference', 'Conference'),
        ('Workshop', 'Workshop'),
        ('Fellowship', 'Fellowship'),
        ('Online Course', 'Online Course'),
        ('Masterclass', 'Masterclass'),
    ]
    
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    ]
    
    FORMAT_CHOICES = [
        ('In-person', 'In-person'),
        ('Virtual', 'Virtual'),
        ('Hybrid', 'Hybrid'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'USD'),
        ('EUR', 'EUR'),
        ('GBP', 'GBP'),
        ('KES', 'KES'),
        ('NGN', 'NGN'),
        ('ZAR', 'ZAR'),
    ]
    
    ASSESSMENT_CHOICES = [
        ('None', 'None'),
        ('Quiz', 'Quiz'),
        ('Assignment', 'Assignment'),
        ('Presentation', 'Presentation'),
        ('Practical', 'Practical Exam'),
        ('Combined', 'Combined Assessment'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    description = models.TextField(help_text="Detailed description of the training program")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Conference')
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    is_featured = models.BooleanField(default=False, help_text="Feature this program prominently")
    
    # Duration and Format
    duration = models.CharField(max_length=100, help_text="e.g., '2 days', '1 week', '3 months'")
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='In-person')
    location = models.CharField(max_length=200, help_text="Physical location or 'Online' for virtual programs")
    timezone = models.CharField(max_length=50, default='GMT')
    language = models.CharField(max_length=50, default='English')
    
    # Enrollment
    max_participants = models.PositiveIntegerField(
        default=50, 
        validators=[MinValueValidator(1)],
        help_text="Maximum number of participants"
    )
    current_enrollments = models.PositiveIntegerField(default=0)
    
    # Instructor and Content
    instructor = models.CharField(max_length=200)
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    registration_deadline = models.DateField()
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    
    # Media
    image = models.ImageField(
        upload_to='training_programs/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp'])]
    )
    image_url = models.URLField(blank=True, null=True, help_text="Optional: External image URL if no file uploaded")
    
    # JSON Fields for Arrays
    prerequisites = models.JSONField(default=list, help_text="List of prerequisites")
    learning_outcomes = models.JSONField(default=list, help_text="Expected learning outcomes")
    topics = models.JSONField(default=list, help_text="Main topics covered")
    target_audience = models.JSONField(default=list, help_text="Target audience categories")
    materials = models.JSONField(default=list, help_text="Required materials or resources")
    
    # Assessment and Certification
    certificate_type = models.CharField(
        max_length=100, 
        default='CME Certificate',
        help_text="Type of certificate awarded"
    )
    cme_credits = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100)],
        help_text="CME credits awarded"
    )
    assessment_method = models.CharField(
        max_length=20,
        choices=ASSESSMENT_CHOICES,
        default='None'
    )
    passing_score = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Minimum passing score percentage"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['category']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['start_date']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Ensure arrays are properly formatted
        if not isinstance(self.prerequisites, list):
            self.prerequisites = []
        if not isinstance(self.learning_outcomes, list):
            self.learning_outcomes = []
        if not isinstance(self.topics, list):
            self.topics = []
        if not isinstance(self.target_audience, list):
            self.target_audience = []
        if not isinstance(self.materials, list):
            self.materials = []
        
        # Validate dates
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("Start date cannot be after end date")
        
        if self.registration_deadline and self.start_date and self.registration_deadline > self.start_date:
            raise ValueError("Registration deadline cannot be after start date")
        
        super().save(*args, **kwargs)
    
    @property
    def image_url_final(self):
        """Return the final image URL - either uploaded image or provided URL"""
        if self.image:
            return self.image.url
        return self.image_url or ""
    
    @property
    def enrollment_percentage(self):
        """Calculate enrollment percentage"""
        if self.max_participants == 0:
            return 0
        return (self.current_enrollments / self.max_participants) * 100
    
    @property
    def is_full(self):
        """Check if program is fully enrolled"""
        return self.current_enrollments >= self.max_participants
    
    @property
    def spots_available(self):
        """Number of spots still available"""
        return max(0, self.max_participants - self.current_enrollments)
    
    def get_absolute_url(self):
        return reverse('training-program-detail', kwargs={'pk': self.pk})


class ScheduleItem(models.Model):
    """Schedule items for training programs"""
    
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name='schedule'
    )
    day = models.CharField(max_length=50, help_text="e.g., 'Day 1', 'Monday', '2024-01-15'")
    time = models.CharField(max_length=50, help_text="e.g., '09:00-10:00', '2:00 PM - 3:00 PM'")
    activity = models.CharField(max_length=200, help_text="Activity or session title")
    speaker = models.CharField(max_length=200, blank=True, help_text="Speaker or facilitator name")
    
    class Meta:
        ordering = ['day', 'time']
        indexes = [
            models.Index(fields=['program', 'day']),
        ]
    
    def __str__(self):
        return f"{self.program.title} - {self.day}: {self.activity}"


class Speaker(models.Model):
    """Speaker information for training programs"""
    
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name='speakers'
    )
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, help_text="Professional title")
    organization = models.CharField(max_length=200)
    bio = models.TextField(help_text="Brief biography")
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['program']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.title}"


class Registration(models.Model):
    """Registration model for participants"""
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Waitlisted', 'Waitlisted'),
        ('Cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Refunded', 'Refunded'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('Less than 1 year', 'Less than 1 year'),
        ('1-2 years', '1-2 years'),
        ('3-5 years', '3-5 years'),
        ('6-10 years', '6-10 years'),
        ('11-15 years', '11-15 years'),
        ('More than 15 years', 'More than 15 years'),
    ]
    
    # Program relationship
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    
    # Participant Information
    participant_name = models.CharField(max_length=200)
    participant_email = models.EmailField()
    participant_phone = models.CharField(max_length=20)
    organization = models.CharField(max_length=200)
    profession = models.CharField(max_length=100)
    experience = models.CharField(
        max_length=50, 
        choices=EXPERIENCE_CHOICES, 
        default='1-2 years' 
    )
    
    # Registration Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    
    # Additional Information
    special_requests = models.TextField(blank=True, help_text="Any special requests or requirements")
    
    # Timestamps
    registration_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['program', 'participant_email']
        ordering = ['-registration_date']
        indexes = [
            models.Index(fields=['program']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['-registration_date']),
        ]
    
    def __str__(self):
        return f"{self.participant_name} - {self.program.title}"
    
    def save(self, *args, **kwargs):
        # Auto-confirm if program isn't full
        if self.status == 'Pending' and not self.program.is_full:
            self.status = 'Confirmed'
        elif self.status == 'Confirmed' and self.program.is_full:
            # Move to waitlist if program becomes full
            self.status = 'Waitlisted'
        
        super().save(*args, **kwargs)
        
        # Update enrollment count
        self.update_enrollment_count()
    
    def delete(self, *args, **kwargs):
        program = self.program
        super().delete(*args, **kwargs)
        self.update_enrollment_count(program)
    
    def update_enrollment_count(self, program=None):
        """Update the enrollment count for the program"""
        if program is None:
            program = self.program
        
        confirmed_count = Registration.objects.filter(
            program=program,
            status='Confirmed'
        ).count()
        
        program.current_enrollments = confirmed_count
        program.save(update_fields=['current_enrollments'])
    
    @property
    def program_title(self):
        """Get program title for API compatibility"""
        return self.program.title if self.program else ""