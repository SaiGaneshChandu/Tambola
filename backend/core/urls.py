from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', include('game.urls')),
    
    # CATCH-ALL ROUTE: This fixes the "Not Found" error on direct link access
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]