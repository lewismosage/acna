from django.contrib import admin
from django.utils.html import format_html
from .models import Conference, Registration, ConferenceView

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
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'date', 'location', 'venue', 'type', 'status',
                'theme', 'description'
            )
        }),
        ('Image', {
            'fields': ('image', 'image_url', 'image_preview')
        }),
        ('Attendance', {
            'fields': ('attendees', 'speakers', 'countries')
        }),
        ('Registration', {
            'fields': (
                'early_bird_deadline', 'regular_fee', 'early_bird_fee',
                'registration_count', 'capacity'
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

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'conference', 'registration_type', 'payment_status', 'registration_date']
    list_filter = ['payment_status', 'registration_type', 'registration_date']
    search_fields = ['name', 'email', 'organization', 'conference__title']
    raw_id_fields = ['conference']

@admin.register(ConferenceView)
class ConferenceViewAdmin(admin.ModelAdmin):
    list_display = ['conference', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['conference__title', 'ip_address']
    readonly_fields = ['conference', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False