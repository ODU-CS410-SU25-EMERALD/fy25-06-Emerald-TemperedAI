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
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import User # Ensure User model is accessible
from .serializers import UserSerializer # Ensure UserSerializer is accessible
from django.contrib.auth.hashers import make_password, check_password # For password hashing
from rest_framework.views import APIView

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
    #ollamaLogger.debug(f"[Sanitizer] Input length: {len(text)} chars")
    if not text:
        return text

    cleaned = text
    for word in BANNED_WORDS:
        if word in cleaned:
            ollamaLogger.warning(f"[Sanitizer] Redacting banned word: '{word}'")
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
    ollamaLogger.debug(f"[Promp Injection] Input length: {len(text)} chars")
    if not text:
        return False

    lower_text = text.lower()
    for pattern in INJECTION_PATTERNS:
        if pattern in lower_text:
            ollamaLogger.error(f"[Sanitizer] Detected potential prompt injection pattern: '{pattern}'")
            return True
   
    return False 

#logging for better error visibility in terminal
ollamaLogger = logging.getLogger(__name__)

# Ollama Config
OLLAMA_API_URL = 'http://localhost:11434/api/generate' # Local Ollama API URL
OLLAMA_DEFAULT_MODEL = 'edusense_testing:latest'  # Set preferred default model here



######################################## DATABASE ENDPOINTS ########################################

class assignmentViewSet(ModelViewSet):
    """
    Creates an Assignment ModelViewSet to provide CRUD API functionality for accessing the Assignment model
    """
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get("course_id")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

class conversationViewSet(ModelViewSet):
    """
    Creates a Conversation ModelViewSet to provide CRUD API functionality for accessing Conversation model
    """
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    
    def create(self, request, *args, **kwargs):
        #print("DEBUG Conversation POST data:", request.data)
        student_id = request.data.get('student')
        
        try:
            student_obj = Student.objects.get(pk=student_id) 
    
        except Student.DoesNotExist:
            return APIResponse({
                "student": [f"No Student object found for email: {student_id}"]
            }, status=status.HTTP_400_BAD_REQUEST)      

        request.data['student'] = student_obj.student_id  

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return APIResponse(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
class courseViewSet(ModelViewSet):
    """
    Creates a Course  ModelViewSet to provide CRUD API functionality for accessing the Course model
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class instructorViewSet(ModelViewSet):
    """
    Creates an Instructor ModelViewSet to provide CRUD API functionality for accessing the Instructor model
    """
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer

class questionViewSet(ModelViewSet):
    """
    Creates an Question ModelViewSet to provide CRUD API functionality for accessing the Question model
    """
    def create(self, request, *args, **kwargs):
        #print("DEBUG Questions POST data:", request.data)
        return super().create(request, *args, **kwargs)

    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class LLM_responseViewSet(ModelViewSet):
    """
    Creates an LLM Response ModelViewSet to provide CRUD API functionality for accessing the LLM Response model
    """
    queryset = LLM_Response.objects.all()
    serializer_class = ResponseSerializer

class studentViewSet(ModelViewSet):
    """
    Creates a Student ModelViewSet to provide CRUD API functionality for accessing the Student model
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


########################################### LLM ENDPOINTS ##########################################



class SignupView(APIView):
    """
    Handles user registration.
    """
    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data.get('email')

            # prevents duplicate email registration
            if User.objects.filter(email=email).exists():
                return APIResponse({"detail": "User with this email already exists."}, 
                                    status=status.HTTP_400_BAD_REQUEST)

            # hashes the password before saving
            user = serializer.save()
            user.password = make_password(serializer.validated_data['password'])
            user.save()

            role = user.role
        
            if role == 'student':
                try:
                    Student.objects.create(
                        name=user.username, 
                        email=user.email,
                        access_token=f"student-token-{user.user_id}", 
                    )
                except Exception as e:
                    return APIResponse({"detail": f"User registered, but student profile creation failed: {e}"}, 
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            elif role == 'teacher':
                pass
            return APIResponse({"detail": "User registered successfully."}, 
                                status=status.HTTP_201_CREATED)

        return APIResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Handles user login and returns role for frontend access control.
    """
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return APIResponse({"detail": "Must include email and password."}, 
                                status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # "need to register" message on frontend
            return APIResponse({"detail": "Invalid credentials or user not found. Please register first."}, 
                                status=status.HTTP_401_UNAUTHORIZED)

        # verifies password hash
        if not check_password(password, user.password):
            return APIResponse({"detail": "Invalid credentials or user not found. Please register first."}, 
                                status=status.HTTP_401_UNAUTHORIZED)

        return APIResponse({
            "email": user.email,
            "role": user.role
        }, status=status.HTTP_200_OK)











class OllamaGenerateView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    """
    Proxies POST requests from the client to the local Ollama API server.
    """
    def post(self, request, *args, **kwargs):
       
        #print("FILES RECEIVED:", request.FILES)
        #print(f"[OllamaGenerate] ConvID={request.data.get('conversation_id')}, AssignID={request.data.get('assignment_id')}")

        #print("DEBUG RAW request.data:", request.data)
        #print("DEBUG PROMPT TYPE:", type(request.data.get("prompt")))
        #print("DEBUG ASSIGNMENT TYPE:", type(request.data.get("assignment_id")))
        
        try:
            # get prompt data
            ollamaPrompt = request.data.get('prompt')

            conversation_id = request.data.get("conversation") or request.data.get("conversation_id")
            assignment_id = request.data.get("assignment") or request.data.get("assignment_id")

            ollamaLogger.info(f"[OllamaGenerate] ConvID={conversation_id}, AssignID={assignment_id}")
            
            if 'file' in request.FILES:
                uploaded_file = request.FILES['file']
                markdown_text = convert_file_to_markdown(uploaded_file)
                if markdown_text is not None:
                    markdown_text = markdown_text.strip()
                    assignment_block = (
                        "\n\n### Assignment Document (Safe Attachment)\n"
                        "```\n"
                        f"{markdown_text}\n"
                        "```\n"
                    )
                    ollamaPrompt = f"{(ollamaPrompt or '').strip()}{assignment_block}"
                else:
                    return APIResponse(
                        {"error": "Failed to convert file to Markdown."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
            #print("FULL PROMPT AFTER MARKDOWN")
            #print(ollamaPrompt)
            #print("END OF FULL PROMPT AFTER MARKDOWN")


            if not ollamaPrompt or not ollamaPrompt.strip():
                ollamaLogger.error(f"Prompt missing or whitespace-only. Received: {repr(ollamaPrompt)}")
                return APIResponse(
                {"error": "A 'prompt' field is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
    )

            #print("OLLAMA PROMPT RECEIVED:", ollamaPrompt[:200])

            #print("|||||||||||||||||")
            #print("OLLAM MODEL RECEIVED:", ollamaModel)
            #print("|||||||||||||||||")
           
            # sanitize prompt input
            ollamaPrompt = sanitize_input(ollamaPrompt)
            #ollamaLogger.debug(f"Ollama Prompt after sanitization: {ollamaPrompt}")

            if contains_prompt_injection(ollamaPrompt):
                ollamaLogger.warning(f"Stripped prompt injection from user input.")
                ollamaPrompt = "[User tried to override system instructions — sanitized.]"

            #ollamaLogger.debug(f"Ollama Prompt after sanitization: {ollamaPrompt}")


        # be more specific with error handling
        except KeyError as e:
            ollamaLogger.error(f"Missing required field in request data: {e}")
            return APIResponse(
                {"error": f"Missing required field: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except ValueError as e:
            ollamaLogger.error(f"Invalid value in request data: {e}")
            return APIResponse(
                {"error": f"Invalid value: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except TypeError as e:
            ollamaLogger.error(f"Type error in request data: {e}")
            return APIResponse(
                {"error": f"Type error: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            ollamaLogger.error(f"Error parsing request data: {e}")
            return APIResponse(
                {"error": "Invalid request data format."},
                status=status.HTTP_400_BAD_REQUEST
            )


        # gets model data
        ollamaModel = request.data.get('model', None)

        if assignment_id:
            try:
                assignment_obj = Assignment.objects.get(pk=assignment_id)
                if assignment_obj.llm_model:
                    ollamaModel = assignment_obj.llm_model
                    ollamaLogger.info(f"[OllamaGenerate] Using assignment-specific LLM model: {ollamaModel} for Assignment ID: {assignment_id}")
            except Assignment.DoesNotExist:
                ollamaLogger.warning(f"[OllamaGenerate] Assignment ID: {assignment_id} not found. Using default or provided model.")
                pass

            if not ollamaModel:
                ollamaModel = OLLAMA_DEFAULT_MODEL
                ollamaLogger.info(f"[OllamaGenerate] No model specified. Using default model: {OLLAMA_DEFAULT_MODEL}")

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