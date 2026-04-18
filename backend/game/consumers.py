import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from .utils import generate_ticket

class GameConsumer(AsyncWebsocketConsumer):
    rooms = {} # Room data store cheyyడానికి

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'setup_room':
            # Host room create chesinappudu
            self.rooms[self.room_name] = {
                'password': data['password'],
                'max_players': int(data['max_players']),
                'players': {},
                'called_numbers': [],
                'is_started': False
            }

        elif action == 'join_game':
            room = self.rooms.get(self.room_name)
            if room and room['password'] == data['password']:
                # Player join ayithe unique ticket ivvali
                ticket = generate_ticket()
                room['players'][self.channel_name] = data['player_name']
                
                await self.send(text_data=json.dumps({
                    'type': 'ticket_data',
                    'ticket': ticket,
                    'player_name': data['player_name']
                }))
                
                # Player count update
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'player_update',
                    'count': len(room['players'])
                })

        elif action == 'start_game':
            room = self.rooms.get(self.room_name)
            if room and not room['is_started']:
                room['is_started'] = True
                asyncio.create_task(self.game_loop())

    async def game_loop(self):
        room = self.rooms.get(self.room_name)
        numbers = list(range(1, 91))
        random.shuffle(numbers)

        for num in numbers:
            if not room['is_started']: break
            room['called_numbers'].append(num)
            
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'new_number',
                'number': num
            })
            await asyncio.sleep(2) # 2 Seconds Gap

    async def new_number(self, event):
        await self.send(text_data=json.dumps(event))

    async def player_update(self, event):
        await self.send(text_data=json.dumps(event))