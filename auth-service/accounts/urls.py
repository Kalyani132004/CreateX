from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    HealthView,
    StudentMeView,
    ProfileView,
    StudentRefreshTokenView,
    ChangePasswordView,
    InternalStudentDetailView
)

urlpatterns = [
    path(
        "internal/students/<str:student_id>/",
        InternalStudentDetailView.as_view(),
        name="student-internal-lookup",
    ),
    path(
        "student/register/",
        RegisterView.as_view(),
        name="student-register",
    ),

    path(
        "<str:user_type>/login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "<str:user_type>/refresh/",
        StudentRefreshTokenView.as_view(),
        name="refresh",
    ),
    path(
        "<str:user_type>/change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

    path(
        "<str:user_type>/profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    path(
        "me/",
        StudentMeView.as_view(),
        name="student-me",
    ),
    path(
        "health/",
        HealthView.as_view(),
        name="health",
    )
]
