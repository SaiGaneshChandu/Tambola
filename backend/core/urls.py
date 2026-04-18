from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', include('game.urls')),

    # GENUINE LINK HANDLER
    # Ee line /Sai/1111 lanti links click chesina Not Found raakunda 
    # direct ga React index.html ni open chesthundhi.
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]