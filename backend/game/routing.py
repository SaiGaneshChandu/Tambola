from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Ee path room_name variable ni dynamic ga WebSocket ki pampisthundhi
    re_path(r'ws/game/(?P<room_name>[\w.-]+)/$', consumers.GameConsumer.as_asgi()),
]