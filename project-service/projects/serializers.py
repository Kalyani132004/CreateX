import requests

from django.conf import settings
from rest_framework import serializers

from .models import Project, ProjectImage

class ProjectImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectImage
        fields = ["id", "image"]

class ProjectSerializer(serializers.ModelSerializer):

    images = ProjectImageSerializer(
        many=True,
        read_only=True
    )

    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = [
            "id",
            "owner_id",
            "owner_name",
            "title",
            "description",
            "domain",
            "course",
            "batch",
            "technologies",
            "innovation",
            "similarity",
            "documentation",
            "screen_recording",
            "images",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner_id",
            "owner_name",
            "innovation",
            "similarity",
            "images",
            "created_at",
            "updated_at",
        ]

    def get_owner_name(self, obj):

        url = (
            f"{settings.AUTH_SERVICE_URL}"
            f"/auth/internal/students/{obj.owner_id}/"
        )

        try:
            request = self.context["request"]

            access_token = request.headers.get("Authorization")

            response = requests.get(
                url,
                headers={
                    "Authorization": access_token
                },
                timeout=3
            )

            if response.status_code == 200:
                data = response.json()

                return data.get(
                    "full_name",
                    "Unknown Student"
                )

        except requests.RequestException as e:
            print("AUTH SERVICE ERROR:", e)

        return "Unknown Student"
