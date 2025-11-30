####################################################################################################   
# __Database__.db Model Serializers
# Author: Dillon Sapp
#
# This file contains the serializer classes used to convert each item in our database into JSON 
####################################################################################################

from rest_framework import serializers
from .models import *

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    assignment = serializers.PrimaryKeyRelatedField(
        queryset=Assignment.objects.all(),
        allow_null=True,
        required=False
    )
    conversation = serializers.PrimaryKeyRelatedField(
        queryset=Conversation.objects.all(),
        allow_null=True,
        required=False
)

    class Meta:
        model = Question
        fields = '__all__'

class ResponseSerializer(serializers.ModelSerializer):
    conversation = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all())
    class Meta:
        model = LLM_Response
        fields = '__all__'

class ConversationSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True, source='question_set')
    llm_responses = ResponseSerializer(many=True, read_only=True, source='llm_response_set')
    
    assignment = serializers.PrimaryKeyRelatedField(
        queryset=Assignment.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Conversation
        fields = [
            'conversation_id',
            'student',
            'assignment',
            'questions',
            'llm_responses',
        ]


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class DjangoMigrationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoMigrations
        fields = '__all__'