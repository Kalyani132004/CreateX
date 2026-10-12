from operator import ipow

from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    HealthView,
    StudentMeView,
    ProfileView,
    StudentRefreshTokenView,
    ChangePasswordView,
    InternalStudentDetailView,
    StudentListView
)

from .forgot_password  import StudentForgotPasswordView, StudentResetPasswordView
urlpatterns = [
    #for project identify user route
    path(
        "internal/students/<str:student_id>/",
        InternalStudentDetailView.as_view(),
        name="student-internal-lookup",
    ),
    #forgot password route
    path(
        "forgot-password/",
        StudentForgotPasswordView.as_view(),
        name="student-forgot-password",
    ),

    path(
        "reset-password/",
        StudentResetPasswordView.as_view(),
        name="student-reset-password",
    ),
    #student registration route
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
    ),
    
    path(
        "student/list/",
        StudentListView.as_view(),
        name="student-list",
    ),
]
