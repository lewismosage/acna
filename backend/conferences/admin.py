from django.contrib import admin
from django.utils.html import format_html
from .models import Conference, Speaker, Session, Registration, ConferenceView

@admin.register(Conference)
class ConferenceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'type', 'status', 'location', 'date',
        'registration_count', 'capacity', 'image_preview'
    ]
    list_filter = ['status', 'type', 'created_at']
    search_fields = ['title', 'description', 'location', 'theme']
    list_editable = ['status']
    readonly_fields = ['registration_count', 'created_at', 'updated_at', 'image_preview']
    # Removed filter_horizontal as it's not applicable for TextField
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'theme', 'description', 'full_description',
                'date', 'time', 'location', 'venue', 'type', 'status'
            )
        }),
        ('Image', {
            'fields': ('image', 'image_url', 'image_preview')
        }),
        ('Registration', {
            'fields': (
                'capacity', 'regular_fee', 'early_bird_fee',
                'early_bird_deadline', 'expected_attendees',
                'countries_represented', 'registration_count'
            )
        }),
        ('Organizer', {
            'fields': (
                'organizer_name', 'organizer_email',
                'organizer_phone', 'organizer_website'
            )
        }),
        ('Highlights', {
            'fields': ('highlights',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image_url_display:
            return format_html(
                '<img src="{}" style="width: 100px; height: 60px; object-fit: cover;" />',
                obj.image_url_display
            )
        return "No Image"
    image_preview.short_description = "Image Preview"

@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    list_display = ['name', 'conference', 'organization', 'is_keynote', 'image_preview']
    list_filter = ['is_keynote', 'conference']
    search_fields = ['name', 'organization', 'conference__title']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image_url_display:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover;" />',
                obj.image_url_display
            )
        return "No Image"
    image_preview.short_description = "Image Preview"

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'conference', 'session_type', 'start_time', 'duration_display']
    list_filter = ['session_type', 'conference']
    search_fields = ['title', 'conference__title']
    
    def duration_display(self, obj):
        return obj.duration_display
    duration_display.short_description = "Duration"

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'conference', 'registration_type', 'payment_status', 'registered_at']
    list_filter = ['payment_status', 'registration_type', 'conference']
    search_fields = ['first_name', 'last_name', 'email', 'organization', 'conference__title']
    readonly_fields = ['registered_at']
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = "Name"

@admin.register(ConferenceView)
class ConferenceViewAdmin(admin.ModelAdmin):
    list_display = ['conference', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at', 'conference']
    search_fields = ['conference__title', 'ip_address']
    readonly_fields = ['conference', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False