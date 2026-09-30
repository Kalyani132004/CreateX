from rest_framework import serializers

from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feedback
        fields = [
            "id",
            "project_id",
            "faculty_id",
            "rating",
            "feedback",
            "recommendation",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_id",
            "faculty_id",
            "created_at",
            "updated_at",
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value
