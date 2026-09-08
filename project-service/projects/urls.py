
from django.urls import include, path
from .views import addProjects
urlpatterns = [
    path('add/projects/', addProjects),
]
