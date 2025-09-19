from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageReadStatus, MessageReaction

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Simple user serializer for messaging"""
    profile_photo = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'display_name', 'profile_photo']
    
    def get_profile_photo(self, obj):
        if hasattr(obj, 'profile_photo') and obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
        return None
    
    def get_display_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username


class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = MessageReaction
        fields = ['id', 'user', 'emoji', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSimpleSerializer(read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    reply_to = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 'message_type',
            'file_attachment', 'image_attachment', 'file_url', 'image_url',
            'reply_to', 'reactions', 'is_active', 'is_edited', 'edited_at',
            'created_at', 'updated_at', 'is_read'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at']
    
    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'sender': obj.reply_to.sender.username,
                'content': obj.reply_to.content[:100] + '...' if len(obj.reply_to.content) > 100 else obj.reply_to.content,
                'message_type': obj.reply_to.message_type
            }
        return None
    
    def get_file_url(self, obj):
        if obj.file_attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file_attachment.url)
        return None
    
    def get_image_url(self, obj):
        if obj.image_attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_attachment.url)
        return None
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return MessageReadStatus.objects.filter(
                message=obj,
                user=request.user
            ).exists()
        return False


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSimpleSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    group_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'is_group', 'group_name', 'group_image',
            'group_image_url', 'last_message', 'unread_count', 'other_participant',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Count messages in this conversation that the user hasn't read
            read_message_ids = MessageReadStatus.objects.filter(
                user=request.user,
                message__conversation=obj
            ).values_list('message_id', flat=True)
            
            return obj.messages.filter(
                is_active=True
            ).exclude(
                sender=request.user
            ).exclude(
                id__in=read_message_ids
            ).count()
        return 0
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and not obj.is_group:
            other = obj.get_other_participant(request.user)
            if other:
                return UserSimpleSerializer(other, context=self.context).data
        return None
    
    def get_group_image_url(self, obj):
        if obj.group_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.group_image.url)
        return None


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['conversation', 'content', 'message_type', 'file_attachment', 'image_attachment', 'reply_to']
    
    def validate(self, data):
        # Ensure at least one of content, file_attachment, or image_attachment is provided
        if not any([data.get('content'), data.get('file_attachment'), data.get('image_attachment')]):
            raise serializers.ValidationError("Message must have content, file, or image attachment.")
        
        # Validate message type matches attachments
        if data.get('message_type') == 'file' and not data.get('file_attachment'):
            raise serializers.ValidationError("File attachment required for file messages.")
        
        if data.get('message_type') == 'image' and not data.get('image_attachment'):
            raise serializers.ValidationError("Image attachment required for image messages.")
        
        return data


class CreateConversationSerializer(serializers.ModelSerializer):
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Conversation
        fields = ['is_group', 'group_name', 'group_image', 'participant_ids']
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        conversation = Conversation.objects.create(**validated_data)
        
        # Add the creator to the conversation
        if self.context['request'].user:
            conversation.participants.add(self.context['request'].user)
        
        # Add other participants
        if participant_ids:
            participants = User.objects.filter(id__in=participant_ids)
            conversation.participants.add(*participants)
        
        return conversation


class MessageReactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageReaction
        fields = ['message', 'emoji']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Remove existing reaction from this user to this message with same emoji
        MessageReaction.objects.filter(
            message=validated_data['message'],
            user=validated_data['user'],
            emoji=validated_data['emoji']
        ).delete()
        
        return MessageReaction.objects.create(**validated_data)