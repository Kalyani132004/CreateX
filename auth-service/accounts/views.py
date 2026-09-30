
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import User, Student, Faculty
from .serializers import StudentRegisterSerializer, StudentSerializer, FacultySerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.parsers import MultiPartParser, FormParser

class RegisterView(APIView):
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


        if user_type == User.Role.STUDENT:
            # check_password() is provided by AbstractBaseUser — handles hashing/salting.
            if not user.is_active or not user.check_password(password):
                return Response(
                    {"detail": "Invalid unique ID or password."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            pass

        # for_user() sets the standard "user_id" claim to user.pk automatically.
        # We still stamp unique_id/role on top for convenience/debugging.
        refresh = RefreshToken.for_user(user)
        refresh["unique_id"] = user.unique_id
        refresh["role"] = user.role

        profile = user.profile  #  user.student_profile or user.faculty_profile

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

        student = get_object_or_404(Student, user=request.user)

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
            "role": "student"
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

class ProfileView(APIView):
    """
    Profile API for authenticated students and faculty.

    GET:
        Returns the complete profile of the logged-in user.

    PATCH:
        Updates the logged-in user's profile.

    Supports:
        - JSON/form data
        - multipart/form-data
        - profile photo upload
    """

    authentication_classes = [JWTAuthentication]

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]
    #get profile
    def get(self, request, user_type):
        """
        Return the authenticated user's profile.
        """

        #validate user type
        if user_type not in ( User.Role.STUDENT, User.Role.FACULTY):
            return Response(
                {
                    "detail": "Invalid user type."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        # Make sure the authenticated user owns this role
        if request.user.role != user_type:
            return Response(
                {
                    "detail": (
                        "You are not authorized to "
                        "access this profile."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        # STUDENT PROFILE
        if user_type == User.Role.STUDENT:

            student = get_object_or_404(
                Student.objects.select_related("user"),
                user=request.user,
            )

            profile = {
                # Identity
                "first_name": student.first_name,

                "middle_name": student.middle_name,

                "last_name": student.last_name,

                "full_name": student.full_name,

                "email": student.user.email,

                "college_id": student.user.unique_id,

                "role": student.user.role,

                # Academic
                "course": student.course,

                "batch_start": student.batch_start,

                "batch_end": student.batch_end,

                "batch": student.batch,

                # Skills
                "skills": student.skills or [],

                # Profile
                "bio": student.bio or "",

                # Social links
                "github_url": student.github_url or "",

                "linkedin_url": student.linkedin_url or "",

                "leetcode_url": student.leetcode_url or "",

                "gfg_url": student.gfg_url or "",

                # Profile photo
                "profile_photo": (
                    request.build_absolute_uri(
                        student.profile_photo.url
                    )
                    if student.profile_photo
                    else ""
                ),
            }

            return Response(
                {
                    "profile": profile
                },
                status=status.HTTP_200_OK,
            )

        # FACULTY PROFILE
        faculty = get_object_or_404(
            Faculty.objects.select_related("user"),
            user=request.user,
        )

        profile = {
            # Identity
            "first_name": faculty.first_name,

            "last_name": faculty.last_name,

            "full_name": faculty.full_name,

            "email": faculty.user.email,

            "staff_id": faculty.user.unique_id,

            "role": faculty.user.role,

            # Faculty information
            "department": faculty.department or "",

            "bio": faculty.bio or "",

            # Profile photo
            "profile_photo": (
                request.build_absolute_uri(
                    faculty.profile_photo.url
                )
                if faculty.profile_photo
                else ""
            ),
        }

        return Response(
            {
                "profile": profile
            },
            status=status.HTTP_200_OK,
        )

    # PATCH PROFILE
    def patch(self, request, user_type):
        """
        Update the authenticated user's profile.
        """

        # Validate user type

        if user_type not in (
            User.Role.STUDENT,
            User.Role.FACULTY,
        ):
            return Response(
                {
                    "detail": "Invalid user type."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Authorization
        if request.user.role != user_type:
            return Response(
                {
                    "detail": (
                        "You are not authorized to "
                        "update this profile."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # STUDENT
        if user_type == User.Role.STUDENT:

            student = get_object_or_404(
                Student.objects.select_related("user"),
                user=request.user,
            )

            serializer = StudentSerializer(
                student,
                data=request.data,
                partial=True,
            )

        # FACULTY
        else:

            faculty = get_object_or_404(
                Faculty.objects.select_related("user"),
                user=request.user,
            )

            serializer = FacultySerializer(
                faculty,
                data=request.data,
                partial=True,
            )

        # Validate
        if not serializer.is_valid():
            return Response(
                {
                    "detail": "Invalid form details.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )



        # Save
        instance = serializer.save()
        print("========== PHOTO DEBUG ==========")
        print("CONTENT TYPE:", request.content_type)
        print("REQUEST DATA:", request.data)
        print("REQUEST FILES:", request.FILES)
        print("PROFILE PHOTO:", request.FILES.get("profile_photo"))
        print("=================================")
        print("SAVED PHOTO:", instance.profile_photo)
        print("PHOTO NAME:", instance.profile_photo.name if instance.profile_photo else None)
        print("PHOTO URL:", instance.profile_photo.url if instance.profile_photo else None)

        # UPDATED STUDENT PROFILE
        if user_type == User.Role.STUDENT:

            student = instance

            profile = {
                "first_name": student.first_name,

                "middle_name": student.middle_name,

                "last_name": student.last_name,

                "full_name": student.full_name,

                "email": student.user.email,

                "college_id": student.user.unique_id,

                "role": student.user.role,

                "course": student.course,

                "batch_start": student.batch_start,

                "batch_end": student.batch_end,

                "batch": student.batch,

                "skills": student.skills or [],

                "bio": student.bio or "",

                "github_url": student.github_url or "",

                "linkedin_url": student.linkedin_url or "",

                "leetcode_url": student.leetcode_url or "",

                "gfg_url": student.gfg_url or "",

                "profile_photo": (
                    request.build_absolute_uri(
                        student.profile_photo.url
                    )
                    if student.profile_photo
                    else ""
                ),
            }

        # UPDATED FACULTY PROFILE
        else:

            faculty = instance

            profile = {
                "first_name": faculty.first_name,

                "last_name": faculty.last_name,

                "full_name": faculty.full_name,

                "email": faculty.user.email,

                "staff_id": faculty.user.unique_id,

                "role": faculty.user.role,

                "department": faculty.department or "",

                "bio": faculty.bio or "",

                "profile_photo": (
                    request.build_absolute_uri(
                        faculty.profile_photo.url
                    )
                    if faculty.profile_photo
                    else ""
                ),
            }

        # FINAL RESPONSE
        return Response(
            {
                "detail": "Profile updated successfully.",
                "profile": profile,
            },
            status=status.HTTP_200_OK,
        )

class ChangePasswordView(APIView):
    def post(self, request, user_type):
        if user_type not in (User.Role.FACULTY, User.Role.STUDENT):
            return Response(
                {'details':'Invalid type'},
                status=status.HTTP_403_FORBIDDEN
            )

        if user_type != request.user.role:
            return Response(
                {'details':'Invalid type'},
                status=status.HTTP_403_FORBIDDEN
            )

        #retrieve pyload
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        #ensure both fields are provided
        if not current_password or not new_password:
            return Response(
                {"error": "Both current_password and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = request.user
        #check the existing password
        if not user.check_password(current_password):
            return Response({'details':"Invalid current password please try again."},status=status.HTTP_400_BAD_REQUEST)

        # same password does not allow
        if current_password == new_password:
            return Response(
                {"details": "New password cannot be the same as the current password."},
                status=status.HTTP_400_BAD_REQUEST
            )
        #set the new password
        user.set_password(new_password)
        user.save()
        return Response({'details':"Password update successfully."},status=status.HTTP_200_OK)

class StudentRefreshTokenView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, user_type):
        if user_type not in (User.Role.STUDENT, User.Role.FACULTY):
            return Response(
                {"detail": "Invalid user type."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)

            return Response(
                {
                    "access_token": str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )

        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

class InternalStudentDetailView(APIView):

    def get(self, request, student_id):
        try:
            student = (
                Student.objects
                .select_related("user")
                .get(user__unique_id=student_id)
            )

        except Student.DoesNotExist:
            return Response(
                {
                    "detail": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "user_id": student.user.id,
                "unique_id": student.user.unique_id,
                "full_name": student.full_name,
                "course": student.course,
                "batch": student.batch,
            },
            status=status.HTTP_200_OK
        )
