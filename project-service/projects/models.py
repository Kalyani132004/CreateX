
from django.db import models
class Project(models.Model):

    # Auth Service User.id
    owner_id = models.IntegerField(
        db_index=True,
        null=True
    )

    owner_name = models.CharField(max_length=100)

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    domain = models.CharField(
        max_length=100
    )

    course = models.CharField(
        max_length=50
    )

    batch = models.CharField(
        max_length=20,
        blank=True
    )

    technologies = models.JSONField(
        default=list
    )

    innovation = models.FloatField(
        default=0.0
    )

    similarity = models.FloatField(
        default=0.0
    )

    documentation = models.FileField(
        upload_to="projects/documentation/",
        blank=True,
        null=True
    )

    screen_recording = models.FileField(
        upload_to="projects/videos/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title


class ProjectImage(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="projects/images/"
    )

    def __str__(self):
        return f"Image for {self.project.title}"

class Wishlist(models.Model):
    # Auth Service User.id
    user_id = models.IntegerField(
        db_index=True
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="wishlists"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "wishlists"
        constraints = [
            models.UniqueConstraint(
                fields=["user_id", "project"],
                name="unique_user_project_wishlist"
            )
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"User {self.user_id} → "
            f"{self.project.title}"
        )
