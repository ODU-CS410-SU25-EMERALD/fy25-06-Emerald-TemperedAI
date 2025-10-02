####################################################################################################   
# Tutor URLS
# Author: Christian Biehn
#
# This file maps URLs to Python code in tutor/views.py
####################################################################################################

from django.urls import path
from . import views

# namespace for application
app_name = 'tutor'

urlpatterns = [
    path('response/', views.get_api_response, name='get_api_response'),
   
    # new path for Ollama proxy endpoint
    # will be accessed at URL: /api/tutor/ollama/generate/
    path('ollama/generate/', views.OllamaGenerateView.as_view(), name='ollama_generate'),
]
