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

    # originality is not saved in the database, it is 100 - similarity
    originality = serializers.SerializerMethodField()

    def get_originality(self, obj):
        # innovation 0 and similarity 0 means the project is not scored yet
        if obj.innovation == 0 and obj.similarity == 0:
            return 0
        return round(100 - obj.similarity)

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
            "originality",
            "documentation",
            "screen_recording",
            "images",
            "created_at",
            "updated_at"
        ]

        read_only_fields = [
            "id",
            "owner_id",
            "owner_name",
            "innovation",
            "similarity",
            "originality",
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
            "created_at"
        ]