from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class ServiceUser:
    def __init__(self, user_id, unique_id=None, role=None):
        self.id = int(user_id)
        self.unique_id = unique_id
        self.role = role

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False


class MicroserviceJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):

        header = self.get_header(request)

        if header is None:
            return None

        raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        user_id = validated_token.get("user_id")

        if user_id is None:
            raise AuthenticationFailed(
                "Token does not contain user_id."
            )

        user = ServiceUser(
            user_id=user_id,
            unique_id=validated_token.get("unique_id"),
            role=validated_token.get("role"),
        )

        return (user, validated_token)