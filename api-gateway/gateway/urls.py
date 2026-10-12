from django.urls import path
from .views import (
    AuthProxyView,
    MeView,
    ProjectProxy,
    ProjectFeedbackView,
    MLView
)

urlpatterns = [
    #forgot passsword
    path(
        'auth/<str:user_type>/',
        AuthProxyView.as_view(),
        name='forgot-password-proxy'
    ),
    path(
        "auth/<str:user_type>/<path:path>/",
        AuthProxyView.as_view(),
        name="auth-proxy",
    ),
    path(
        "auth/me/",
        MeView.as_view(),
        name="auth-me",
    ),

    # IMPORTANT: specific route first
    path(
        "projects/<int:project_id>/feedback/",
        ProjectFeedbackView.as_view(),
        name="project-feedback",
    ),

    # Generic route after specific routes
    path(
        "projects/<path:path>/",
        ProjectProxy.as_view(),
        name="project-proxy",
    ),
    path(
        "projects/",
        ProjectProxy.as_view(),
        name="project-proxy-root",
    ),
    path(
        "ml/analyze",
        MLView.as_view()
    )
]
