from django.contrib import admin
from django.utils.html import format_html
from .models import Publication, PublicationDownload, PublicationView


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'type', 'category', 'status', 'is_featured', 'downloads', 
        'view_count', 'citation_count', 'image_preview', 'date'
    ]
    list_filter = ['status', 'type', 'access_type', 'is_featured', 'category', 'language', 'date']
    search_fields = ['title', 'excerpt', 'abstract', 'category', 'journal', 'authors', 'keywords']
    list_editable = ['status', 'is_featured']
    readonly_fields = [
        'downloads', 'view_count', 'citation_count', 'date', 'created_at', 
        'updated_at', 'image_preview'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'excerpt', 'abstract', 'full_content', 'type', 
                'category', 'status', 'is_featured'
            )
        }),
        ('Publication Details', {
            'fields': (
                'journal', 'volume', 'issue', 'pages', 'publisher', 
                'isbn', 'language', 'access_type'
            )
        }),
        ('Media & Links', {
            'fields': ('image', 'image_preview', 'download_url', 'external_url')
        }),
        ('Authors & Audience', {
            'fields': ('authors', 'target_audience'),
            'description': 'JSON fields - use proper JSON format'
        }),
        ('Classification', {
            'fields': ('tags', 'keywords'),
            'classes': ('collapse',),
            'description': 'JSON fields - use proper JSON format'
        }),
        ('Statistics', {
            'fields': ('downloads', 'view_count', 'citation_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('date', 'created_at', 'updated_at'),
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

    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(PublicationView)
class PublicationViewAdmin(admin.ModelAdmin):
    list_display = ['publication', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['publication__title', 'ip_address']
    readonly_fields = ['publication', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(PublicationDownload)
class PublicationDownloadAdmin(admin.ModelAdmin):
    list_display = ['publication', 'ip_address', 'downloaded_at']
    list_filter = ['downloaded_at']
    search_fields = ['publication__title', 'ip_address']
    readonly_fields = ['publication', 'ip_address', 'user_agent', 'downloaded_at']
    date_hierarchy = 'downloaded_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False