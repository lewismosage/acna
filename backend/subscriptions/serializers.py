from rest_framework import serializers
from .models import NewsletterSubscriber
from .models import ContactMessage

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'subscribed_at', 'unsubscribed_at', 'source']
        read_only_fields = ['is_active', 'subscribed_at', 'unsubscribed_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'email', 
            'subject', 
            'message',
            'created_at',
            'is_read',
            'responded',
            'response_notes',
            'source'
        ]
        read_only_fields = ['created_at', 'is_read', 'responded', 'response_notes']