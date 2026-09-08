

from django.contrib import admin
from django.contrib.auth.models import User
from .models import Student, Faculty
# Register your models here.

admin.site.register([Student, Faculty])
class CustomAdmin(admin.ModelAdmin):
    list_display = ['username','email']
