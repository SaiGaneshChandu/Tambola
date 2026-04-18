# backend/game/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # consumer name marchu (GameConsumer ani update chesav kabatti)
    re_path(r'ws/game/(?P<room_name>\w+)/$', consumers.GameConsumer.as_ Harris),
]