# messaging/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()


class MessagingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'conversation_{self.conversation_id}'
        
        # Check if user is part of the conversation
        if not await self.user_in_conversation():
            await self.close()
            return
        
        # Join conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave conversation group
        await self.channel_layer.group_discard(
            self.conversation_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']
        
        if message_type == 'typing_start':
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'typing_notification',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_typing': True
                }
            )
        elif message_type == 'typing_stop':
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'typing_notification',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_typing': False
                }
            )

    async def new_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))

    async def typing_notification(self, event):
        # Don't send typing notification to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_notification',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))

    async def message_updated(self, event):
        # Send updated message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message_updated',
            'message': event['message']
        }))

    async def message_deleted(self, event):
        # Send deleted message notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id']
        }))

    @database_sync_to_async
    def user_in_conversation(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False


# messaging/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/messaging/<uuid:conversation_id>/', consumers.MessagingConsumer.as_asgi()),
]


# your_project/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from messaging import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})