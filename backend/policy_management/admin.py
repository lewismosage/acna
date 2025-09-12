from django.contrib import admin
from django.utils.html import format_html
from .models import PolicyBelief, PositionalStatement, ContentView, ContentDownload


@admin.register(PolicyBelief)
class PolicyBeliefAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'status', 'priority', 'view_count', 
        'download_count', 'created_at', 'image_thumbnail'
    ]
    list_filter = ['status', 'priority', 'category', 'created_at', 'updated_at']
    search_fields = ['title', 'summary', 'tags', 'target_audience', 'key_recommendations']
    list_editable = ['status', 'priority']
    readonly_fields = [
        'view_count', 'download_count', 'created_at', 'updated_at', 'image_url_final'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'category', 'summary', 'status')
        }),
        ('Policy Details', {
            'fields': ('priority', 'target_audience', 'key_recommendations', 'region')
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'image_url_final'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        ('Analytics', {
            'fields': ('view_count', 'download_count'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_thumbnail(self, obj):
        """Display image thumbnail in admin list"""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        elif obj.image_url:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_url
            )
        return "No image"
    image_thumbnail.short_description = "Image"
    
    def get_queryset(self, request):
        return super().get_queryset(request)


@admin.register(PositionalStatement)
class PositionalStatementAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'status', 'page_count', 'view_count', 
        'download_count', 'created_at', 'image_thumbnail'
    ]
    list_filter = ['status', 'category', 'page_count', 'created_at', 'updated_at']
    search_fields = ['title', 'summary', 'tags', 'key_points', 'country_focus']
    list_editable = ['status']
    readonly_fields = [
        'view_count', 'download_count', 'created_at', 'updated_at', 'image_url_final'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'category', 'summary', 'status', 'page_count')
        }),
        ('Statement Details', {
            'fields': ('key_points', 'country_focus', 'related_policies')
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'image_url_final'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        ('Analytics', {
            'fields': ('view_count', 'download_count'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_thumbnail(self, obj):
        """Display image thumbnail in admin list"""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        elif obj.image_url:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_url
            )
        return "No image"
    image_thumbnail.short_description = "Image"
    
    def get_queryset(self, request):
        return super().get_queryset(request)


@admin.register(ContentView)
class ContentViewAdmin(admin.ModelAdmin):
    list_display = ['content_type', 'content_id', 'ip_address', 'viewed_at']
    list_filter = ['content_type', 'viewed_at']
    search_fields = ['content_id', 'ip_address']
    readonly_fields = ['content_type', 'content_id', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ContentDownload)
class ContentDownloadAdmin(admin.ModelAdmin):
    list_display = ['content_type', 'content_id', 'ip_address', 'downloaded_at']
    list_filter = ['content_type', 'downloaded_at']
    search_fields = ['content_id', 'ip_address']
    readonly_fields = ['content_type', 'content_id', 'ip_address', 'user_agent', 'downloaded_at']
    date_hierarchy = 'downloaded_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False