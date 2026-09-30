
from dataclasses import field

from django.forms import fields
import requests
from django.conf import settings
from rest_framework import serializers
from .models import Project, ProjectImage, Wishlist
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
class WishlistSerializer(serializers.ModelSerializer):

    project = ProjectSerializer(
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "user_id",
            "project",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user_id",
            "project",
            "created_at",
        ]
