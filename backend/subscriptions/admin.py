# subscriptions/admin.py
from django.contrib import admin
from .models import NewsletterSubscriber, ContactMessage

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'subscribed_at')
    list_filter = ('is_active', 'subscribed_at')
    search_fields = ('email', 'first_name', 'last_name')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'first_name', 'last_name', 'email', 'created_at', 'is_read', 'responded')
    list_filter = ('is_read', 'responded', 'created_at')
    search_fields = ('subject', 'first_name', 'last_name', 'email', 'message')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)