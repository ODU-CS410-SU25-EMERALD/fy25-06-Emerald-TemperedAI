####################################################################################################   
# Tutor URLS
# Author: Christian Biehn
#
# This file maps URLs to Python code in tutor/views.py
####################################################################################################

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# namespace for application
app_name = 'tutor'

# Required due to switching from Function-Based Views to Class-Based Views
# create router and register all ModelViewSets for CRUD endpoints.
# paths defined here (e.g., 'assignments') are the final endpoint paths.
router = DefaultRouter()
router.register(r'assignments', views.assignment, basename='assignment')
router.register(r'conversations', views.conversation, basename='conversation')
router.register(r'courses', views.course, basename='course')
router.register(r'instructors', views.instructor, basename='instructor')
router.register(r'questions', views.question, basename='question')
router.register(r'llm_responses', views.LLM_response, basename='llm_response')
router.register(r'students', views.student, basename='student')

# API URLs now determined automatically by router.
urlpatterns = [
     path('', include(router.urls)), 
    
    # custom path for Ollama proxy (Class-Based View)
     path('ollama/generate/', views.OllamaGenerateView.as_view(), name='ollama_generate'),
]