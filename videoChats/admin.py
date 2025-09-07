from django.contrib import admin
from .models import Room, ChatMessage, RoomParticipant

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'participant_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['participants']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'room', 'content', 'timestamp']
    list_filter = ['timestamp', 'room']
    search_fields = ['content', 'sender__username', 'room__name']
    readonly_fields = ['timestamp']

@admin.register(RoomParticipant)
class RoomParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'is_online', 'joined_at', 'last_seen']
    list_filter = ['is_online', 'joined_at', 'room']
    search_fields = ['user__username', 'room__name']
    readonly_fields = ['joined_at', 'last_seen']
