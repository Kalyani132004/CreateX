
from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    HealthView,
    StudentMeView,
    RefreshView
)


urlpatterns = [

    path(
        "student/register",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "<str:user_type>/login",
        LoginView.as_view(),
        name="login",
    ),

     path(
        "me/",
        StudentMeView.as_view(),
        name="student-me"
    ),

    path(
        "health",
        HealthView.as_view(),
        name="health"
    ),
    path("student/refresh", RefreshView.as_view(), name="refresh"),
]
