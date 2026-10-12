
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
User = get_user_model()
class StudentForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:
            # email not exist  show error message
            return Response(
                {
                    "error": "Email does not exist please try again"

                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate UID
        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )
        #generate password reset token
        token = default_token_generator.make_token(user)

        frontend_url = (
            f"{settings.FRONTEND_URL}"
            f"/reset-password/{uid}/{token}/"
        )

        print('FRONTEND URL: ',frontend_url)

        send_mail(
            subject="CreateX Password Reset",
            message=(
                "You requested a password reset for your CreateX account.\n\n"
                f"Reset your password using this link:\n\n"
                f"{frontend_url}\n\n"
                "This link is valid for a limited time.\n\n"
                "If you did not request this password reset, "
                "you can safely ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": "you will receive a password reset link in this email"
            },
            status=status.HTTP_200_OK,
        )

class StudentResetPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        if not uid or not token or not password:
            return Response(
                {
                    "detail": "uid , token and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Decode UID
        try:
            user_id = urlsafe_base64_decode(uid).decode()

            user = User.objects.get(
                pk=user_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        #check the django token
        token_valid = default_token_generator.check_token(
            user,
            token
        )
        if not token_valid:
            return Response(
                {
                    'detail': 'Expired reset link'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Password validation
        if len(password) < 8:
            return Response(
                {
                    "detail": "Password must be at least 8 characters."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set new password
        user.set_password(password)
        user.save()
        return Response(
            {"detail": "Password reset successful."},
            status=status.HTTP_200_OK,
        )
