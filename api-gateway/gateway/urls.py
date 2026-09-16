
from django.urls import path

from .views import AuthProxyView ,ProjectProxyView, MeView


urlpatterns = [
    path(
        "auth/<str:user_type>/<path:path>/",
        AuthProxyView.as_view(),
        name="auth-proxy"
    ),
    path(
        "auth/me/",
        MeView.as_view(),
        name="auth-me",
    ),
     path(
        "projects/",
        ProjectProxyView.as_view(),
        name="project-proxy"
    ),
    

    path(
        "projects/<path:path>/",
        ProjectProxyView.as_view(),
        name="project-proxy-path"
    ),
]
