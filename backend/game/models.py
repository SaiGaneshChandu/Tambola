from django.db import models
import uuid

class Room(models.Model):
    # Unique ID for the room (e.g., "ABCD-1234")
    room_id = models.CharField(max_length=10, unique=True, default=uuid.uuid4().hex[:6].upper())
    host_name = models.CharField(max_length=50)
    is_game_started = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Store numbers that have already been called
    called_numbers = models.JSONField(default=list)

    def __str__(self):
        return f"Room {self.room_id} - Host: {self.host_name}"

class Player(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="players")
    name = models.CharField(max_length=50)
    session_id = models.CharField(max_length=100, unique=True) # WebSocket track cheyyadaniki
    is_host = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} in {self.room.room_id}"

class Ticket(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name="ticket")
    # Store the 3x9 grid as a JSON object
    # Example: [[None, 12, ...], [5, None, ...], [None, None, ...]]
    ticket_data = models.JSONField()

    def __str__(self):
        return f"Ticket for {self.player.name}"