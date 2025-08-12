from rest_framework import serializers
from .models import NewsletterSubscriber

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'subscribed_at', 'unsubscribed_at', 'source']
        read_only_fields = ['is_active', 'subscribed_at', 'unsubscribed_at']