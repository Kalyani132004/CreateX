
from django.urls import path

from .views import AuthProxyView, MeView


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
]
