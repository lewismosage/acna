from django.contrib import admin
from django.utils.html import format_html
from .models import ResearchProject, ResearchProjectView, ResearchProjectUpdate


@admin.register(ResearchProject)
class ResearchProjectAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'type', 'status', 'principal_investigator', 'start_date', 
        'end_date', 'ethics_approval', 'investigator_count', 'image_preview',
        'created_at'
    ]
    list_filter = [
        'status', 'type', 'ethics_approval', 'start_date', 'end_date', 
        'funding_source', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'principal_investigator', 'target_population',
        'methodology', 'registration_number', 'funding_source', 'keywords',
        'institutions', 'objectives'
    ]
    list_editable = ['status', 'ethics_approval']
    readonly_fields = [
        'created_at', 'updated_at', 'image_preview', 'investigator_count',
        'duration_days', 'is_active'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'type', 'status', 'principal_investigator',
                'registration_number'
            )
        }),
        ('Timeline', {
            'fields': (
                'start_date', 'end_date', 'duration_days'
            )
        }),
        ('Funding', {
            'fields': ('funding_source', 'funding_amount'),
            'classes': ('collapse',)
        }),
        ('Study Population', {
            'fields': ('target_population', 'sample_size')
        }),
        ('Study Details', {
            'fields': ('methodology', 'ethics_approval'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': ('image', 'image_preview', 'image_url'),
            'classes': ('collapse',)
        }),
        ('Research Team & Institutions', {
            'fields': ('investigators', 'institutions'),
            'description': 'JSON fields - use proper JSON format'
        }),
        ('Objectives & Keywords', {
            'fields': ('objectives', 'keywords'),
            'classes': ('collapse',),
            'description': 'JSON fields - use proper JSON format'
        }),
        ('Metadata', {
            'fields': ('investigator_count', 'is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image_url_display:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px;" />',
                obj.image_url_display
            )
        return "No Image"
    image_preview.short_description = "Image Preview"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def save_model(self, request, obj, form, change):
        # Ensure JSON fields are properly formatted
        if not isinstance(obj.investigators, list):
            obj.investigators = []
        if not isinstance(obj.institutions, list):
            obj.institutions = []
        if not isinstance(obj.objectives, list):
            obj.objectives = []
        if not isinstance(obj.keywords, list):
            obj.keywords = []
        
        super().save_model(request, obj, form, change)


@admin.register(ResearchProjectView)
class ResearchProjectViewAdmin(admin.ModelAdmin):
    list_display = ['research_project', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at', 'research_project__status', 'research_project__type']
    search_fields = ['research_project__title', 'ip_address']
    readonly_fields = ['research_project', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ResearchProjectUpdate)
class ResearchProjectUpdateAdmin(admin.ModelAdmin):
    list_display = ['research_project', 'title', 'update_type', 'created_at']
    list_filter = ['update_type', 'created_at', 'research_project__status']
    search_fields = ['research_project__title', 'title', 'description']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Update Information', {
            'fields': ('research_project', 'title', 'description', 'update_type')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )