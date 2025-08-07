from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, VerificationCode

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_verified', 'is_staff')
    list_filter = ('is_verified', 'is_staff', 'is_superuser', 'is_organization')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'organization_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'mobile_number', 
                                   'physical_address', 'country', 'gender', 'age_bracket')}),
        ('Organization Info', {'fields': ('is_organization', 'organization_name', 'organization_type',
                                       'registration_number', 'contact_person_title', 
                                       'organization_phone', 'organization_address', 'website')}),
        ('Permissions', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser',
                                  'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'is_used')
    list_filter = ('is_used',)
    search_fields = ('user__email', 'user__username', 'code')
    ordering = ('-created_at',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(VerificationCode, VerificationCodeAdmin)