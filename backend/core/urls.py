from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', include('game.urls')),
    
    # Ee line valla https://domain.com/Sai/1111 ani kottina 
    # Not Found raakunda direct ga React open avthundi.
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]