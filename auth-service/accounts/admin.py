
from django.contrib import admin
from .models import Student, Faculty, User

admin.site.register([Student, Faculty, User])
class CustomAdmin(admin.ModelAdmin):
    list_display = ['username','email']
