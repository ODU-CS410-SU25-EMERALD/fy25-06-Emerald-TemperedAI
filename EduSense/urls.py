####################################################################################################   
# EduSense URLS
# Author: Dillon Sapp
#
# This file maps project-level urls to app-level URLs
####################################################################################################

from django.urls import path, include
from django.contrib import admin

urlpatters = [
    path('admin/', admin.site.urls),
    path('tutor/', include('tutor.urls'))
]