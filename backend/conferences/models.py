from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.conf import settings
import json
from datetime import datetime, timedelta  # Add this import at the top

class Conference(models.Model):
    CONFERENCE_TYPES = (
        ('in_person', 'In Person'),
        ('virtual', 'Virtual'),
        ('hybrid', 'Hybrid'),
    )

    STATUS_CHOICES = (
        ('planning', 'Planning'),
        ('registration_open', 'Registration Open'),
        ('coming_soon', 'Coming Soon'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    title = models.CharField(max_length=200)
    theme = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField()
    full_description = models.TextField(blank=True, null=True)
    date = models.DateField()
    time = models.TimeField(blank=True, null=True)
    location = models.CharField(max_length=200)
    venue = models.CharField(max_length=200, blank=True, null=True)
    type = models.CharField(max_length=20, choices=CONFERENCE_TYPES, default='in_person')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    image = models.ImageField(upload_to='conference_images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    regular_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    early_bird_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    early_bird_deadline = models.DateField(blank=True, null=True)
    expected_attendees = models.PositiveIntegerField(blank=True, null=True)
    countries_represented = models.PositiveIntegerField(blank=True, null=True)
    highlights = models.TextField(blank=True, null=True)  # Stored as JSON string
    organizer_name = models.CharField(max_length=200, default='African Child Neurology Association (ACNA)')
    organizer_email = models.EmailField(blank=True, null=True)
    organizer_phone = models.CharField(max_length=20, blank=True, null=True)
    organizer_website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def registration_count(self):
        return self.registrations.count()

    @property
    def image_url_display(self):
        if self.image:
            return self.image.url
        return self.image_url

    @property
    def highlights_list(self):
        """Convert highlights text field to list"""
        if self.highlights:
            try:
                return json.loads(self.highlights)
            except json.JSONDecodeError:
                return []
        return []

    def save(self, *args, **kwargs):
        """Convert list highlights to JSON string before saving"""
        if isinstance(self.highlights, list):
            self.highlights = json.dumps(self.highlights)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Speaker(models.Model):
    conference = models.ForeignKey(Conference, related_name='speakers', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='speaker_images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    expertise = models.TextField(blank=True, null=True)  # Stored as JSON string
    is_keynote = models.BooleanField(default=False)
    email = models.EmailField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def image_url_display(self):
        if self.image:
            return self.image.url
        return self.image_url

    @property
    def expertise_list(self):
        """Convert expertise text field to list"""
        if self.expertise:
            try:
                return json.loads(self.expertise)
            except json.JSONDecodeError:
                return []
        return []

    def save(self, *args, **kwargs):
        """Convert list expertise to JSON string before saving"""
        if isinstance(self.expertise, list):
            self.expertise = json.dumps(self.expertise)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.conference.title}"

class Session(models.Model):
    SESSION_TYPES = (
        ('presentation', 'Presentation'),
        ('workshop', 'Workshop'),
        ('panel', 'Panel Discussion'),
        ('keynote', 'Keynote'),
        ('break', 'Break'),
        ('registration', 'Registration'),
        ('social', 'Social Event'),
        ('networking', 'Networking'),
    )

    conference = models.ForeignKey(Conference, related_name='sessions', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=60, validators=[MinValueValidator(1)])
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES, default='presentation')
    location = models.CharField(max_length=200, blank=True, null=True)
    speaker_names = models.CharField(max_length=300, blank=True, null=True)
    moderator = models.CharField(max_length=200, blank=True, null=True)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    materials_required = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def end_time(self):
        if self.start_time and self.duration_minutes:
            # Create a dummy datetime to perform the time calculation
            dummy_date = datetime(2000, 1, 1)  # Using arbitrary date
            start_datetime = datetime.combine(dummy_date, self.start_time)
            end_datetime = start_datetime + timedelta(minutes=self.duration_minutes)
            return end_datetime.time()
        return None

    @property
    def duration_display(self):
        hours = self.duration_minutes // 60
        minutes = self.duration_minutes % 60
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"

    def __str__(self):
        return f"{self.title} - {self.conference.title}"

class Registration(models.Model):
    REGISTRATION_TYPES = (
        ('early_bird', 'Early Bird'),
        ('regular', 'Regular'),
        ('student', 'Student'),
        ('speaker', 'Speaker'),
        ('sponsor', 'Sponsor'),
    )

    PAYMENT_STATUSES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    conference = models.ForeignKey(Conference, related_name='registrations', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True, null=True)
    job_title = models.CharField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    registration_type = models.CharField(max_length=20, choices=REGISTRATION_TYPES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUSES, default='pending')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    dietary_requirements = models.TextField(blank=True, null=True)
    accessibility_needs = models.TextField(blank=True, null=True)
    registered_at = models.DateTimeField(default=timezone.now)
    unique_together = ['conference', 'email'] 

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} - {self.conference.title}"

class ConferenceView(models.Model):
    conference = models.ForeignKey(Conference, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Conference View"
        verbose_name_plural = "Conference Views"

    def __str__(self):
        return f"{self.conference.title} viewed by {self.ip_address}"