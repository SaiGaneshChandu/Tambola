import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer

# Room data ni memory lo store chestunnam (Production lo Redis/Database vaadali)
rooms = {}

class TambolaConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'game_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'CREATE_ROOM':
            # Room configuration store cheyyadam
            rooms[self.room_id] = {
                'password': data.get('password'),
                'max_players': data.get('max_players'),
                'called_numbers': [],
                'game_started': False
            }
            await self.send(text_data=json.dumps({
                'type': 'ROOM_CREATED',
                'message': 'Room configuration saved successfully!'
            }))

        elif action == 'START_GAME':
            if self.room_id in rooms and not rooms[self.room_id]['game_started']:
                rooms[self.room_id]['game_started'] = True
                await self.start_number_calling()
        
        elif action == 'CLAIM_PRIZE':
            player_name = data.get('player_name')
            # Winner validation logic
            # Evaru mundu 'CLAIM' request pampithe vallu random ga select avtharu (Race condition)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_message',
                    'message': f'🎊 {player_name} claimed Full House! Checking ticket...',
                    'user': 'System'
                }
            )

    async def start_number_calling(self):
        numbers = list(range(1, 91))
        random.shuffle(numbers) # Randomness guaranteed

        for num in numbers:
            # Check if game is still active
            if self.room_id not in rooms or not rooms[self.room_id]['game_started']:
                break

            rooms[self.room_id]['called_numbers'].append(num)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_num',
                    'number': num
                }
            )
            # Nuvvu adiginaట్టు 2 seconds gap
            await asyncio.sleep(2)

    async def broadcast_num(self, event):
        await self.send(text_data=json.dumps({
            'type': 'NEW_NUMBER',
            'number': event['number']
        }))

    async def game_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'CHAT_MESSAGE',
            'message': event['message'],
            'user': event['user']
        }))