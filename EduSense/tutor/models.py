####################################################################################################   
# __Database__.db Models
# Author: Dillon Sapp
#
# This database was created utilizing DB Browser for SQLite and their respective Django models were 
# initially auto-generated with Django's built-in 'inspectdb' command.
# 'managed=false' has been commented out to allow Django to alter the models.
####################################################################################################

from django.db import models


class Assignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    title = models.TextField(blank=True, null=True)
    due_date = models.TextField(blank=True, null=True)
    settings = models.TextField(blank=True, null=True)
    course = models.ForeignKey('Course', models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        #managed = False
        db_table = 'Assignment'


class Conversation(models.Model):
    conversation_id = models.AutoField(primary_key=True, default="12345")
    student = models.ForeignKey('Student', models.CASCADE)
    assignment = models.ForeignKey(Assignment, models.CASCADE)

    def __str__(self):
        return self.student

    class Meta:
        #managed = False
        db_table = 'Conversation'


class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    name = models.TextField(blank=True, null=True)
    settings = models.TextField(blank=True, null=True)

    def __str_(self):
        return self.name

    class Meta:
        #managed = False
        db_table = 'Course'


class Instructor(models.Model):
    instructor_id = models.AutoField(primary_key=True)
    name = models.TextField(blank=True, null=True)
    email = models.IntegerField(blank=True, null=True)
    access_token = models.TextField(unique=True)
    courses = models.ManyToManyField(Course)

    def __str__(self):
        return self.name

    class Meta:
        #managed = False
        db_table = 'Instructor'


class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    question_text = models.TextField()
    answer = models.TextField()
    assignment = models.ForeignKey(Assignment, models.CASCADE)
    conversation = models.ForeignKey(Conversation, models.DO_NOTHING, blank=True, null=True)

    def __str__(self):
        return self.question_text
    
    class Meta:
        #managed = False
        db_table = 'Question'


class Response(models.Model):
    response_id = models.AutoField(primary_key=True)
    prompt = models.TextField()
    raw_response = models.TextField()
    final_response = models.TextField()
    time = models.TextField()
    conversation = models.ForeignKey(Conversation, models.CASCADE)

    def __str__(self):
        return self.prompt

    class Meta:
        #managed = False
        db_table = 'Response'


class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    name = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    instructor = models.ManyToManyField(Instructor)
    courses = models.ManyToManyField(Course)
    access_token = models.TextField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        #managed = False
        db_table = 'Student'

class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    def __str__(self):
        return self.name

    class Meta:
        #managed = False
        db_table = 'django_migrations'
