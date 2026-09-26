from django.urls import path
from .views import AuthProxyView, MeView, ProjectProxy


urlpatterns = [
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
]
