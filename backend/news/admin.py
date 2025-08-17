from django.contrib import admin
from django.utils.html import format_html
from .models import NewsItem, NewsView

@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'type', 'status', 'category', 'is_featured', 
        'views', 'date', 'created_at', 'image_preview'
    ]
    list_filter = ['status', 'type', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'subtitle', 'introduction', 'tags']
    list_editable = ['status', 'is_featured']
    readonly_fields = ['views', 'created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'subtitle', 'type', 'status', 'category', 
                'date', 'read_time', 'is_featured'
            )
        }),
        ('Content', {
            'fields': ('introduction', 'conclusion', 'tags')
        }),
        ('Image', {
            'fields': ('image', 'image_url', 'image_preview')
        }),
        ('Author', {
            'fields': (
                'author_name', 'author_title', 
                'author_organization', 'author_bio', 'author_image_url'
            ),
            'classes': ('collapse',)
        }),
        ('Source', {
            'fields': ('source_name', 'source_url'),
            'classes': ('collapse',)
        }),
        ('Contact', {
            'fields': ('contact_name', 'contact_email', 'contact_phone'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('views', 'created_at', 'updated_at'),
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

@admin.register(NewsView)
class NewsViewAdmin(admin.ModelAdmin):
    list_display = ['news_item', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['news_item__title', 'ip_address']
    readonly_fields = ['news_item', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False