from django.contrib import admin
from django.utils.html import format_html
from .models import PatientResource, ResourceTag, ResourceLanguage, ResourceAudience, ResourceView, ResourceDownload

class ResourceTagInline(admin.TabularInline):
    model = ResourceTag
    extra = 1

class ResourceLanguageInline(admin.TabularInline):
    model = ResourceLanguage
    extra = 1

class ResourceAudienceInline(admin.TabularInline):
    model = ResourceAudience
    extra = 1

@admin.register(PatientResource)
class PatientResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'type', 'condition', 
        'status', 'is_featured', 'download_count', 
        'view_count', 'image_preview', 'created_at'
    ]
    list_filter = ['status', 'type', 'is_featured', 'category', 'condition', 'created_at']
    search_fields = ['title', 'description', 'category', 'condition', 'author']
    list_editable = ['status', 'is_featured']
    readonly_fields = [
        'download_count', 'view_count', 'created_at', 
        'updated_at', 'last_review_date', 'image_preview'
    ]
    inlines = [ResourceTagInline, ResourceLanguageInline, ResourceAudienceInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'full_description', 'category', 
                'type', 'condition', 'status', 'is_featured', 'is_free'
            )
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'file', 'file_url', 'external_url', 'image_preview')
        }),
        ('Metadata', {
            'fields': ('age_group', 'difficulty', 'duration')
        }),
        ('Statistics', {
            'fields': ('download_count', 'view_count', 'rating'),
            'classes': ('collapse',)
        }),
        ('Authorship', {
            'fields': ('author', 'reviewed_by'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_review_date'),
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