from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Q
from .models import GalleryItem, Story, GalleryStats


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    """Admin interface for Gallery Items"""
    
    list_display = [
        'title', 'type', 'category', 'status', 'is_featured',
        'event_date', 'location', 'view_count', 'created_at', 'media_preview'
    ]
    
    list_filter = [
        'type', 'category', 'status', 'is_featured', 'created_at'
    ]
    
    search_fields = [
        'title', 'description', 'location', 'category'
    ]
    
    list_editable = ['status', 'is_featured']
    
    readonly_fields = [
        'slug', 'view_count', 'created_at', 'updated_at', 'media_preview_large'
    ]
    
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'type', 'category', 'description', 'slug')
        }),
        ('Media Files', {
            'fields': ('image', 'video', 'thumbnail', 'media_preview_large'),
            'description': 'Upload main media file based on type (image for photos, video for videos)'
        }),
        ('Event Details', {
            'fields': ('event_date', 'location', 'duration'),
            'classes': ('collapse',)
        }),
        ('Status & Settings', {
            'fields': ('status', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'make_published', 'make_draft', 'make_archived',
        'make_featured', 'make_unfeatured'
    ]
    
    def media_preview(self, obj):
        """Show small media preview in list view"""
        if obj.thumbnail_url:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.thumbnail_url
            )
        return "No media"
    media_preview.short_description = "Preview"
    
    def media_preview_large(self, obj):
        """Show large media preview in detail view"""
        if obj.thumbnail_url:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px;" />',
                obj.thumbnail_url
            )
        return "No media available"
    media_preview_large.short_description = "Media Preview"
    
    def make_published(self, request, queryset):
        """Bulk action to publish gallery items"""
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} gallery items were successfully published.')
    make_published.short_description = "Mark selected items as published"
    
    def make_draft(self, request, queryset):
        """Bulk action to make gallery items draft"""
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} gallery items were moved to draft.')
    make_draft.short_description = "Mark selected items as draft"
    
    def make_archived(self, request, queryset):
        """Bulk action to archive gallery items"""
        updated = queryset.update(status='archived')
        self.message_user(request, f'{updated} gallery items were archived.')
    make_archived.short_description = "Mark selected items as archived"
    
    def make_featured(self, request, queryset):
        """Bulk action to feature gallery items"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} gallery items were featured.')
    make_featured.short_description = "Mark selected items as featured"
    
    def make_unfeatured(self, request, queryset):
        """Bulk action to unfeature gallery items"""
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} gallery items were unfeatured.')
    make_unfeatured.short_description = "Remove featured status from selected items"
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related()


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    """Admin interface for Stories"""
    
    list_display = [
        'title', 'patient_name', 'age', 'condition', 'status',
        'is_featured', 'location', 'story_date', 'view_count',
        'created_at', 'image_preview'
    ]
    
    list_filter = [
        'status', 'is_featured', 'condition', 'age', 'created_at'
    ]
    
    search_fields = [
        'title', 'patient_name', 'condition', 'story', 'location'
    ]
    
    list_editable = ['status', 'is_featured']
    
    readonly_fields = [
        'slug', 'view_count', 'created_at', 'updated_at', 'image_preview_large'
    ]
    
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Story Information', {
            'fields': ('title', 'patient_name', 'age', 'condition', 'slug')
        }),
        ('Story Content', {
            'fields': ('story', 'image', 'image_preview_large')
        }),
        ('Location & Date', {
            'fields': ('location', 'story_date'),
            'classes': ('collapse',)
        }),
        ('Status & Settings', {
            'fields': ('status', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'make_published', 'make_draft', 'make_archived',
        'make_featured', 'make_unfeatured'
    ]
    
    def image_preview(self, obj):
        """Show small image preview in list view"""
        if obj.image_url:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_url
            )
        return "No image"
    image_preview.short_description = "Preview"
    
    def image_preview_large(self, obj):
        """Show large image preview in detail view"""
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px;" />',
                obj.image_url
            )
        return "No image available"
    image_preview_large.short_description = "Image Preview"
    
    def make_published(self, request, queryset):
        """Bulk action to publish stories"""
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} stories were successfully published.')
    make_published.short_description = "Mark selected stories as published"
    
    def make_draft(self, request, queryset):
        """Bulk action to make stories draft"""
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} stories were moved to draft.')
    make_draft.short_description = "Mark selected stories as draft"
    
    def make_archived(self, request, queryset):
        """Bulk action to archive stories"""
        updated = queryset.update(status='archived')
        self.message_user(request, f'{updated} stories were archived.')
    make_archived.short_description = "Mark selected stories as archived"
    
    def make_featured(self, request, queryset):
        """Bulk action to feature stories"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} stories were featured.')
    make_featured.short_description = "Mark selected stories as featured"
    
    def make_unfeatured(self, request, queryset):
        """Bulk action to unfeature stories"""
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} stories were unfeatured.')
    make_unfeatured.short_description = "Remove featured status from selected stories"


@admin.register(GalleryStats)
class GalleryStatsAdmin(admin.ModelAdmin):
    """Admin interface for Gallery Statistics"""
    
    list_display = [
        'total_gallery_items', 'published_gallery_items',
        'total_stories', 'published_stories', 'total_views',
        'last_updated'
    ]
    
    readonly_fields = [
        'total_gallery_items', 'published_gallery_items',
        'total_stories', 'published_stories', 'total_views',
        'last_updated'
    ]
    
    def has_add_permission(self, request):
        """Prevent adding new stats objects"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deleting stats objects"""
        return False
    
    actions = ['refresh_stats']
    
    def refresh_stats(self, request, queryset):
        """Refresh gallery statistics"""
        GalleryStats.update_stats()
        self.message_user(request, 'Gallery statistics have been refreshed.')
    refresh_stats.short_description = "Refresh statistics"


# Custom admin site configuration
admin.site.site_header = "African Child Neurology Association"
admin.site.site_title = "Admin"
admin.site.index_title = "Welcome to ACNA Administration"