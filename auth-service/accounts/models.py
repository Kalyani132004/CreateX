
# import re
# from django.conf import settings
# from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
# from django.contrib.auth.models import PermissionsMixin
# from django.core.exceptions import ValidationError
# from django.db import models
# from django.utils import timezone

# # USER MANAGER
# class UserManager(BaseUserManager):
#     """
#     Custom user manager.

#     Users authenticate using unique_id instead of username.
#     """
#     def _create_user(self,unique_id,email,password,**extra_fields):
#         if not unique_id:
#             raise ValueError(
#                 "Users must have a unique_id."
#             )

#         if not email:
#             raise ValueError(
#                 "Users must have an email address."
#             )

#         email = self.normalize_email(email)

#         user = self.model(
#             unique_id=unique_id.upper(),
#             email=email,
#             **extra_fields,
#         )

#         user.set_password(password)
#         user.save(using=self._db)

#         return user

#     def create_user(self,unique_id,email,password=None,**extra_fields):
#         #dont make a anyone a staff so i'll be staff  is false
#         extra_fields.setdefault("is_staff", False,)

#         extra_fields.setdefault("is_superuser",False)

#         return self._create_user(unique_id,email,password,**extra_fields)

#     def create_superuser(self,unique_id,email, password=None, **extra_fields):
#         extra_fields.setdefault(
#             "is_staff",
#             True,
#         )

#         extra_fields.setdefault(
#             "is_superuser",
#             True,
#         )

#         return self._create_user(
#             unique_id,
#             email,
#             password,
#             **extra_fields,
#         )

# # CUSTOM USER
# class User( AbstractBaseUser, PermissionsMixin ):
#     """
#     Authentication and identity model.

#     Role-specific information belongs to Student or Faculty.
#     """

#     class Role(models.TextChoices):
#         STUDENT = "student", "Student"
#         FACULTY = "faculty", "Faculty"

#     unique_id = models.CharField(
#         max_length=20,
#         unique=True,
#         db_index=True,
#         help_text=(
#             'Student ID example: "N02122500051" '
#             'or faculty ID example: "FAC-2026-0143".'
#         ),
#     )

#     email = models.EmailField(
#         unique=True,
#     )

#     role = models.CharField(
#         max_length=10,
#         choices=Role.choices,
#     )

#     is_active = models.BooleanField(
#         default=True,
#     )

#     is_staff = models.BooleanField(
#         default=False,
#     )

#     date_joined = models.DateTimeField(
#         default=timezone.now,
#     )

#     groups = models.ManyToManyField(
#         "auth.Group",
#         related_name="accounts_user_set",
#         blank=True,
#         verbose_name="groups",
#     )

#     user_permissions = models.ManyToManyField(
#         "auth.Permission",
#         related_name="accounts_user_permissions_set",
#         blank=True,
#         verbose_name="user permissions",
#     )

#     objects = UserManager()

#     USERNAME_FIELD = "unique_id"

#     REQUIRED_FIELDS = [
#         "email",
#     ]

#     class Meta:
#         db_table = "users"
#         ordering = ["-date_joined"]

#     def __str__(self):
#         return f"{self.unique_id} ({self.role})"

#     def clean(self):
#         super().clean()

#         if self.unique_id:
#             self.unique_id = self.unique_id.upper()

#     @property
#     def is_student(self):
#         return self.role == self.Role.STUDENT

#     @property
#     def is_faculty(self):
#         return self.role == self.Role.FACULTY

#     @property
#     def profile(self):
#         if self.is_student:
#             return self.student_profile

#         if self.is_faculty:
#             return self.faculty_profile

#         return None

# # STUDENT
# class Student(models.Model):

#     class Course(models.TextChoices):
#         MCA = "MCA", "MCA"
#         BCA = "BCA", "BCA"
#         BE = "BE", "BE"
#         BTECH = "BTECH", "BTECH"

#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="student_profile",
#         limit_choices_to={
#             "role": User.Role.STUDENT,
#         },
#     )

#     first_name = models.CharField(
#         max_length=80,
#     )

#     middle_name = models.CharField(
#         max_length=80,
#         blank=True,
#     )

#     last_name = models.CharField(
#         max_length=80,
#     )

#     course = models.CharField(
#         max_length=10,
#         choices=Course.choices,
#     )

#     batch_start = models.PositiveSmallIntegerField()

#     batch_end = models.PositiveSmallIntegerField()

#     bio = models.TextField(
#         blank=True,
#     )

#     profile_photo = models.ImageField(
#         upload_to="students/photos/",
#         blank=True,
#         null=True,
#     )

#     github_url = models.URLField(
#         blank=True,
#     )

#     linkedin_url = models.URLField(
#         blank=True,
#     )

#     leetcode_url = models.URLField(
#         blank=True,
#     )

#     gfg_url = models.URLField(
#         blank=True,
#     )

#     skills = models.JSONField(
#         default=list,
#         blank=True,
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True,
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True,
#     )

#     class Meta:
#         db_table = "students"

#         ordering = [
#             "last_name",
#             "first_name",
#         ]

#         indexes = [
#             models.Index(
#                 fields=[
#                     "course",
#                     "batch_start",
#                     "batch_end",
#                 ]
#             ),
#         ]

#     def __str__(self):
#         return (
#             f"{self.full_name} "
#             f"({self.user.unique_id})"
#         )

#     def clean(self):
#         super().clean()

#         # Validate student ID
#         if not re.match(
#             r"^N\d{11}$",
#             self.user.unique_id,
#         ):
#             raise ValidationError(
#                 {
#                     "user": (
#                         "Student unique_id must match "
#                         "'N' followed by 11 digits."
#                     )
#                 }
#             )

#         # Validate batch
#         if self.batch_end <= self.batch_start:
#             raise ValidationError(
#                 {
#                     "batch_end": (
#                         "Batch end year must be after "
#                         "batch start year."
#                     )
#                 }
#             )

#     @property
#     def full_name(self):
#         parts = [
#             self.first_name,
#             self.middle_name,
#             self.last_name,
#         ]

#         return " ".join(
#             part
#             for part in parts
#             if part
#         )

#     @property
#     def batch(self):
#         return (
#             f"{self.batch_start}-"
#             f"{self.batch_end}"
#         )

# # FACULTY
# class Faculty(models.Model):

#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="faculty_profile",
#         limit_choices_to={
#             "role": User.Role.FACULTY,
#         },
#     )

#     first_name = models.CharField(
#         max_length=80,
#     )

#     last_name = models.CharField(
#         max_length=80,
#     )

#     department = models.CharField(
#         max_length=120,
#         blank=True,
#     )

#     bio = models.TextField(
#         blank=True,
#     )

#     profile_photo = models.ImageField(
#         upload_to="faculty/photos/",
#         blank=True,
#         null=True,
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True,
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True,
#     )

#     class Meta:
#         db_table = "faculty"

#         verbose_name = "Faculty"

#         verbose_name_plural = "Faculty"

#         ordering = [
#             "last_name",
#             "first_name",
#         ]

#     def __str__(self):
#         return (
#             f"{self.full_name} "
#             f"({self.user.unique_id})"
#         )

#     @property
#     def full_name(self):
#         return (
#             f"{self.first_name} "
#             f"{self.last_name}"
#         ).strip()


import re
from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


# ============================================================
# USER MANAGER
# ============================================================

class UserManager(BaseUserManager):
    """
    Custom user manager.

    Users authenticate using unique_id instead of username.
    """

    def _create_user(self, unique_id, email, password, **extra_fields):

        if not unique_id:
            raise ValueError("Users must have a unique_id.")

        if not email:
            raise ValueError("Users must have an email address.")

        email = self.normalize_email(email)

        user = self.model(
            unique_id=unique_id.upper().strip(),
            email=email,
            **extra_fields,
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(
        self,
        unique_id,
        email,
        password=None,
        **extra_fields
    ):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(
            unique_id,
            email,
            password,
            **extra_fields,
        )

    def create_superuser(
        self,
        unique_id,
        email,
        password=None,
        **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self._create_user(
            unique_id,
            email,
            password,
            **extra_fields,
        )


# ============================================================
# CUSTOM USER
# ============================================================

class User(AbstractBaseUser, PermissionsMixin):
    """
    Main authentication and identity model.

    Role-specific information is stored in:
        Student
        Faculty
    """

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        FACULTY = "faculty", "Faculty"

    unique_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text=(
            'Student ID example: "N02122500051" '
            'or faculty ID example: "FAC-2026-0143".'
        ),
    )

    email = models.EmailField(
        unique=True,
    )

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
    )

    is_active = models.BooleanField(
        default=True,
    )

    is_staff = models.BooleanField(
        default=False,
    )

    date_joined = models.DateTimeField(
        default=timezone.now,
    )

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="accounts_user_set",
        blank=True,
        verbose_name="groups",
    )

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="accounts_user_permissions_set",
        blank=True,
        verbose_name="user permissions",
    )

    objects = UserManager()

    USERNAME_FIELD = "unique_id"

    REQUIRED_FIELDS = [
        "email",
    ]

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.unique_id} ({self.role})"

    def clean(self):
        super().clean()

        if self.unique_id:
            self.unique_id = self.unique_id.upper().strip()

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_faculty(self):
        return self.role == self.Role.FACULTY

    @property
    def profile(self):
        """
        Return the role-specific profile.
        """

        if self.is_student:
            return getattr(self, "student_profile", None)

        if self.is_faculty:
            return getattr(self, "faculty_profile", None)

        return None

# ============================================================
# STUDENT
# ============================================================

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
        limit_choices_to={
            "role": User.Role.STUDENT,
        },
    )

    first_name = models.CharField(
        max_length=80,
    )

    middle_name = models.CharField(
        max_length=80,
        blank=True,
    )

    last_name = models.CharField(
        max_length=80,
    )

    course = models.CharField(
        max_length=10,
        choices=Course.choices,
    )

    batch_start = models.PositiveSmallIntegerField()

    batch_end = models.PositiveSmallIntegerField()

    bio = models.TextField(
        blank=True,
    )

    profile_photo = models.ImageField(
        upload_to="students/photos/",
        blank=True,
        null=True,
    )

    github_url = models.URLField(
        blank=True,
    )

    linkedin_url = models.URLField(
        blank=True,
    )

    leetcode_url = models.URLField(
        blank=True,
    )

    gfg_url = models.URLField(
        blank=True,
    )

    skills = models.JSONField(
        default=list,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "students"

        ordering = [
            "last_name",
            "first_name",
        ]

        indexes = [
            models.Index(
                fields=[
                    "course",
                    "batch_start",
                    "batch_end",
                ]
            ),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.user.unique_id})"

    def clean(self):
        super().clean()

        if not re.match(
            r"^N\d{11}$",
            self.user.unique_id,
        ):
            raise ValidationError(
                {
                    "user": (
                        "Student unique_id must match "
                        "'N' followed by 11 digits."
                    )
                }
            )

        if self.batch_end <= self.batch_start:
            raise ValidationError(
                {
                    "batch_end": (
                        "Batch end year must be after "
                        "batch start year."
                    )
                }
            )

    @property
    def full_name(self):

        parts = [
            self.first_name,
            self.middle_name,
            self.last_name,
        ]

        return " ".join(
            part
            for part in parts
            if part
        )

    @property
    def batch(self):
        return f"{self.batch_start}-{self.batch_end}"


# ============================================================
# FACULTY
# ============================================================

class Faculty(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_profile",
        limit_choices_to={
            "role": User.Role.FACULTY,
        },
    )

    first_name = models.CharField(
        max_length=80,
    )

    last_name = models.CharField(
        max_length=80,
    )

    department = models.CharField(
        max_length=120,
        blank=True,
    )

    bio = models.TextField(
        blank=True,
    )

    profile_photo = models.ImageField(
        upload_to="faculty/photos/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "faculty"

        verbose_name = "Faculty"
        verbose_name_plural = "Faculty"

        ordering = [
            "last_name",
            "first_name",
        ]

    def __str__(self):
        return f"{self.full_name} ({self.user.unique_id})"

    @property
    def full_name(self):
        return (
            f"{self.first_name} "
            f"{self.last_name}"
        ).strip()
