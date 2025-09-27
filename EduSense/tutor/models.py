# __Database__.db Models
# Author: Dillon Sapp
#
# This database was created utilizing DB Browser for SQLite and their respective Django models were 
# initially auto-generated with Django's built-in 'inspectdb' command.
# 'managed=false' has been commented out to allow Django to alter the models.

from django.db import models


class Assignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    due_date = models.TextField(blank=True, null=True)
    settings = models.TextField(blank=True, null=True)
    course = models.ForeignKey('Course', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Assignment'


class Conversation(models.Model):
    conversation_id = models.AutoField(primary_key=True)
    student = models.ForeignKey('Student', models.DO_NOTHING, blank=True, null=True)
    assignment = models.ForeignKey(Assignment, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Conversation'


class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    settings = models.TextField(blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Course'


class Instructor(models.Model):
    instructor_id = models.AutoField(primary_key=True)
    name = models.TextField(blank=True, null=True)
    email = models.IntegerField(blank=True, null=True)
    course_id = models.IntegerField(blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Instructor'


class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    question_text = models.TextField(blank=True, null=True)
    answer = models.TextField(blank=True, null=True)
    assignment = models.ForeignKey(Assignment, models.DO_NOTHING, blank=True, null=True)
    conversation = models.ForeignKey(Conversation, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Question'


class Response(models.Model):
    response_id = models.AutoField(primary_key=True)
    prompt = models.TextField(blank=True, null=True)
    raw_response = models.TextField(blank=True, null=True)
    final_response = models.TextField(blank=True, null=True)
    time = models.TextField(blank=True, null=True)
    conversation_id = models.IntegerField(blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Response'


class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    name = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    instructor = models.ForeignKey(Instructor, models.DO_NOTHING, blank=True, null=True)
    course = models.ForeignKey(Course, models.DO_NOTHING, blank=True, null=True)
    access_token = models.TextField(unique=True, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'Student'

class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        #managed = False
        db_table = 'django_migrations'
