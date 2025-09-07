from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Room, ChatMessage, RoomParticipant
from .forms import RoomForm
import json

def home(request):
    """Home page with room creation and joining options"""
    if request.user.is_authenticated:
        user_rooms = Room.objects.filter(participants=request.user, is_active=True)
        recent_rooms = Room.objects.filter(is_active=True).order_by('-updated_at')[:5]
        return render(request, 'videoChats/home.html', {
            'user_rooms': user_rooms,
            'recent_rooms': recent_rooms
        })
    return render(request, 'videoChats/home.html')

def register(request):
    """User registration view"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('videoChats:home')
    else:
        form = UserCreationForm()
    return render(request, 'videoChats/register.html', {'form': form})

@login_required
def create_room(request):
    """Create a new video chat room"""
    if request.method == 'POST':
        form = RoomForm(request.POST)
        if form.is_valid():
            room = form.save(commit=False)
            room.created_by = request.user
            room.save()
            room.participants.add(request.user)
            messages.success(request, f'Room "{room.name}" created successfully!')
            return redirect('videoChats:room_detail', room_id=room.id)
    else:
        form = RoomForm()
    return render(request, 'videoChats/create_room.html', {'form': form})

@login_required
def room_detail(request, room_id):
    """Video chat room detail view"""
    room = get_object_or_404(Room, id=room_id, is_active=True)
    
    # Add user to participants if not already there
    if request.user not in room.participants.all():
        room.participants.add(request.user)
    
    # Get chat messages
    messages = ChatMessage.objects.filter(room=room)[:50]
    
    # Get online participants
    participants = room.participants.all()
    
    return render(request, 'videoChats/room_detail.html', {
        'room': room,
        'messages': messages,
        'participants': participants
    })

@login_required
def join_room(request):
    """Join a room by invite code"""
    if request.method == 'POST':
        invite_code = request.POST.get('invite_code', '').strip().upper()
        try:
            # Find room by invite code (first 8 characters of UUID)
            room = Room.objects.filter(
                id__startswith=invite_code.lower()[:8],
                is_active=True
            ).first()
            
            if room:
                if request.user not in room.participants.all():
                    room.participants.add(request.user)
                messages.success(request, f'Joined room "{room.name}"!')
                return redirect('videoChats:room_detail', room_id=room.id)
            else:
                messages.error(request, 'Invalid invite code. Please check and try again.')
        except Exception as e:
            messages.error(request, 'Error joining room. Please try again.')
    
    return render(request, 'videoChats/join_room.html')

@login_required
def leave_room(request, room_id):
    """Leave a room"""
    room = get_object_or_404(Room, id=room_id)
    if request.user in room.participants.all():
        room.participants.remove(request.user)
        messages.success(request, f'Left room "{room.name}"')
    return redirect('videoChats:home')

@csrf_exempt
@login_required
def send_message(request, room_id):
    """Send a chat message via AJAX"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            content = data.get('content', '').strip()
            
            if content:
                room = get_object_or_404(Room, id=room_id)
                message = ChatMessage.objects.create(
                    room=room,
                    sender=request.user,
                    content=content
                )
                
                return JsonResponse({
                    'success': True,
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender': message.sender.username,
                        'timestamp': message.timestamp.isoformat()
                    }
                })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
def get_messages(request, room_id):
    """Get chat messages for a room"""
    room = get_object_or_404(Room, id=room_id)
    messages = ChatMessage.objects.filter(room=room).order_by('timestamp')
    
    message_list = []
    for msg in messages:
        message_list.append({
            'id': msg.id,
            'content': msg.content,
            'sender': msg.sender.username,
            'timestamp': msg.timestamp.isoformat()
        })
    
    return JsonResponse({'messages': message_list})
