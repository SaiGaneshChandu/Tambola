from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Ee regex room_name ni string la teesukuntundhi (100% Work ayye path)
    re_path(r'ws/game/(?P<room_name>[\w-]+)/$', consumers.GameConsumer.as_asgi()),
]