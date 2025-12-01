####################################################################################################   
# EduSense Views
# Author: Christian Biehn
####################################################################################################


from django.contrib import admin
from .models import User, Student, Conversation

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'email', 'role', 'username')
    search_fields = ('email', 'username')
    list_filter = ('role',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'email', 'name', 'access_token')
    search_fields = ('email', 'name')
    
@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('conversation_id', 'student', 'assignment')
    search_fields = ('conversation_id', 'assignment__title')


# superuser:
# user: admin
# pw: password