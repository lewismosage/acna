from django.contrib import admin
from django.utils.html import format_html
from .models import EducationalResource, CaseStudySubmission, ResourceView, ResourceDownload

@admin.register(EducationalResource)
class EducationalResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'resource_type', 'status', 'is_featured', 
        'download_count', 'view_count', 'image_preview', 'created_at'
    ]
    list_filter = ['status', 'is_featured', 'category', 'resource_type', 'created_at']
    search_fields = ['title', 'description', 'author', 'tags']
    list_editable = ['status', 'is_featured']
    readonly_fields = [
        'download_count', 'view_count', 'created_at', 
        'updated_at', 'image_preview'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'full_description', 'category', 
                'resource_type', 'condition', 'status', 'is_featured', 'is_free'
            )
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'file', 'file_url', 'video_url', 'external_url', 'image_preview')
        }),
        ('Content Details', {
            'fields': ('languages', 'tags', 'target_audience', 'related_conditions', 
                      'learning_objectives', 'prerequisites', 'references')
        }),
        ('Metadata', {
            'fields': ('age_group', 'difficulty', 'duration', 'file_size', 'file_format')
        }),
        ('Author Information', {
            'fields': ('author', 'reviewed_by', 'institution', 'location', 
                      'impact_statement', 'accreditation')
        }),
        ('Statistics', {
            'fields': ('download_count', 'view_count', 'rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('publication_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image_url_display():
            return format_html(
                '<img src="{}" style="width: 100px; height: 60px; object-fit: cover;" />',
                obj.image_url_display()
            )
        return "No Image"
    image_preview.short_description = "Image Preview"

@admin.register(CaseStudySubmission)
class CaseStudySubmissionAdmin(admin.ModelAdmin):
    list_display = ['title', 'submitted_by', 'institution', 'status', 'submission_date']
    list_filter = ['status', 'category', 'submission_date']
    search_fields = ['title', 'submitted_by', 'institution', 'excerpt']
    list_editable = ['status']
    readonly_fields = ['submission_date', 'review_date', 'published_date']
    
    fieldsets = (
        ('Submission Details', {
            'fields': (
                'title', 'submitted_by', 'institution', 'email', 'phone',
                'location', 'category', 'status'
            )
        }),
        ('Content', {
            'fields': ('excerpt', 'full_content', 'impact')
        }),
        ('Review', {
            'fields': ('review_notes', 'reviewed_by', 'review_date', 'published_date')
        }),
        ('Media', {
            'fields': ('attachments', 'image_url'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('submission_date',),
            'classes': ('collapse',)
        }),
    )

@admin.register(ResourceView)
class ResourceViewAdmin(admin.ModelAdmin):
    list_display = ['resource', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['resource__title', 'ip_address']
    readonly_fields = ['resource', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(ResourceDownload)
class ResourceDownloadAdmin(admin.ModelAdmin):
    list_display = ['resource', 'ip_address', 'downloaded_at']
    list_filter = ['downloaded_at']
    search_fields = ['resource__title', 'ip_address']
    readonly_fields = ['resource', 'ip_address', 'user_agent', 'downloaded_at']
    date_hierarchy = 'downloaded_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False