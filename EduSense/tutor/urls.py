####################################################################################################   
# Tutor URLS
# Author: Christian Biehn
#
# This file maps URLs to Python code in tutor/views.py
####################################################################################################

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from tutor.views import OllamaGenerateView
from tutor.views import LLM_responseViewSet
from django.conf import settings
from django.conf.urls.static import static
from .views import SignupView, LoginView
# namespace for application
app_name = 'tutor'

# Required due to switching from Function-Based Views to Class-Based Views
# create router and register all ModelViewSets for CRUD endpoints.
# paths defined here (e.g., 'assignments') are the final endpoint paths.
router = DefaultRouter()
router.register(r'assignments', views.assignmentViewSet, basename='assignment')
router.register(r'conversations', views.conversationViewSet, basename='conversation')
router.register(r'courses', views.courseViewSet, basename='course')
router.register(r'instructors', views.instructorViewSet, basename='instructor')
router.register(r'questions', views.questionViewSet, basename='question')
router.register(r'llm_responses', views.LLM_responseViewSet, basename='llm_response')
router.register(r'students', views.studentViewSet, basename='student')

# API URLs now determined automatically by router.
urlpatterns = [
     path('', include(router.urls)), 
     # custom path for Ollama proxy (Class-Based View)
     path('ollama/generate/', views.OllamaGenerateView.as_view(), name='ollama_generate'),
     path('signup', SignupView.as_view(), name='signup'),
     path('login', LoginView.as_view(), name='login'),     
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)