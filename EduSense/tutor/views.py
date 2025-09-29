####################################################################################################   
# EduSense Views
# Author: Dillon Sapp
#
# This file defines handlers for the various API requests to our database.
####################################################################################################

from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

########################################### API GETTERS ############################################

@APIView(['GET'])
def get_assignment(request):

    assignment_id = request.GET.get('assignment_id')

    if not assignment_id:
        return Response({'error' : 'Missing assignment_id parameter'}, status=400)
    
    try:
        assignment = Assignment.objects.get(assignment_id=assignment_id)
    except:
        return Response({'error' : 'Assignment Not Found'}, status=404)
    
    return Response(CourseSerializer(assignment).data)

@APIView(['GET'])
def get_conversation(request):
    
    conversation_id = request.GET.get('conversation_id')

    if not conversation_id:
        return Response({'error' : 'Missing conversation_id parameter'}, status=400)
    
    try:
        conversation = Conversation.objects.get(conversation_id=conversation_id)
    except:
        return Response({'error' : 'Conversation Not Found'}, status=404)
    
    return Response(CourseSerializer(conversation).data)

@APIView(['GET'])
def get_course(request):

    course_id = request.GET.get('course_id')

    if not course_id:
        return Response({'error' : 'Missing course_id parameter'}, status=400)
    
    try:
        course = Course.objects.get(course_id=course_id)
    except:
        return Response({'error' : 'Course Not Found'}, status=404)
    
    return Response(CourseSerializer(course).data)

@APIView(['GET'])
def get_instructor(request):

    instructor_id = request.GET.get('instructor_id')

    if not instructor_id:
        return Response({'error' : 'Missing instructor_id parameter'}, status=400)
    
    try:
        instructor = Instructor.objects.get(instructor_id=instructor_id)
    except:
        return Response({'error' : 'Instructor Not Found'}, status=404)
    
    return Response(InstructorSerializer(instructor).data)

@APIView(['GET'])
def get_question(request):

    question_id = request.GET.get('question_id')

    if not question_id:
        return Response({'error' : 'Missing question_id parameter'}, status=400)
    
    try:
        question = Question.objects.get(question_id=question_id)
    except:
        return Response({'error' : 'Question Not Found'}, status=404)
    
    return Response(QuestionSerializer(question).data)

@APIView(['GET'])
def get_response(request):

    response_id = request.GET.get('response_id')

    if not response_id:
        return Response({'error' : 'Missing response_id parameter'}, status=400)
    
    try:
        response = Response.objects.get(response_id=response_id)
    except:
        return Response({'error' : 'Response Not Found'}, status=404)
    
    return Response(ResponseSerializer(response).data)

@APIView(['GET'])
def get_student(request):

    student_id = request.GET.get('student_id')

    if not student_id:
        return Response({'error' : 'Missing student_id parameter'}, status=400)
    
    try:
        student = Student.objects.get(student_id=student_id)
    except:
        return Response({'error' : 'Student Not Found'}, status=404)
    
    return Response(StudentSerializer(student).data)

#This may not be necessary later on, but I added it here for consistency with the Models available
@APIView(['GET'])
def get_djangomigrations(request):

    djangomigrations_name = request.GET.get('name')

    if not djangomigrations_name:
        return Response({'error' : 'Missing djangomigrations name parameter'}, status=400)
    
    try:
        name = DjangoMigrations.objects.get(name=djangomigrations_name)
    except:
        return Response({'error' : 'Django Migration Not Found'}, status=404)
    
    return Response(DjangoMigrationsSerializer(name).data)
