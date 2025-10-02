####################################################################################################   
# EduSense Views
# Author: Dillon Sapp, Christian Biehn
#
# This file defines handlers for the various API requests to our database and Ollama.
####################################################################################################

import requests # required for Ollama HTTP calls
import json     # required for handling JSON
import logging  # required for error logging

#was causing errors when communicating with Django REST API through terminal or when starting Python server (forgot which) due to naming conflicts
#from rest_framework.decorators import APIView
#from rest_framework.response import Response

from rest_framework.views import APIView 
# renamed '@APIView' in entire file (views.py) to '@api_view' due to reason above
from rest_framework.decorators import api_view 
# renamed 'Response' in entire file (view.py) to 'APIResponse' due to reason above
from rest_framework.response import Response as APIResponse
from rest_framework import status
from .models import *
from .serializers import *


#logging for better error visibility in terminal
ollamaLogger = logging.getLogger(__name__)

# Ollama Config
OLLAMA_API_URL = 'http://localhost:11434/api/generate' # Local Ollama API URL
OLLAMA_DEFAULT_MODEL = 'llama3.1:8b-instruct-q5_K_M'  # Set preferred default model here

########################################### API GETTERS ############################################

@api_view(['GET'])
def get_assignment(request):

    assignment_id = request.GET.get('assignment_id')

    if not assignment_id:
        return APIResponse({'error' : 'Missing assignment_id parameter'}, status=400)
    
    try:
        assignment = Assignment.objects.get(assignment_id=assignment_id)
    except:
        return APIResponse({'error' : 'Assignment Not Found'}, status=404)
    
    return APIResponse(CourseSerializer(assignment).data)

@api_view(['GET'])
def get_conversation(request):
    
    conversation_id = request.GET.get('conversation_id')

    if not conversation_id:
        return APIResponse({'error' : 'Missing conversation_id parameter'}, status=400)
    
    try:
        conversation = Conversation.objects.get(conversation_id=conversation_id)
    except:
        return APIResponse({'error' : 'Conversation Not Found'}, status=404)
    
    return APIResponse(CourseSerializer(conversation).data)

@api_view(['GET'])
def get_course(request):

    course_id = request.GET.get('course_id')

    if not course_id:
        return APIResponse({'error' : 'Missing course_id parameter'}, status=400)
    
    try:
        course = Course.objects.get(course_id=course_id)
    except:
        return APIResponse({'error' : 'Course Not Found'}, status=404)
    
    return APIResponse(CourseSerializer(course).data)

@api_view(['GET'])
def get_instructor(request):

    instructor_id = request.GET.get('instructor_id')

    if not instructor_id:
        return APIResponse({'error' : 'Missing instructor_id parameter'}, status=400)
    
    try:
        instructor = Instructor.objects.get(instructor_id=instructor_id)
    except:
        return APIResponse({'error' : 'Instructor Not Found'}, status=404)
    
    return APIResponse(InstructorSerializer(instructor).data)

@api_view(['GET'])
def get_question(request):

    question_id = request.GET.get('question_id')

    if not question_id:
        return APIResponse({'error' : 'Missing question_id parameter'}, status=400)
    
    try:
        question = Question.objects.get(question_id=question_id)
    except:
        return APIResponse({'error' : 'Question Not Found'}, status=404)
    
    return APIResponse(QuestionSerializer(question).data)

@api_view(['GET'])
# renamed 'response' to 'response_data' and 'get_response' to 'get_api_response' below 
# since it was causing errors when communicating with Django REST API through terminal due to naming conflicts

# old: def get_response(request):
def get_api_response(request):

    response_id = request.GET.get('response_id')

    if not response_id:
        return APIResponse({'error' : 'Missing response_id parameter'}, status=400)
    
    try:
        # old: response = Response.objects.get(response_id=response_id)
        response_data = Response.objects.get(response_id=response_id)
    except:
        # old: return APIResponse({'error' : 'Response Not Found'}, status=404)
        return APIResponse({'error' : 'Response Not Found'}, status=status.HTTP_404_NOT_FOUND)
    
    # old: return APIResponse(ResponseSerializer(response).data)
    return APIResponse(ResponseSerializer(response_data).data)

@api_view(['GET'])
def get_student(request):

    student_id = request.GET.get('student_id')

    if not student_id:
        return APIResponse({'error' : 'Missing student_id parameter'}, status=400)
    
    try:
        student = Student.objects.get(student_id=student_id)
    except:
        return APIResponse({'error' : 'Student Not Found'}, status=404)
    
    return APIResponse(StudentSerializer(student).data)

#This may not be necessary later on, but I added it here for consistency with the Models available
@api_view(['GET'])
def get_djangomigrations(request):

    djangomigrations_name = request.GET.get('name')

    if not djangomigrations_name:
        return APIResponse({'error' : 'Missing djangomigrations name parameter'}, status=400)
    
    try:
        name = DjangoMigrations.objects.get(name=djangomigrations_name)
    except:
        return APIResponse({'error' : 'Django Migration Not Found'}, status=404)
    
    return APIResponse(DjangoMigrationsSerializer(name).data)



class OllamaGenerateView(APIView):
    """
    Proxies POST requests from the client to the local Ollama API server.
    """
    
    def post(self, request, *args, **kwargs):
        try:
            # get promopt data
            ollamaPrompt = request.data.get('prompt')
            # gets model data
            ollamaModel = request.data.get('model', OLLAMA_DEFAULT_MODEL)

            if not ollamaPrompt:
                return APIResponse(
                    {"error": "A 'prompt' field is required in the request body."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            ollamaLogger.error(f"Error parsing request data: {e}")
            return APIResponse(
                {"error": "Invalid request data format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # prepares payload for the Ollama server
        ollamaPayload = {
            "model": ollamaModel,
            "prompt": ollamaPrompt,
            "stream": False,  # requests full response at once (not line-by-line); tried with 'True', causes error when contacting Django via terminal ({"error":"Ollama API request failed. Status: 200"})
        }

        # forwards request to Ollama
        try:
            ollamaResponse = requests.post(
                OLLAMA_API_URL,
                json=ollamaPayload,
                timeout=300 # 300s = 5min timeout for slow generations
            )
            
            # checks for HTTP errors from Ollama (e.g., 404, 500)
            ollamaResponse.raise_for_status()

            # returns full JSON response from Ollama back to client
            ollamaData = ollamaResponse.json()
            return APIResponse(ollamaData, status=status.HTTP_200_OK)
        
        # handles various errors and error messages
        except requests.exceptions.ConnectionError:
            ollamaLogger.error(f"Connection refused to Ollama at {OLLAMA_API_URL}. Check if Ollama is running.")
            return APIResponse(
                {"error": "Could not connect to the Ollama server. Check if Ollama is running (status 503)."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.Timeout:
            ollamaLogger.error("Ollama request timed out.")
            return APIResponse(
                {"error": "Ollama server took too long to respond (status 504)."},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            ollamaLogger.error(f"Ollama API request failed: {e}")
            return APIResponse(
                {"error": f"Ollama API request failed. Status: {ollamaResponse.status_code if 'ollamaResponse' in locals() else 'Unknown'}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except json.JSONDecodeError:
            ollamaLogger.error("Failed to decode JSON response from Ollama.")
            return APIResponse(
                {"error": "Received non-JSON response from Ollama. Check Ollama logs."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            ollamaLogger.error(f"An unexpected error occurred: {e}")
            return APIResponse(
                {"error": f"An unexpected server error occurred: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
