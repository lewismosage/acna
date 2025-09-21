from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator
from django.utils import timezone
from datetime import timedelta
import random
import string
import uuid


class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    membership_class = models.CharField(max_length=50, blank=True)
    membership_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    is_active_member = models.BooleanField(default=False)
    membership_valid_until = models.DateField(null=True, blank=True)
    institution = models.CharField(max_length=255, blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    specialization = models.CharField(max_length=255, blank=True, null=True)
    is_admin = models.BooleanField(default=False)

    MEMBERSHIP_CHOICES = [
        ('full_professional', 'Full / Professional Member'),
        ('associate', 'Associate Member'),
        ('student', 'Trainee / Student Member'),
        ('institutional', 'Institutional Member'),
        ('affiliate', 'Affiliate Member'),
        ('honorary', 'Honorary Member'),
        ('corporate', 'Corporate / Partner Member'),
        ('lifetime', 'Lifetime Member'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    # Common fields for all users
    mobile_number = models.CharField(max_length=20)
    physical_address = models.TextField()
    country = models.CharField(max_length=100)
    
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    age_bracket = models.CharField(max_length=10, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    # Fields for individual members
    membership_class = models.CharField(max_length=20, choices=MEMBERSHIP_CHOICES, blank=True, null=True)

    # Fields for organizational members
    is_organization = models.BooleanField(default=False)
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    organization_type = models.CharField(max_length=100, blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    contact_person_title = models.CharField(max_length=100, blank=True, null=True)
    organization_phone = models.CharField(max_length=20, blank=True, null=True)
    organization_address = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        if self.is_organization:
            return f"{self.organization_name} (Organization)"
        return f"{self.get_full_name()} ({self.username})"
    
    @property
    def is_membership_active(self):
        """Check if membership is currently valid"""
        if self.membership_valid_until:
            return self.is_active_member and timezone.now().date() <= self.membership_valid_until
        return False

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.is_admin = True
        super().save(*args, **kwargs)


class VerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, validators=[MinLengthValidator(6)])
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @classmethod
    def generate_code(cls):
        return ''.join(random.choices(string.digits, k=6))

    def __str__(self):
        return f"Verification code for {self.user.email}"

    class Meta:
        ordering = ['-created_at']

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)  # 1 hour expiry
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired
    
    def __str__(self):
        return f"Password reset token for {self.user.email}"