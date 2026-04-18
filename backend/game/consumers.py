import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from .utils import generate_ticket

class GameConsumer(AsyncWebsocketConsumer):
    # Idhi memory lo rooms data ni save chesthundhi
    rooms = {} 

    async def connect(self):
        # URL nundi room_name ni dynamic ga collect chesthundhi
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        # Group lo join avvadam
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Player disconnect ayithe group nundi remove cheyyali
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        # 1. Host room create chesinappudu
        if action == 'setup_room':
            self.rooms[self.room_name] = {
                'password': data['password'],
                'max_players': int(data['max_players']),
                'players': {}, # channel_name: player_name
                'called_numbers': [],
                'is_started': False
            }
            print(f"Room Created: {self.room_name} for {data['max_players']} players")

        # 2. Player link click chesi join ayinappudu
        elif action == 'join_game':
            room = self.rooms.get(self.room_name)
            
            if room and room['password'] == data['password']:
                if len(room['players']) < room['max_players']:
                    # Ticket generate chesi player details store cheyyali
                    ticket = generate_ticket()
                    room['players'][self.channel_name] = data['player_name']
                    
                    # Player ki matrame ticket pampali
                    await self.send(text_data=json.dumps({
                        'type': 'ticket_data',
                        'ticket': ticket,
                        'max_players': room['max_players']
                    }))
                    
                    # Group ki player update pampali
                    await self.channel_layer.group_send(self.room_group_name, {
                        'type': 'player_update',
                        'count': len(room['players']),
                        'max_players': room['max_players']
                    })
            else:
                await self.send(text_data=json.dumps({'type': 'error', 'message': 'Invalid Password or Room!'}))

        # 3. Game Start Logic
        elif action == 'start_game':
            room = self.rooms.get(self.room_name)
            if room and len(room['players']) >= room['max_players']:
                if not room['is_started']:
                    room['is_started'] = True
                    asyncio.create_task(self.game_loop())

    async def game_loop(self):
        room = self.rooms.get(self.room_name)
        numbers = list(range(1, 91))
        random.shuffle(numbers)

        for num in numbers:
            # Room close ayina leda game aagipoyina loop stop avvali
            if self.room_name not in self.rooms or not room['is_started']:
                break
                
            room['called_numbers'].append(num)
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'new_number',
                'number': num
            })
            await asyncio.sleep(2) # 2 seconds gap

    # Helper functions for group messages
    async def new_number(self, event):
        await self.send(text_data=json.dumps(event))

    async def player_update(self, event):
        await self.send(text_data=json.dumps(event))