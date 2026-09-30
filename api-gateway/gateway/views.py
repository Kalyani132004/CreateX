import json
import stat
from django import views
import requests
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http.multipartparser import MultiPartParser

# SERVICE URLS
AUTH_SERVICE_URL = "http://127.0.0.1:8001"
PROJECTS_SERVICE_URL = "http://127.0.0.1:8002"

# HEADERS THAT MUST NOT BE FORWARDED
_EXCLUDED_REQUEST_HEADERS = {
    "host",
    "content-length",
    "content-type",
    "connection",
    "cookie",
}

# FORWARD HEADERS
def get_forwarded_headers(request):
    headers = {}

    for key, value in request.headers.items():
        if key.lower() not in _EXCLUDED_REQUEST_HEADERS:
            headers[key] = value

    return headers

# CHECK MULTIPART
def is_multipart_request(request):
    content_type = request.META.get("CONTENT_TYPE", "")
    return content_type.lower().startswith("multipart/form-data")


# GET JSON BODY
def get_json_body(request):
    if not request.body:
        return None

    content_type = request.META.get("CONTENT_TYPE", "")

    # Never decode multipart as JSON
    if content_type.lower().startswith("multipart/form-data"):
        return None

    try:
        return json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None

def get_multipart_data(request):
    if request.method == "POST":
        post_source = request.POST
        files_source = request.FILES
    else:
        parser = MultiPartParser(
            request.META,
            request,
            request.upload_handlers,
            request.encoding,
        )
        post_source, files_source = parser.parse()

    # Normal form fields
    data = {}

    for key in post_source:
        data[key] = post_source.get(key)

    # Uploaded files
    files = []

    for key in files_source:
        uploaded_files = files_source.getlist(key)

        for uploaded_file in uploaded_files:
            files.append(
                (
                    key,
                    (
                        uploaded_file.name,
                        uploaded_file.read(),
                        uploaded_file.content_type,
                    )
                )
            )

    return data, files

# PROXY RESPONSE
def proxy_response(response):
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


# AUTH PROXY
@method_decorator(csrf_exempt, name="dispatch")
class AuthProxyView(View):

    def dispatch_request(self, request, user_type, path=""):
        # Validate user type
        if user_type not in ["student", "faculty"]:
            return JsonResponse(
                {"detail": "Invalid user type."},
                status=400,
            )

        # Allowed methods
        allowed_methods = [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ]

        if request.method not in allowed_methods:
            return JsonResponse(
                {"detail": "Method not allowed."},
                status=405,
            )

        # Build target URL
        path = path.strip("/")
        target_url = (
            f"{AUTH_SERVICE_URL}/auth/"
            f"{user_type}/{path}/"
            if path
            else f"{AUTH_SERVICE_URL}/auth/{user_type}/"
        )

        # Forward headers
        headers = get_forwarded_headers(request)

        try:
            # MULTIPART REQUEST
            if is_multipart_request(request):
                data, files = get_multipart_data(request)

                response = requests.request(
                    method=request.method,
                    url=target_url,
                    data=data,
                    files=files,
                    params=request.GET.dict(),
                    headers=headers,
                    timeout=30,
                )

            # JSON REQUEST
            else:
                body = get_json_body(request)

                if request.body and body is None:
                    return JsonResponse(
                        {"detail": "Invalid JSON body."},
                        status=400,
                    )

                response = requests.request(
                    method=request.method,
                    url=target_url,
                    json=body,
                    params=request.GET.dict(),
                    headers=headers,
                    timeout=30,
                )

        except requests.exceptions.ConnectionError:
            return JsonResponse(
                {
                    "detail": (
                        "Auth Service is unavailable. "
                        "Make sure Auth Service is running "
                        "on port 8001."
                    )
                },
                status=503,
            )

        except requests.exceptions.Timeout:
            return JsonResponse(
                {"detail": "Auth Service request timed out."},
                status=504,
            )

        except requests.exceptions.RequestException as exc:
            return JsonResponse(
                {"detail": f"Auth Service request failed: {exc}"},
                status=502,
            )

        return proxy_response(response)

    def get(self, request, user_type, path=""):
        return self.dispatch_request(request, user_type, path)

    def post(self, request, user_type, path=""):
        return self.dispatch_request(request, user_type, path)

    def put(self, request, user_type, path=""):
        return self.dispatch_request(request, user_type, path)

    def patch(self, request, user_type, path=""):
        return self.dispatch_request(request, user_type, path)

    def delete(self, request, user_type, path=""):
        return self.dispatch_request(request, user_type, path)


# CURRENT USER
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
        forwarded_headers = get_forwarded_headers(request)

        try:
            response = requests.get(
                url=f"{AUTH_SERVICE_URL}/auth/me/",
                headers=forwarded_headers,
                params=request.GET.dict(),
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
                {"detail": "Auth Service request timed out."},
                status=504,
            )

        except requests.exceptions.RequestException as exc:
            return JsonResponse(
                {"detail": f"Auth Service request failed: {exc}"},
                status=502,
            )

        return proxy_response(response)


# PROJECT PROXY
@method_decorator(csrf_exempt, name="dispatch")
class ProjectProxy(View):
    def dispatch_request(self, request, path=""):
        allowed_methods = [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ]

        if request.method not in allowed_methods:
            return JsonResponse(
                {"detail": "Method not allowed."},
                status=405,
            )

        path = path.strip("/")
        if path:
            target_url = (
                f"{PROJECTS_SERVICE_URL}/projects/"
                f"{path}/"
            )
        else:
            target_url = f"{PROJECTS_SERVICE_URL}/projects/"

        headers = get_forwarded_headers(request)

        try:
            # MULTIPART
            if is_multipart_request(request):
                data, files = get_multipart_data(request)

                response = requests.request(
                    method=request.method,
                    url=target_url,
                    data=data,
                    files=files,
                    params=request.GET.dict(),
                    headers=headers,
                    timeout=30,
                )

            # JSON
            else:
                body = get_json_body(request)

                if request.body and body is None:
                    return JsonResponse(
                        {"detail": "Invalid JSON body."},
                        status=400,
                    )

                response = requests.request(
                    method=request.method,
                    url=target_url,
                    json=body,
                    params=request.GET.dict(),
                    headers=headers,
                    timeout=30,
                )

        except requests.exceptions.ConnectionError:
            return JsonResponse(
                {
                    "detail": (
                        "Projects Service is unavailable. "
                        "Make sure Projects Service is running "
                        "on port 8002."
                    )
                },
                status=503,
            )

        except requests.exceptions.Timeout:
            return JsonResponse(
                {"detail": "Projects Service request timed out."},
                status=504,
            )

        except requests.exceptions.RequestException as exc:
            return JsonResponse(
                {
                    "detail": (
                        f"Projects Service request failed: {exc}"
                    )
                },
                status=502,
            )

        return proxy_response(response)

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

class ProjectFeedbackView(APIView):

    target_url = f"{PROJECTS_SERVICE_URL}/projects"

    def get(self, request, project_id):
        try:
            res = requests.get(
                f"{self.target_url}/{project_id}/feedback/",
                headers={
                    "Authorization": request.headers.get("Authorization", "")
                }
            )

            return JsonResponse(
                res.json(),
                status=res.status_code,
                safe=False
            )

        except requests.RequestException as e:
            return JsonResponse(
                {"error": str(e)},
                status=502
            )

    def post(self, request, project_id):
        try:
            res = requests.post(
                f"{self.target_url}/{project_id}/feedback/",
                json=request.data,
                headers={
                    "Authorization": request.headers.get("Authorization", "")
                }
            )

            return JsonResponse(
                res.json(),
                status=res.status_code,
                safe=False
            )

        except requests.RequestException as e:
            return JsonResponse(
                {"error": str(e)},
                status=502
            )
