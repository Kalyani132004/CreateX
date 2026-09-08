
"""
accounts/views.py

Auth endpoints, rewritten to match the actual model shape:

    User (AUTH_USER_MODEL) --- unique_id, email, role, password
      |-- OneToOne --> Student (first/last name, course, batch, ...)
      |-- OneToOne --> Faculty (first/last name, department, ...)

The important change from a flat "Student has its own unique_id/password"
model: login/password checks now happen against `User`, and profile fields
(course, batch, department, ...) are read from `user.profile`
(`user.student_profile` / `user.faculty_profile`).

This also lets us stop hand-parsing the JWT in StudentMeView. Because
LoginView issues tokens with `RefreshToken.for_user(user)`, the token's
"user_id" claim is the actual User primary key — exactly what DRF
SimpleJWT's default JWTAuthentication expects. So protected views can just
use `authentication_classes = [JWTAuthentication]` + `IsAuthenticated` and
read `request.user`, instead of manually decoding the token by hand.
"""

from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import User, Student, Faculty
from .serializers import StudentRegisterSerializer


class RegisterView(APIView):
    # Anyone can register; no token exists yet for this request.
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)

        if serializer.is_valid():
            # return the Student instance.
            student = serializer.save()

            return Response(
                {
                    "message": "Account created successfully.",
                    "student": {
                        "id": student.id,
                        "first_name": student.first_name,
                        "middle_name": student.middle_name,
                        "last_name": student.last_name,
                        # email/unique_id live on the linked User, not on Student.
                        "email": student.user.email,
                        "unique_id": student.user.unique_id,
                        "course": student.course,
                        "batch_start": student.batch_start,
                        "batch_end": student.batch_end,
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /auth/<student|faculty>/login
    body: { "unique_id": "...", "password": "..." }
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, user_type):

        # user_type from the URL doubles as the User.role value — student/faculty only.
        if user_type not in (User.Role.STUDENT, User.Role.FACULTY):
            return Response(
                {"detail": "Invalid user type."},
                status=status.HTTP_400_BAD_REQUEST
            )

        unique_id = (request.data.get("unique_id") or "").upper().strip()
        password = request.data.get("password") or ""

        # Filter by role too, so a valid unique_id can't authenticate through
        # the wrong endpoint even if IDs ever collided across roles.
        try:
            user = User.objects.get(unique_id=unique_id, role=user_type)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid unique ID or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # check_password() is provided by AbstractBaseUser — handles hashing/salting.
        if not user.is_active or not user.check_password(password):
            return Response(
                {"detail": "Invalid unique ID or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # for_user() sets the standard "user_id" claim to user.pk automatically.
        # We still stamp unique_id/role on top for convenience/debugging.
        refresh = RefreshToken.for_user(user)
        refresh["unique_id"] = user.unique_id
        refresh["role"] = user.role

        profile = user.profile  # -> user.student_profile or user.faculty_profile

        user_data = {
            "id": user.id,
            "email": user.email,
            "unique_id": user.unique_id,
        }

        # Role-specific fields, pulled from the matching profile row.
        if user_type == User.Role.STUDENT:
            user_data.update({
                "first_name": profile.first_name,
                "middle_name": profile.middle_name,
                "last_name": profile.last_name,
                "course": profile.course,
                "batch_start": profile.batch_start,
                "batch_end": profile.batch_end,
            })
        else:  # faculty
            user_data.update({
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                "department": profile.department,
            })

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "token_type": "Bearer",
            "role": user_type,
            user_type: user_data,
        })


class RefreshView(APIView):
    """
    POST /auth/student/refresh
    body: { "refresh_token": "<token>" }
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "refresh_token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            refresh = RefreshToken(refresh_token)
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Custom claims (unique_id, role) set at login are copied onto the
        # new access token automatically — SimpleJWT only drops reserved
        # claims like exp/iat on refresh, so nothing extra to do here.
        return Response({
            "access_token": str(refresh.access_token),
            "token_type": "Bearer",
        })


class StudentMeView(APIView):
    """
    GET /auth/student/me

    Standard JWT auth works here (unlike before) because LoginView now
    issues tokens via RefreshToken.for_user(), whose "user_id" claim is
    this User's primary key — DRF resolves request.user for us.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != User.Role.STUDENT:
            return Response(
                {"detail": "Invalid role."},
                status=status.HTTP_403_FORBIDDEN
            )

        student = get_object_or_404(Student, user=user)

        return Response({
            "id": student.id,
            "first_name": student.first_name,
            "middle_name": student.middle_name,
            "last_name": student.last_name,
            "email": user.email,
            "unique_id": user.unique_id,
            "course": student.course,
            "batch_start": student.batch_start,
            "batch_end": student.batch_end,
            "role": "student",
        })


class HealthView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "service": "auth-service",
            "status": "running",
            "port": 8001
        })
