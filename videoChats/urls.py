from django.urls import path
from . import views

app_name = 'videoChats'

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('create-room/', views.create_room, name='create_room'),
    path('join-room/', views.join_room, name='join_room'),
    path('room/<uuid:room_id>/', views.room_detail, name='room_detail'),
    path('room/<uuid:room_id>/leave/', views.leave_room, name='leave_room'),
    path('room/<uuid:room_id>/send-message/', views.send_message, name='send_message'),
    path('room/<uuid:room_id>/messages/', views.get_messages, name='get_messages'),
]
