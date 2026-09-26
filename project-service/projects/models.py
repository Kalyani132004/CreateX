from django.db import models


class Project(models.Model):
    # User ID from Auth Service
    owner_id = models.IntegerField()

    title = models.CharField(max_length=200)

    description = models.TextField()

    domain = models.CharField(max_length=100)

    course = models.CharField(max_length=50)

    batch = models.CharField(
        max_length=20,
        blank=True
    )

    technologies = models.JSONField(
        default=list
    )

    # AI-generated scores
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
