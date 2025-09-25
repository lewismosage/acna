# careers/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import JobOpportunity, JobApplication, VolunteerSubmission


@admin.register(JobOpportunity)
class JobOpportunityAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'department', 'location', 'type', 'level', 'status',
        'applications_count_display', 'posted_date', 'closing_date', 'created_at'
    ]
    list_filter = ['status', 'type', 'level', 'department', 'location', 'created_at', 'closing_date']
    search_fields = ['title', 'description', 'department', 'location']
    list_editable = ['status']
    readonly_fields = ['applications_count_display', 'created_at', 'updated_at', 'posted_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'department', 'location', 'type', 'level', 'status',
                'description', 'salary', 'work_arrangement'
            )
        }),
        ('Dates', {
            'fields': ('closing_date', 'contract_duration', 'posted_date')
        }),
        ('Responsibilities', {
            'fields': ('responsibilities',),
            'description': 'Enter each responsibility on a new line or as a JSON array'
        }),
        ('Requirements', {
            'fields': ('requirements',),
            'description': 'Enter each requirement on a new line or as a JSON array'
        }),
        ('Qualifications', {
            'fields': ('qualifications',),
            'description': 'Enter each qualification on a new line or as a JSON array'
        }),
        ('Benefits', {
            'fields': ('benefits',),
            'description': 'Enter each benefit on a new line or as a JSON array'
        }),
        ('Statistics', {
            'fields': ('applications_count_display',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def applications_count_display(self, obj):
        count = obj.applications_count
        if count > 0:
            url = reverse('admin:careers_jobapplication_changelist') + f'?opportunity__id__exact={obj.id}'
            return format_html('<a href="{}">{} applications</a>', url, count)
        return f'{count} applications'
    applications_count_display.short_description = "Applications"
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('applications')


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'applicant_name', 'opportunity_link', 'email', 'phone',
        'status', 'applied_date'
    ]
    list_filter = ['status', 'opportunity__department', 'opportunity__type', 'created_at']
    search_fields = ['applicant_name', 'email', 'opportunity__title', 'location']
    list_editable = ['status']
    readonly_fields = ['applied_date', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Application Details', {
            'fields': (
                'opportunity', 'applicant_name', 'email', 'phone',
                'location', 'experience', 'status'
            )
        }),
        ('Documents', {
            'fields': ('cover_letter', 'resume')
        }),
        ('Metadata', {
            'fields': ('applied_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def opportunity_link(self, obj):
        url = reverse('admin:careers_jobopportunity_change', args=[obj.opportunity.id])
        return format_html('<a href="{}">{}</a>', url, obj.opportunity.title)
    opportunity_link.short_description = "Job Opportunity"
    
    def applied_date(self, obj):
        return obj.applied_date
    applied_date.short_description = "Applied Date"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('opportunity')


@admin.register(VolunteerSubmission)
class VolunteerSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'email', 'phone', 'location', 'status',
        'availability', 'hours_contributed', 'join_date', 'created_at'
    ]
    list_filter = ['status', 'location', 'availability', 'created_at', 'join_date']
    search_fields = ['name', 'email', 'location']
    list_editable = ['status', 'hours_contributed']
    readonly_fields = ['created_at', 'updated_at', 'join_date']
    
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'name', 'email', 'phone', 'location', 'availability'
            )
        }),
        ('Application Details', {
            'fields': ('experience', 'motivation', 'status')
        }),
        ('Interests', {
            'fields': ('interests',),
            'description': 'Enter each interest on a new line or as a JSON array'
        }),
        ('Skills', {
            'fields': ('skills',),
            'description': 'Enter each skill on a new line or as a JSON array'
        }),
        ('Projects', {
            'fields': ('projects',),
            'description': 'Enter each project on a new line or as a JSON array'
        }),
        ('Volunteer Tracking', {
            'fields': ('hours_contributed', 'join_date'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request)