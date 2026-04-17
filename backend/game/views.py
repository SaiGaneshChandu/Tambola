from django.shortcuts import render
from django.http import JsonResponse
from .models import Room, Player, Ticket
from .utils import generate_tambola_ticket
import uuid

def create_room(request):
    """
    Oka kotha game room ni create chestundi.
    """
    if request.method == 'POST':
        host_name = request.POST.get('name', 'Admin')
        
        # Unique Room ID generate cheyyadam
        new_room_id = uuid.uuid4().hex[:6].upper()
        
        # Database lo room create cheyyadam
        room = Room.objects.create(
            room_id=new_room_id,
            host_name=host_name
        )
        
        return JsonResponse({
            'status': 'success',
            'room_id': new_room_id,
            'message': 'Room created successfully!'
        })

def join_room(request, room_id):
    """
    Existing room lo player ni join chestundi mariyu ticket assign chestundi.
    """
    try:
        room = Room.objects.get(room_id=room_id)
        player_name = request.GET.get('name', f'Player_{uuid.uuid4().hex[:4]}')
        
        # Player limit check (Optional: max 15)
        if room.players.count() >= 15:
            return JsonResponse({'status': 'error', 'message': 'Room is full!'}, status=400)

        # Player create cheyyadam
        player = Player.objects.create(
            room=room,
            name=player_name,
            session_id=uuid.uuid4().hex
        )
        
        # Unique Tambola Ticket generate chesi save cheyyadam
        ticket_matrix = generate_tambola_ticket()
        Ticket.objects.create(player=player, ticket_data=ticket_matrix)
        
        return JsonResponse({
            'status': 'success',
            'player_id': player.id,
            'ticket': ticket_matrix,
            'room_id': room.room_id
        })
        
    except Room.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Room not found!'}, status=404)