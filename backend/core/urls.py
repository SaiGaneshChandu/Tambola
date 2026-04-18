from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', include('game.urls')),

    # Ee re_path valla /Sai/1111 lanti links ni Django direct ga 
    # Frontend ki pampisthundi, error raadu.
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]