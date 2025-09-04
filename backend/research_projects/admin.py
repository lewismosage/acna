from django.contrib import admin
from django.utils.html import format_html
from .models import (
    ResearchProject, ResearchProjectView, ResearchProjectUpdate,
    ResearchPaper, ResearchPaperFile, ResearchPaperReview, ResearchPaperComment
)


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


# NEW ADMIN CLASSES FOR RESEARCH PAPER MODELS

class ResearchPaperFileInline(admin.TabularInline):
    model = ResearchPaperFile
    extra = 0
    readonly_fields = ['uploaded_at']
    fields = ['file', 'file_type', 'description', 'uploaded_at']


class ResearchPaperReviewInline(admin.TabularInline):
    model = ResearchPaperReview
    extra = 0
    readonly_fields = ['assigned_at']
    fields = ['reviewer_name', 'reviewer_email', 'review_status', 'recommendation', 'assigned_at']


@admin.register(ResearchPaper)
class ResearchPaperAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'research_type', 'status', 'author_count', 
        'ethics_approval', 'submission_date', 'corresponding_author_name'
    ]
    list_filter = [
        'status', 'research_type', 'category', 'ethics_approval', 
        'submission_date', 'study_design'
    ]
    search_fields = [
        'title', 'abstract', 'keywords', 'participants', 'funding_source',
        'target_journal', 'authors', 'acknowledgments'
    ]
    list_editable = ['status']
    readonly_fields = [
        'submission_date', 'last_modified', 'corresponding_author', 
        'author_count', 'is_under_review'
    ]
    inlines = [ResearchPaperFileInline, ResearchPaperReviewInline]
    date_hierarchy = 'submission_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'abstract', 'keywords', 'research_type', 'category'
            )
        }),
        ('Study Details', {
            'fields': (
                'study_design', 'participants', 'ethics_approval', 'ethics_number'
            )
        }),
        ('Authors & Affiliation', {
            'fields': (
                'authors', 'corresponding_author', 'author_count'
            ),
            'description': 'Authors field uses JSON format'
        }),
        ('Funding & Compliance', {
            'fields': (
                'funding_source', 'conflict_of_interest', 'acknowledgments'
            ),
            'classes': ('collapse',)
        }),
        ('Publication Details', {
            'fields': (
                'target_journal', 'status', 'review_deadline'
            )
        }),
        ('Files', {
            'fields': ('manuscript_file',)
        }),
        ('Project Association', {
            'fields': ('research_project',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'is_under_review', 'submission_date', 'last_modified'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def corresponding_author_name(self, obj):
        """Display corresponding author name"""
        if obj.corresponding_author:
            return obj.corresponding_author.get('name', 'Unknown')
        return 'Not specified'
    corresponding_author_name.short_description = 'Corresponding Author'
    
    def save_model(self, request, obj, form, change):
        # Ensure JSON fields are properly formatted
        if not isinstance(obj.authors, list):
            obj.authors = []
        if not isinstance(obj.keywords, list):
            obj.keywords = []
        
        super().save_model(request, obj, form, change)


@admin.register(ResearchPaperFile)
class ResearchPaperFileAdmin(admin.ModelAdmin):
    list_display = [
        'research_paper', 'file_name', 'file_type', 'description', 'uploaded_at'
    ]
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['research_paper__title', 'description']
    readonly_fields = ['uploaded_at']
    date_hierarchy = 'uploaded_at'
    
    def file_name(self, obj):
        """Display file name"""
        if obj.file:
            return obj.file.name.split('/')[-1]
        return 'No file'
    file_name.short_description = 'File Name'


@admin.register(ResearchPaperReview)
class ResearchPaperReviewAdmin(admin.ModelAdmin):
    list_display = [
        'research_paper', 'reviewer_name', 'review_status', 'recommendation', 
        'assigned_at', 'completed_at'
    ]
    list_filter = [
        'review_status', 'recommendation', 'assigned_at', 'completed_at'
    ]
    search_fields = [
        'research_paper__title', 'reviewer_name', 'reviewer_email', 'comments'
    ]
    readonly_fields = ['assigned_at']
    date_hierarchy = 'assigned_at'
    
    fieldsets = (
        ('Review Assignment', {
            'fields': (
                'research_paper', 'reviewer_name', 'reviewer_email', 'assigned_at'
            )
        }),
        ('Review Details', {
            'fields': (
                'review_status', 'recommendation', 'comments', 'completed_at'
            )
        }),
    )


@admin.register(ResearchPaperComment)
class ResearchPaperCommentAdmin(admin.ModelAdmin):
    list_display = [
        'research_paper', 'commenter_name', 'is_internal', 'created_at'
    ]
    list_filter = ['is_internal', 'created_at']
    search_fields = [
        'research_paper__title', 'commenter_name', 'commenter_email', 'comment'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Comment Information', {
            'fields': (
                'research_paper', 'commenter_name', 'commenter_email', 
                'comment', 'is_internal'
            )
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )