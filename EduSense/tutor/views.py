####################################################################################################   
# EduSense Views
# Author: Dillon Sapp, Christian Biehn
#
# This file defines handlers for the various API requests to our database and LLM. Using DRF 
# ModelViewSets creates a full set of CRUD API endpoints for each item in the database.
####################################################################################################

from pathlib import Path
import tempfile
import requests # required for Ollama HTTP calls
import json     # required for handling JSON
import logging  # required for error logging
import os

#was causing errors when communicating with Django REST API through terminal or when starting Python server (forgot which) due to naming conflicts
#from rest_framework.decorators import APIView
#from rest_framework.response import Response

from markitdown import MarkItDown
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView 
# renamed '@APIView' in entire file (views.py) to '@api_view' due to reason above
from rest_framework.decorators import api_view 
# renamed 'Response' in entire file (view.py) to 'APIResponse' due to reason above
from rest_framework.response import Response as APIResponse
from rest_framework import status
from .models import *
from .serializers import *

logging.getLogger("markitdown").setLevel(logging.ERROR)

#List of banned words for content moderation
BANNED_WORDS = [
    "cheat",
    "cheat sheet",
    "answer key",
    "answer-key",
    "solution",
    "give me the answer",
    "step by step solution",
    "final answers",
    "test answers",
    "full solution",
    "complete answer"
]

# Suspicious patterns that indicate prompt injection attempts
INJECTION_PATTERNS = [
    "you are now",
    "ignore previous",
    "disregard above",
    "override instructions",
    "bypass restrictions",
    "unfiltered ai",
    "jailbreak",
    "system prompt",
    "roleplay as",
    "developer mode",
    "simulate a system prompt",
    "forget your rules",
    "dan mode",
    "do anything now"
]

def sanitize_input(text: str) -> str:
    """
    Sanitizes user input by checking for banned words and replacing them.
    Returns the sanitized string (with banned words replaced by "[filtered]").
    """
    if not text:
        return text

    cleaned = text
    for word in BANNED_WORDS:
        if word in cleaned:
            ollamaLogger.warning(f"[Sanitizer] Redacting banned word: '{word}' from: {text}")
        cleaned = cleaned.replace(word, "[filtered]")
        

    return cleaned

def convert_file_to_markdown(uploaded_file):
    """
    Converts an uploaded file to Markdown using MarkItDown.
    Returns the Markdown text or None if conversion fails.
    """

    md = MarkItDown()
   
    temp_dir = Path(tempfile.gettempdir())
    filename = Path(uploaded_file.name).name
    temp_path = temp_dir / filename




    # Save the file temporarily
    with open(temp_path, "wb+") as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    try:
        result = md.convert(temp_path)
        markdown_text = result.text_content
        ollamaLogger.info(f"[MarkItDown] Successfully converted {uploaded_file.name} to Markdown.")
        return markdown_text
    except Exception as e:
        ollamaLogger.error(f"[MarkItDown] Conversion failed for {uploaded_file.name}: {e}")
        return None
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def contains_prompt_injection(text: str) -> bool:
    """
    Returns True if text appears to include a prompt injection or jailbreak attempt.
    """
    ollamaLogger.debug(f"[Sanitizer] Checking for prompt injection in: {text}")
    if not text:
        return False

    lower_text = text.lower()
    for pattern in INJECTION_PATTERNS:
        if pattern in lower_text:
            ollamaLogger.error(f"[Sanitizer] Detected potential prompt injection pattern: '{pattern}' in: {text}")
            return True
   

#logging for better error visibility in terminal
ollamaLogger = logging.getLogger(__name__)

# Ollama Config
OLLAMA_API_URL = 'http://localhost:11434/api/generate' # Local Ollama API URL
OLLAMA_DEFAULT_MODEL = 'edusense:latest'  # Set preferred default model here



######################################## DATABASE ENDPOINTS ########################################

class assignment(ModelViewSet):
    """
    Creates an Assignment ModelViewSet to provide CRUD API functionality for accessing the Assignment model
    """
    queryset = Assignment.objects.all
    serializer_class = AssignmentSerializer

class conversation(ModelViewSet):
    """
    Creates a Conversation ModelViewSet to provide CRUD API functionality for accessing Conversation model
    """
    queryset = Conversation.objects.all
    serializer_class = ConversationSerializer
    
class course(ModelViewSet):
    """
    Creates a Course  ModelViewSet to provide CRUD API functionality for accessing the Course model
    """
    queryset = Course.objects.all
    serializer_class = CourseSerializer

class instructor(ModelViewSet):
    """
    Creates an Instructor ModelViewSet to provide CRUD API functionality for accessing the Instructor model
    """
    queryset = Instructor.objects.all
    serializer_class = InstructorSerializer

class question(ModelViewSet):
    """
    Creates an Question ModelViewSet to provide CRUD API functionality for accessing the Question model
    """
    queryset = Question.objects.all
    serializer_class = QuestionSerializer

class LLM_response(ModelViewSet):
    """
    Creates an LLM Response ModelViewSet to provide CRUD API functionality for accessing the LLM Response model
    """
    queryset = LLM_Response.objects.all
    serializer_class = ResponseSerializer

class student(ModelViewSet):
    """
    Creates a Student ModelViewSet to provide CRUD API functionality for accessing the Student model
    """
    queryset = Student.objects.all
    serializer_class = StudentSerializer


########################################### LLM ENDPOINTS ##########################################

class OllamaGenerateView(APIView):
    """
    Proxies POST requests from the client to the local Ollama API server.
    """
    def post(self, request, *args, **kwargs):
        try:
            # get prompt data
            ollamaPrompt = request.data.get('prompt')
            # gets model data
            ollamaModel = request.data.get('model', OLLAMA_DEFAULT_MODEL)
            if 'file' in request.FILES:
                uploaded_file = request.FILES['file']
                markdown_text = convert_file_to_markdown(uploaded_file)
                if markdown_text:
                    # Append converted Markdown to any existing prompt
                    ollamaPrompt = (ollamaPrompt or "") + "\n\n---\n\n" + markdown_text
                else:
                    return APIResponse(
                        {"error": "Failed to convert file to Markdown."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            if not ollamaPrompt:
                return APIResponse(
                    {"error": "A 'prompt' field is required in the request body."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            ollamaPrompt = sanitize_input(ollamaPrompt)

            if contains_prompt_injection(ollamaPrompt):
                ollamaLogger.warning(f"Stripped prompt injection from: {ollamaPrompt}")
                ollamaPrompt = "[User tried to override system instructions — sanitized.]"

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
            "stream": False,  # requests full response at once (not line-by-line); tried with 'True', 
                              # causes error when contacting Django via terminal ({"error":"Ollama API request failed. Status: 200"})
        }

        # forwards request to Ollama
        try:
            ollamaResponse = requests.post(
                OLLAMA_API_URL,
                json = ollamaPayload,
                timeout = 300 # 300s = 5min timeout for slow generations
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