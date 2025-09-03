from django.contrib import admin
from django.utils.html import format_html
from .models import EBooklet, EBookletDownload, EBookletView

@admin.register(EBooklet)
class EBookletAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'status', 'is_featured', 'download_count', 
        'view_count', 'image_preview', 'created_at'
    ]
    list_filter = ['status', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'description', 'abstract', 'category', 'authors']
    list_editable = ['status', 'is_featured']
    readonly_fields = [
        'download_count', 'view_count', 'created_at', 
        'updated_at', 'last_updated', 'image_preview'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'abstract', 'category', 
                'status', 'is_featured'
            )
        }),
        ('Media', {
            'fields': ('image', 'file', 'image_preview')
        }),
        ('Metadata', {
            'fields': ('authors', 'target_audience', 'pages', 'file_formats', 'language')
        }),
        ('Publication Details', {
            'fields': ('isbn', 'publisher', 'edition', 'publication_date'),
            'classes': ('collapse',)
        }),
        ('Content Details', {
            'fields': ('table_of_contents', 'keywords', 'tags'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('download_count', 'view_count', 'rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_updated'),
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

@admin.register(EBookletView)
class EBookletViewAdmin(admin.ModelAdmin):
    list_display = ['ebooklet', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['ebooklet__title', 'ip_address']
    readonly_fields = ['ebooklet', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(EBookletDownload)
class EBookletDownloadAdmin(admin.ModelAdmin):
    list_display = ['ebooklet', 'ip_address', 'downloaded_at']
    list_filter = ['downloaded_at']
    search_fields = ['ebooklet__title', 'ip_address']
    readonly_fields = ['ebooklet', 'ip_address', 'user_agent', 'downloaded_at']
    date_hierarchy = 'downloaded_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False