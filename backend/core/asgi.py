import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import game.routing  # Mana game app routing file

# Django settings module ni set chestunnam
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# ASGI application definition
application = ProtocolTypeRouter({
    # Standard HTTP requests handling
    "http": get_asgi_application(),
    
    # WebSocket requests handling
    "websocket": AuthMiddlewareStack(
        URLRouter(
            game.routing.websocket_urlpatterns
        )
    ),
})