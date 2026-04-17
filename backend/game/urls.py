from django.urls import path
from . import views

urlpatterns = [
    # Room create cheyyadaniki endpoint
    path('create-room/', views.create_room, name='create_room'),
    
    # Room lo join ayye mundu check cheyyadaniki endpoint
    path('join-room/<str:room_id>/', views.join_room, name='join_room'),
]