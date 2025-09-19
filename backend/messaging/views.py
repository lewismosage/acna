from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Max
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .models import Conversation, Message, MessageReadStatus, MessageReaction
from .serializers import (
    ConversationSerializer, MessageSerializer, CreateMessageSerializer,
    CreateConversationSerializer, MessageReactionCreateSerializer,
    MessageReactionSerializer
)

User = get_user_model()


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateConversationSerializer
        return ConversationSerializer
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages in a conversation"""
        conversation = self.get_object()
        messages = Message.objects.filter(
            conversation=conversation,
            is_active=True
        ).select_related('sender', 'reply_to', 'reply_to__sender').prefetch_related('reactions')
        
        # Mark messages as read
        unread_messages = messages.exclude(sender=request.user).exclude(
            read_statuses__user=request.user
        )
        
        for message in unread_messages:
            MessageReadStatus.objects.get_or_create(
                message=message,
                user=request.user
            )
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def start_conversation(self, request):
        """Start a new conversation with specific users"""
        participant_id = request.data.get('participant_id')
        
        if not participant_id:
            return Response(
                {'error': 'participant_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            participant = User.objects.get(id=participant_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if conversation already exists between these two users
        existing_conversation = Conversation.objects.filter(
            participants=request.user,
            is_group=False
        ).filter(
            participants=participant
        ).first()
        
        if existing_conversation:
            serializer = ConversationSerializer(existing_conversation, context={'request': request})
            return Response(serializer.data)
        
        # Create new conversation
        conversation = Conversation.objects.create(is_group=False)
        conversation.participants.add(request.user, participant)
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def add_participants(self, request, pk=None):
        """Add participants to a group conversation"""
        conversation = self.get_object()
        
        if not conversation.is_group:
            return Response(
                {'error': 'Can only add participants to group conversations'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant_ids = request.data.get('participant_ids', [])
        if not participant_ids:
            return Response(
                {'error': 'participant_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participants = User.objects.filter(id__in=participant_ids)
        conversation.participants.add(*participants)
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def leave_conversation(self, request, pk=None):
        """Leave a conversation"""
        conversation = self.get_object()
        conversation.participants.remove(request.user)
        
        return Response({'message': 'Left conversation successfully'})


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination
    
    def get_queryset(self):
        return Message.objects.filter(
            conversation__participants=self.request.user,
            is_active=True
        ).select_related('sender', 'conversation', 'reply_to').prefetch_related('reactions')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateMessageSerializer
        return MessageSerializer
    
    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        
        # Automatically determine message type based on attachments
        if message.image_attachment:
            message.message_type = 'image'
        elif message.file_attachment:
            message.message_type = 'file'
        elif message.content and any(emoji in message.content for emoji in ['😀', '😃', '😄', '😁', '😆', '😅', '😂']):
            message.message_type = 'emoji'
        else:
            message.message_type = 'text'
        
        message.save()
        
        # Mark message as read by sender
        MessageReadStatus.objects.get_or_create(
            message=message,
            user=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        read_status, created = MessageReadStatus.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        return Response({
            'message': 'Message marked as read',
            'already_read': not created
        })
    
    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        """Add or remove a reaction to a message"""
        message = self.get_object()
        emoji = request.data.get('emoji')
        
        if not emoji:
            return Response(
                {'error': 'emoji is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already reacted with this emoji
        existing_reaction = MessageReaction.objects.filter(
            message=message,
            user=request.user,
            emoji=emoji
        ).first()
        
        if existing_reaction:
            # Remove reaction
            existing_reaction.delete()
            return Response({'message': 'Reaction removed'})
        else:
            # Add reaction
            serializer = MessageReactionCreateSerializer(
                data={'message': message.id, 'emoji': emoji},
                context={'request': request}
            )
            if serializer.is_valid():
                reaction = serializer.save()
                return Response(MessageReactionSerializer(reaction).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def edit(self, request, pk=None):
        """Edit a message"""
        message = self.get_object()
        
        if message.sender != request.user:
            return Response(
                {'error': 'You can only edit your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        content = request.data.get('content')
        if not content:
            return Response(
                {'error': 'content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.content = content
        message.is_edited = True
        message.save()
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        """Soft delete a message"""
        message = self.get_object()
        
        if message.sender != request.user:
            return Response(
                {'error': 'You can only delete your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.is_active = False
        message.save()
        
        return Response({'message': 'Message deleted successfully'})
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search messages"""
        query = request.query_params.get('q', '')
        conversation_id = request.query_params.get('conversation_id')
        
        if not query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        messages = self.get_queryset().filter(
            content__icontains=query
        )
        
        if conversation_id:
            messages = messages.filter(conversation_id=conversation_id)
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)


class MessageReactionViewSet(viewsets.ModelViewSet):
    serializer_class = MessageReactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MessageReaction.objects.filter(
            message__conversation__participants=self.request.user
        ).select_related('user', 'message')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageReactionCreateSerializer
        return MessageReactionSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)