
"""
accounts/models.py

Custom auth user + role-specific profiles for CreateX.

Design notes
------------
- Only two roles exist (student, faculty) — no admin/superuser-facing role
  is exposed through the app; Django's built-in superuser flag still works
  for `/admin/` access independently of `role`.
- Students log in with a college unique ID like "N02122500051"; faculty log
  in with a staff ID like "FAC-2026-0143". Both are stored in the same
  `unique_id` field on User (it's the actual login identifier), validated
  by a role-specific regex at the serializer layer — the model only
  enforces uniqueness and format-agnostic storage.
- `Student` and `Faculty` are separate profile tables (not just fields on
  User) so each can carry its own fields cleanly and so `avg_innovation`,
  `project_count`, etc. can be computed as properties without bloating the
  auth table.
"""

import re

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


# Custom User
class UserManager(BaseUserManager):
    """Users are created via unique_id, not username/email."""

    def _create_user(self, unique_id, email, password, **extra_fields):
        if not unique_id:
            raise ValueError("Users must have a unique_id.")
        if not email:
            raise ValueError("Users must have an email address.")

        email = self.normalize_email(email)
        user = self.model(unique_id=unique_id.upper(), email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, unique_id, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(unique_id, email, password, **extra_fields)

    def create_superuser(self, unique_id, email, password=None, **extra_fields):
        #extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self._create_user(unique_id, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Auth-only model. Role-specific data lives on Student/Faculty
    (accessible as `user.student_profile` / `user.faculty_profile`).
    """

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        FACULTY = "faculty", "Faculty"
        ADMIN = 'admin' , 'Admin'

    unique_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text='College unique ID (students, e.g. "N02122500051") '
                   'or staff ID (faculty, e.g. "FAC-2026-0143").',
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Django admin access, independent of `role`
    date_joined = models.DateTimeField(default=timezone.now)

    # substituting a custom User model).
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="accounts_user_set",
        blank=True,
        verbose_name="groups",
        help_text="The groups this user belongs to.",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="accounts_user_permissions_set",
        blank=True,
        verbose_name="user permissions",
        help_text="Specific permissions for this user.",
    )

    objects = UserManager()

    USERNAME_FIELD = "unique_id"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.unique_id} ({self.role})"

    def clean(self):
        super().clean()
        self.unique_id = self.unique_id.upper()

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_faculty(self):
        return self.role == self.Role.FACULTY

    @property
    def profile(self):
        """Convenience accessor: whichever profile matches this user's role."""
        return self.student_profile if self.is_student else self.faculty_profile


# Student
student_uid_validator = RegexValidator(
    regex=r"^N\d{11}$",
    message="College unique ID must be 'N' followed by 11 digits, e.g. N02122500051.",
)


class Student(models.Model):
    class Course(models.TextChoices):
        MCA = "MCA", "MCA"
        BCA = "BCA", "BCA"
        BE = "BE", "BE"
        BTECH = "BTECH", "BTECH"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
        limit_choices_to={"role": User.Role.STUDENT},
    )

    first_name = models.CharField(max_length=80)
    middle_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80)

    course = models.CharField(max_length=10, choices=Course.choices)
    batch_start = models.PositiveSmallIntegerField()
    batch_end = models.PositiveSmallIntegerField()

    bio = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to="students/photos/", blank=True, null=True)

    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    leetcode_url = models.URLField(blank=True)
    gfg_url = models.URLField(blank=True)

    # Simple JSON list of strings, e.g. ["React", "Node.js", "PostgreSQL"].
    # A M2M to a Skill/Technology lookup table is the better long-term shape
    # once skill-based search/filtering is needed — swap in without touching
    # the API contract (the serializer already returns/accepts a plain list).
    skills = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "students"
        ordering = ["last_name", "first_name"]
        indexes = [
            models.Index(fields=["course", "batch_start", "batch_end"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.user.unique_id})"

    def clean(self):
        super().clean()
        if not re.match(r"^N\d{11}$", self.user.unique_id):
            raise ValidationError({"user": "Student unique_id must match the 'N' + 11 digits format."})
        if self.batch_end <= self.batch_start:
            raise ValidationError({"batch_end": "Batch end year must be after the batch start year."})

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return " ".join(p for p in parts if p)

    @property
    def batch(self):
        """e.g. '2022-2026' — the display format used throughout the frontend."""
        return f"{self.batch_start}-{self.batch_end}"

    @property
    def project_count(self):
        return self.user.projects.count()

    @property
    def avg_innovation(self):
        agg = self.user.projects.aggregate(models.Avg("innovation_score"))["innovation_score__avg"]
        return round(agg) if agg is not None else None

    @property
    def wishlist_count(self):
        return self.user.wishlist_items.count()


# Faculty
class Faculty(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_profile",
        limit_choices_to={"role": User.Role.FACULTY},
    )

    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)

    department = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to="faculty/photos/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "faculty"
        verbose_name = "Faculty"
        verbose_name_plural = "Faculty"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.full_name} ({self.user.unique_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    # These read from the Feedback/Project apps via reverse relations
    # (see feedback/models.py); kept here as properties so the API/serializer
    # layer and the frontend's dashboard stats have a single source of truth.
    @property
    def projects_reviewed(self):
        return self.user.feedback_given.values("project").distinct().count()

    @property
    def feedback_given(self):
        return self.user.feedback_given.exclude(feedback="").count()

    @property
    def recommendations_given(self):
        return self.user.feedback_given.exclude(recommendation="").count()

    @property
    def students_guided(self):
        return (
            self.user.feedback_given
            .values("project__student")
            .distinct()
            .count()
        )
