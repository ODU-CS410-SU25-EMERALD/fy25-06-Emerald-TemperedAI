####################################################################################################   
# EduSense Views
# Author: Dillon Sapp
#
# This file defines handlers for the various API requests to our database and LLM. Using DRF 
# ModelViewSets creates a full set of CRUD API endpoints for each item in the database.
####################################################################################################

from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *

######################################## DATABASE ENDPOINTS ########################################

class assignment(ModelViewSet):
    queryset = Assignment.objects.all
    serializer_class = AssignmentSerializer

class conversation(ModelViewSet):
    queryset = Conversation.objects.all
    serializer_class = ConversationSerializer
    
class course(ModelViewSet):
    queryset = Course.objects.all
    serializer_class = CourseSerializer

class instructor(ModelViewSet):
    queryset = Instructor.objects.all
    serializer_class = InstructorSerializer

class question(ModelViewSet):
    queryset = Question.objects.all
    serializer_class = QuestionSerializer

class LLM_response(ModelViewSet):
    queryset = LLM_Response.objects.all
    serializer_class = ResponseSerializer

class student(ModelViewSet):
    queryset = Student.objects.all
    serializer_class = StudentSerializer

########################################### LLM ENDPOINTS ##########################################



