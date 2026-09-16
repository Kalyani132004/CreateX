import json
from django import views
import requests

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt


# Auth service URL
AUTH_SERVICE_URL = "http://127.0.0.1:8001"



# Headers we should NOT blindly forward
_EXCLUDED_REQUEST_HEADERS = {
    "host",
    "content-length",
    "content-type",
    "connection",
    "cookie",
}


@method_decorator(csrf_exempt, name="dispatch")
class AuthProxyView(View):

    def dispatch_request(self, request, user_type, path):

        # Allow only student/faculty
        if user_type not in ["student", "faculty"]:
            return JsonResponse(
                {"detail": "Invalid user type"},
                status=400
            )

        # Check methods
        if request.method not in [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ]:
            return JsonResponse(
                {"detail": "Method not allowed"},
                status=405
            )

        # Parse JSON body
        body = None

        if request.body:
            try:
                body = json.loads(
                    request.body.decode("utf-8")
                )
            except json.JSONDecodeError:
                return JsonResponse(
                    {"detail": "Invalid JSON body"},
                    status=400
                )

        # Build target Auth Service URL
        target_url = (
            f"{AUTH_SERVICE_URL}/auth/{user_type}/{path}"
        )

        # Forward query parameters
        query_params = request.GET.dict()

        # Forward required headers
        forwarded_headers = {}

        for header_key, header_value in request.headers.items():

            if header_key.lower() not in _EXCLUDED_REQUEST_HEADERS:
                forwarded_headers[header_key] = header_value

        try:
            #send the response to the auth service
            response = requests.request(
                method=request.method,
                url=target_url,
                json=body,
                params=query_params,
                headers=forwarded_headers,
                timeout=10,
            )

        except requests.exceptions.ConnectionError:
            return JsonResponse(
                {
                    "detail": (
                        "Auth Service is unavailable. "
                        "Make sure Django Auth Service "
                        "is running on port 8001."
                    )
                },
                status=503,
            )

        except requests.exceptions.Timeout:
            return JsonResponse(
                {
                    "detail": "Auth Service request timed out."
                },
                status=504,
            )

        except requests.exceptions.RequestException as exc:
            return JsonResponse(
                {
                    "detail": f"Auth Service request failed: {exc}"
                },
                status=502,
            )

        # Parse Auth Service response
        try:
            data = response.json()

        except ValueError:
            data = {
                "detail": response.text
            }

        return JsonResponse(
            data,
            status=response.status_code,
            safe=isinstance(data, dict),
        )

    def get(self, request, user_type, path=""):
        return self.dispatch_request(
            request,
            user_type,
            path
        )

    def post(self, request, user_type, path=""):
        return self.dispatch_request(
            request,
            user_type,
            path
        )

    def put(self, request, user_type, path=""):
        return self.dispatch_request(
            request,
            user_type,
            path
        )

    def patch(self, request, user_type, path=""):
        return self.dispatch_request(
            request,
            user_type,
            path
        )

    def delete(self, request, user_type, path=""):
        return self.dispatch_request(
            request,
            user_type,
            path
        )
@method_decorator(csrf_exempt, name="dispatch")
class MeView(View):
    """
    Gateway endpoint for the currently authenticated user.

    Frontend:
        GET /api/auth/me/

    Gateway forwards to:
        GET http://127.0.0.1:8001/auth/me/
    """

    def get(self, request):
        forwarded_headers = {}

        for header_key, header_value in request.headers.items():
            if header_key.lower() not in _EXCLUDED_REQUEST_HEADERS:
                forwarded_headers[header_key] = header_value

        try:
            response = requests.get(
                url=f"{AUTH_SERVICE_URL}/auth/me/",
                headers=forwarded_headers,
                timeout=10,
            )

        except requests.exceptions.ConnectionError:
            return JsonResponse(
                {
                    "detail": (
                        "Auth Service is unavailable. "
                        "Make sure Django Auth Service "
                        "is running on port 8001."
                    )
                },
                status=503,
            )

        except requests.exceptions.Timeout:
            return JsonResponse(
                {
                    "detail": "Auth Service request timed out."
                },
                status=504,
            )

        except requests.exceptions.RequestException as exc:
            return JsonResponse(
                {
                    "detail": f"Auth Service request failed: {exc}"
                },
                status=502,
            )

        try:
            data = response.json()
        except ValueError:
            data = {
                "detail": response.text
            }

        return JsonResponse(
            data,
            status=response.status_code,
            safe=isinstance(data, dict),
        )
PROJECT_SERVICE_URL = "http://127.0.0.1:8002"


@method_decorator(csrf_exempt, name="dispatch")
class ProjectProxyView(View):

    def dispatch_request(self, request, path=""):

        if request.method not in [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ]:
            return JsonResponse(
                {"detail": "Method not allowed"},
                status=405
            )

        target_url = f"{PROJECT_SERVICE_URL}/projects/{path}"

        query_params = request.GET.dict()

        forwarded_headers = {}

        for header_key, header_value in request.headers.items():

            if header_key.lower() not in _EXCLUDED_REQUEST_HEADERS:
                forwarded_headers[header_key] = header_value

        try:

            # Handle file upload
            if request.content_type.startswith("multipart/form-data"):

                data = request.POST.copy()

                files = []

                for key in request.FILES:

                    for uploaded_file in request.FILES.getlist(key):
                        files.append(
                            (
                                key,
                                (
                                    uploaded_file.name,
                                    uploaded_file.file,
                                    uploaded_file.content_type
                                )
                            )
                        )

                response = requests.request(
                    method=request.method,
                    url=target_url,
                    data=data,
                    files=files,
                    params=query_params,
                    headers=forwarded_headers,
                    timeout=30,
                )

            else:

                body = None

                if request.body:

                    try:
                        body = json.loads(
                            request.body.decode("utf-8")
                        )

                    except json.JSONDecodeError:
                        return JsonResponse(
                            {"detail": "Invalid JSON body"},
                            status=400
                        )

                response = requests.request(
                    method=request.method,
                    url=target_url,
                    json=body,
                    params=query_params,
                    headers=forwarded_headers,
                    timeout=30,
                )

        except requests.exceptions.ConnectionError:

            return JsonResponse(
                {
                    "detail": (
                        "Project Service is unavailable. "
                        "Make sure Project Service "
                        "is running on port 8002."
                    )
                },
                status=503,
            )

        except requests.exceptions.Timeout:

            return JsonResponse(
                {
                    "detail": "Project Service request timed out."
                },
                status=504,
            )

        except requests.exceptions.RequestException as exc:

            return JsonResponse(
                {
                    "detail": f"Project Service request failed: {exc}"
                },
                status=502,
            )

        try:

            data = response.json()

        except ValueError:

            data = {
                "detail": response.text
            }

        return JsonResponse(
            data,
            status=response.status_code,
            safe=isinstance(data, dict),
        )

    def get(self, request, path=""):
        return self.dispatch_request(request, path)

    def post(self, request, path=""):
        return self.dispatch_request(request, path)

    def put(self, request, path=""):
        return self.dispatch_request(request, path)

    def patch(self, request, path=""):
        return self.dispatch_request(request, path)

    def delete(self, request, path=""):
        return self.dispatch_request(request, path)