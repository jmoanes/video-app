import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Room, ChatMessage

class VideoChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send join message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user': self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Send leave message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_leave',
                'user': self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
            }
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        if message_type == 'chat_message':
            message = text_data_json.get('message', '')
            user = self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
            
            # Save message to database
            await self.save_message(user, message)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': user
                }
            )
        
        elif message_type == 'webrtc_signal':
            # Forward WebRTC signaling to other users
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_signal',
                    'signal': text_data_json.get('signal'),
                    'user': self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
                }
            )
        
        elif message_type == 'user_status':
            # Update user status (muted, video off, etc.)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'status': text_data_json.get('status'),
                    'user': self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'user': event['user']
        }))

    async def webrtc_signal(self, event):
        # Send WebRTC signal to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'webrtc_signal',
            'signal': event['signal'],
            'user': event['user']
        }))

    async def user_status(self, event):
        # Send user status update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'status': event['status'],
            'user': event['user']
        }))

    async def user_join(self, event):
        # Send user join notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user': event['user']
        }))

    async def user_leave(self, event):
        # Send user leave notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user': event['user']
        }))

    @database_sync_to_async
    def save_message(self, username, message):
        try:
            room = Room.objects.get(id=self.room_id)
            if username != 'Anonymous':
                user = self.scope['user']
                ChatMessage.objects.create(
                    room=room,
                    sender=user,
                    content=message
                )
        except Room.DoesNotExist:
            pass
