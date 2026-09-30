from django.urls import path

from .views import ProjectFeedbackView

urlpatterns = [
    path(
        "<int:project_id>/feedback/",
        ProjectFeedbackView.as_view(),
        name="project-feedback",
    ),
]
