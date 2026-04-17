from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # 1. Django Admin site
    path('admin/', admin.site.urls),
    
    # 2. Game app logic ki sambandhinchina URLs anni include chestunnam
    path('api/game/', include('game.urls')),
]