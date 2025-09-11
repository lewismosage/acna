from django.contrib import admin
from django.utils.html import format_html
from .models import JournalArticle, JournalArticleDownload, JournalArticleView


@admin.register(JournalArticle)
class JournalArticleAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'authors', 'journal', 'status', 'relevance', 'study_type', 
        'view_count', 'download_count', 'created_at'
    ]
    list_filter = ['status', 'relevance', 'study_type', 'created_at', 'updated_at']
    search_fields = ['title', 'authors', 'journal', 'summary', 'abstract', 'tags', 'key_findings']
    list_editable = ['status', 'relevance']
    readonly_fields = [
        'view_count', 'download_count', 'created_at', 
        'updated_at', 'last_updated', 'publication_date'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'authors', 'journal', 'summary', 'abstract'
            )
        }),
        ('Research Details', {
            'fields': (
                'relevance', 'study_type', 'population', 'commentary'
            )
        }),
        ('Content Details', {
            'fields': ('key_findings', 'country_focus', 'tags'),
            'classes': ('collapse',)
        }),
        ('Status & Analytics', {
            'fields': ('status', 'view_count', 'download_count'),
        }),
        ('Timestamps', {
            'fields': ('publication_date', 'created_at', 'updated_at', 'last_updated'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(JournalArticleView)
class JournalArticleViewAdmin(admin.ModelAdmin):
    list_display = ['article', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['article__title', 'ip_address']
    readonly_fields = ['article', 'ip_address', 'user_agent', 'viewed_at']
    date_hierarchy = 'viewed_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(JournalArticleDownload)
class JournalArticleDownloadAdmin(admin.ModelAdmin):
    list_display = ['article', 'ip_address', 'downloaded_at']
    list_filter = ['downloaded_at']
    search_fields = ['article__title', 'ip_address']
    readonly_fields = ['article', 'ip_address', 'user_agent', 'downloaded_at']
    date_hierarchy = 'downloaded_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False