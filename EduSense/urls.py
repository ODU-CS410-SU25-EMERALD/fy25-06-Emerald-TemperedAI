####################################################################################################   
# EduSense URLS
# Author: Dillon Sapp
#
# This file maps project-level urls to app-level URLs
####################################################################################################

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tutor.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)