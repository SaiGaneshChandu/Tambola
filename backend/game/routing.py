# backend/game/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # consumer name 'GameConsumer' ki match avvali
    re_path(r'ws/game/(?P<room_name>\w+)/$', consumers.GameConsumer.as_asgi()),
]