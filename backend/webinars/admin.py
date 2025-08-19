from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Webinar, Speaker, Registration, 
    WebinarTag, WebinarLanguage, 
    WebinarAudience, WebinarObjective,
    WebinarView
)

class SpeakerInline(admin.TabularInline):
    model = Speaker
    extra = 1
    fields = ['name', 'credentials', 'affiliation', 'image_url_display']
    readonly_fields = ['image_url_display']
    
    def image_url_display(self, obj):
        if obj.image_url_display:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.image_url_display
            )
        return "No Image"
    image_url_display.short_description = "Image"

class WebinarTagInline(admin.TabularInline):
    model = WebinarTag
    extra = 1

class WebinarLanguageInline(admin.TabularInline):
    model = WebinarLanguage
    extra = 1

class WebinarAudienceInline(admin.TabularInline):
    model = WebinarAudience
    extra = 1

class WebinarObjectiveInline(admin.TabularInline):
    model = WebinarObjective
    extra = 1

@admin.register(Webinar)
class WebinarAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'date', 'time', 
        'status', 'type', 'is_featured', 
        'registration_count', 'capacity', 
        'registration_progress', 'image_preview'
    ]
    list_filter = ['status', 'type', 'is_featured', 'category', 'date']
    search_fields = ['title', 'description', 'category']
    list_editable = ['status', 'is_featured']
    readonly_fields = [
        'registration_count', 'registration_progress', 
        'created_at', 'updated_at', 'image_preview'
    ]
    inlines = [
        SpeakerInline, WebinarTagInline, 
        WebinarLanguageInline, WebinarAudienceInline,
        WebinarObjectiveInline
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'category', 
                'date', 'time', 'duration', 
                'status', 'type', 'is_featured',
                'capacity', 'registration_count', 'registration_progress'
            )
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'image_preview')
        }),
        ('Links', {
            'fields': ('registration_link', 'recording_link', 'slides_link'),
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
    list_display = [
        'attendee_name', 'webinar', 'email', 
        'registration_type', 'payment_status',
        'amount', 'registration_date'
    ]
    list_filter = [
        'registration_type', 'payment_status', 
        'registration_date', 'webinar'
    ]
    search_fields = [
        'attendee_name', 'email', 
        'organization', 'webinar__title'
    ]
    list_editable = ['payment_status']
    readonly_fields = ['registration_date']

@admin.register(WebinarView)
class WebinarViewAdmin(admin.ModelAdmin):
    list_display = ['webinar', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['webinar__title', 'ip_address']
    readonly_fields = ['webinar', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False