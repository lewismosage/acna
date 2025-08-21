from django.contrib import admin
from django.utils.html import format_html
from .models import Abstract, Author

class AuthorInline(admin.TabularInline):
    model = Author
    extra = 1
    fields = ['first_name', 'last_name', 'email', 'institution', 'country', 'is_presenter', 'is_corresponding', 'order']

@admin.register(Abstract)
class AbstractAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'submitted_date', 'is_featured', 'abstract_file_link']
    list_filter = ['status', 'category', 'presentation_preference', 'is_featured', 'submitted_date']
    search_fields = ['title', 'authors__first_name', 'authors__last_name', 'keywords']
    list_editable = ['status', 'is_featured']
    readonly_fields = ['submitted_date', 'created_at', 'updated_at']
    inlines = [AuthorInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'category', 'presentation_preference', 'keywords')
        }),
        ('Abstract Content', {
            'fields': ('background', 'methods', 'results', 'conclusions', 'conflict_of_interest')
        }),
        ('Status and Review', {
            'fields': ('status', 'reviewer_comments', 'assigned_reviewer', 'is_featured')
        }),
        ('Files', {
            'fields': ('abstract_file', 'ethical_approval_file', 'supplementary_files')
        }),
        ('Metadata', {
            'fields': ('submitted_date', 'created_at', 'updated_at')
        }),
    )
    
    def abstract_file_link(self, obj):
        if obj.abstract_file_url:
            return format_html(
                '<a href="{}" target="_blank">View Abstract</a>',
                obj.abstract_file_url
            )
        return "No File"
    abstract_file_link.short_description = "Abstract File"

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'institution', 'country', 'is_presenter', 'is_corresponding', 'abstract_title']
    list_filter = ['country', 'is_presenter', 'is_corresponding']
    search_fields = ['first_name', 'last_name', 'email', 'institution']
    
    def abstract_title(self, obj):
        return obj.abstract.title
    abstract_title.short_description = "Abstract"