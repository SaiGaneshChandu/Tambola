from django.urls import re_path
from . import consumers

# WebSocket URL patterns
websocket_urlpatterns = [
    # ws://localhost:8000/ws/game/<room_id>/ path ki idi match avtundi
    re_path(r'ws/game/(?P<room_id>\w+)/$', consumers.TambolaConsumer.as_asgi()),
]