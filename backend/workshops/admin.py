# workshops/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Workshop, WorkshopPrerequisite, WorkshopMaterial,
    CollaborationSubmission, CollaborationSkill
)

class WorkshopPrerequisiteInline(admin.TabularInline):
    model = WorkshopPrerequisite
    extra = 1

class WorkshopMaterialInline(admin.TabularInline):
    model = WorkshopMaterial
    extra = 1

class CollaborationSkillInline(admin.TabularInline):
    model = CollaborationSkill
    extra = 1

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'instructor', 'date', 'time', 
        'location', 'type', 'status', 
        'registered', 'capacity', 'registration_progress', 
        'price', 'image_preview'
    ]
    list_filter = ['status', 'type', 'date', 'instructor']
    search_fields = ['title', 'description', 'instructor', 'location']
    list_editable = ['status']
    readonly_fields = [
        'registered', 'registration_progress', 
        'created_at', 'updated_at', 'image_preview'
    ]
    inlines = [WorkshopPrerequisiteInline, WorkshopMaterialInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'instructor', 'date', 'time', 
                'duration', 'location', 'venue', 'type', 'status',
                'description'
            )
        }),
        ('Registration Details', {
            'fields': ('capacity', 'registered', 'price')
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'image_preview')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
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

@admin.register(CollaborationSubmission)
class CollaborationSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        'project_title', 'institution', 'project_lead',
        'contact_email', 'status', 'submitted_at'
    ]
    list_filter = ['status', 'submitted_at', 'institution']
    search_fields = ['project_title', 'project_description', 'institution', 'project_lead']
    list_editable = ['status']
    readonly_fields = ['submitted_at', 'updated_at']
    inlines = [CollaborationSkillInline]
    
    fieldsets = (
        ('Project Details', {
            'fields': (
                'project_title', 'project_description', 'institution',
                'project_lead', 'contact_email', 'commitment_level',
                'duration', 'additional_notes'
            )
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Metadata', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )