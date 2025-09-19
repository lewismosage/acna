from django.contrib import admin
from .models import Conversation, Message, MessageReadStatus, MessageReaction


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_group', 'group_name', 'participant_count', 'created_at']
    list_filter = ['is_group', 'created_at']
    search_fields = ['group_name', 'participants__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'conversation', 'message_type', 'is_active', 'created_at']
    list_filter = ['message_type', 'is_active', 'is_edited', 'created_at']
    search_fields = ['content', 'sender__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sender', 'conversation')


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'read_at']
    list_filter = ['read_at']
    search_fields = ['user__username', 'message__content']


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'emoji', 'created_at']
    list_filter = ['emoji', 'created_at']
    search_fields = ['user__username', 'message__content']