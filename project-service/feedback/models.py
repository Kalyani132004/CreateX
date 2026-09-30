from django.db import models


class Feedback(models.Model):
    # Project ID from Project Service
    project_id = models.IntegerField()

    # Faculty ID from Auth Service
    faculty_id = models.IntegerField()

    # Faculty rating
    rating = models.PositiveIntegerField(
        default=0
    )

    # Faculty feedback
    feedback = models.TextField(
        blank=True
    )

    # Faculty recommendation
    recommendation = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Feedback for Project {self.project_id}"    
