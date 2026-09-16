from rest_framework import serializers

from .models import Project, ProjectImage


class ProjectImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectImage
        fields = [
            "id",
            "image",
        ]


class ProjectSerializer(serializers.ModelSerializer):

    images = ProjectImageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "owner_id",
            "title",
            "description",
            "domain",
            "course",
            "batch",
            "technologies",
            "documentation",
            "screen_recording",
            "images",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner_id",
            "images",
            "created_at",
            "updated_at",
        ]