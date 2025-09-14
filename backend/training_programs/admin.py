from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import TrainingProgram, Registration, ScheduleItem, Speaker


class ScheduleItemInline(admin.TabularInline):
    model = ScheduleItem
    extra = 1
    fields = ('day', 'time', 'activity', 'speaker')
    ordering = ['day', 'time']


class SpeakerInline(admin.TabularInline):
    model = Speaker
    extra = 1
    fields = ('name', 'title', 'organization', 'bio')


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = [
        'title', 
        'type', 
        'category', 
        'status', 
        'featured_badge',
        'enrollment_status', 
        'instructor', 
        'start_date',
        'end_date',
        'price_display',
        'created_at'
    ]
    list_filter = [
        'status', 
        'type', 
        'category', 
        'format', 
        'is_featured',
        'created_at',
        'start_date'
    ]
    search_fields = [
        'title', 
        'description', 
        'instructor', 
        'category'
    ]
    readonly_fields = [
        'id', 
        'current_enrollments', 
        'created_at', 
        'updated_at',
        'image_preview'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'description', 'type', 'category', 'instructor'
            )
        }),
        ('Status & Visibility', {
            'fields': (
                'status', 'is_featured'
            )
        }),
        ('Schedule & Location', {
            'fields': (
                'start_date', 'end_date', 'registration_deadline',
                'duration', 'format', 'location', 'timezone'
            )
        }),
        ('Enrollment & Pricing', {
            'fields': (
                'max_participants', 'current_enrollments', 'price', 'currency'
            )
        }),
        ('Media & Content', {
            'fields': (
                'image', 'image_preview', 'image_url'
            )
        }),
        ('Learning Details', {
            'fields': (
                'prerequisites', 'learning_outcomes', 'topics', 
                'target_audience', 'language', 'materials'
            )
        }),
        ('Assessment & Certification', {
            'fields': (
                'assessment_method', 'passing_score', 
                'certificate_type', 'cme_credits'
            )
        }),
        ('System Information', {
            'fields': (
                'id', 'created_at', 'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    inlines = [ScheduleItemInline, SpeakerInline]
    
    actions = ['publish_programs', 'archive_programs', 'feature_programs', 'unfeature_programs']
    
    def featured_badge(self, obj):
        if obj.is_featured:
            return format_html(
                '<span style="color: #f59e0b; font-weight: bold;">⭐ Featured</span>'
            )
        return '-'
    featured_badge.short_description = 'Featured'
    
    def enrollment_status(self, obj):
        if obj.max_participants == 0:
            return 'Unlimited'
        
        percentage = (obj.current_enrollments / obj.max_participants) * 100
        color = '#10b981' if percentage < 80 else '#f59e0b' if percentage < 100 else '#ef4444'
        
        return format_html(
            '<span style="color: {};">{}/{} ({:.0f}%)</span>',
            color,
            obj.current_enrollments,
            obj.max_participants,
            percentage
        )
    enrollment_status.short_description = 'Enrollment'
    
    def price_display(self, obj):
        return f"{obj.currency} {obj.price:,.2f}"
    price_display.short_description = 'Price'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 200px;" />',
                obj.image.url
            )
        elif obj.image_url:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 200px;" />',
                obj.image_url
            )
        return 'No image'
    image_preview.short_description = 'Image Preview'
    
    def publish_programs(self, request, queryset):
        count = queryset.update(status='Published')
        self.message_user(request, f'{count} programs published successfully.')
    publish_programs.short_description = 'Publish selected programs'
    
    def archive_programs(self, request, queryset):
        count = queryset.update(status='Archived')
        self.message_user(request, f'{count} programs archived successfully.')
    archive_programs.short_description = 'Archive selected programs'
    
    def feature_programs(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'{count} programs featured successfully.')
    feature_programs.short_description = 'Feature selected programs'
    
    def unfeature_programs(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'{count} programs unfeatured successfully.')
    unfeature_programs.short_description = 'Unfeature selected programs'


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = [
        'participant_name',
        'participant_email',
        'program_link',
        'status',
        'payment_status',
        'registration_date',
        'profession'
    ]
    list_filter = [
        'status',
        'payment_status', 
        'profession',
        'experience',
        'registration_date',
        'program__type',
        'program__category'
    ]
    search_fields = [
        'participant_name',
        'participant_email',
        'participant_phone',
        'organization',
        'program__title'
    ]
    readonly_fields = ['id', 'registration_date']
    
    fieldsets = (
        ('Participant Information', {
            'fields': (
                'participant_name', 'participant_email', 'participant_phone',
                'organization', 'profession', 'experience'
            )
        }),
        ('Program & Status', {
            'fields': (
                'program', 'status', 'payment_status'
            )
        }),
        ('Additional Information', {
            'fields': (
                'special_requests',
            )
        }),
        ('System Information', {
            'fields': (
                'id', 'registration_date'
            ),
            'classes': ('collapse',)
        })
    )
    
    actions = ['confirm_registrations', 'cancel_registrations', 'mark_paid']
    
    def program_link(self, obj):
        if obj.program:
            url = reverse('admin:training_programs_trainingprogram_change', args=[obj.program.pk])
            return format_html('<a href="{}">{}</a>', url, obj.program.title)
        return '-'
    program_link.short_description = 'Program'
    
    def confirm_registrations(self, request, queryset):
        count = queryset.update(status='Confirmed')
        self.message_user(request, f'{count} registrations confirmed successfully.')
    confirm_registrations.short_description = 'Confirm selected registrations'
    
    def cancel_registrations(self, request, queryset):
        count = queryset.update(status='Cancelled')
        self.message_user(request, f'{count} registrations cancelled successfully.')
    cancel_registrations.short_description = 'Cancel selected registrations'
    
    def mark_paid(self, request, queryset):
        count = queryset.update(payment_status='Paid')
        self.message_user(request, f'{count} registrations marked as paid successfully.')
    mark_paid.short_description = 'Mark selected registrations as paid'


@admin.register(ScheduleItem)
class ScheduleItemAdmin(admin.ModelAdmin):
    list_display = ['program', 'day', 'time', 'activity', 'speaker']
    list_filter = ['program__type', 'day']
    search_fields = ['program__title', 'activity', 'speaker']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('program')


@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'organization', 'program_count']
    search_fields = ['name', 'title', 'organization']
    list_filter = ['organization']
    
    def program_count(self, obj):
        return obj.program_set.count()
    program_count.short_description = 'Programs'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('program_set')