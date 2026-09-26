
import re
from django.db import transaction
from rest_framework import serializers

from .models import Faculty, User, Student

#student registration serializer
class StudentRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=80)
    middle_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=80)

    email = serializers.EmailField()
    unique_id = serializers.CharField(max_length=20)

    course = serializers.ChoiceField(choices=Student.Course.choices)
    batch_start = serializers.IntegerField()
    batch_end = serializers.IntegerField()

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    # --- field-level validation -------------------------------------------------

    def validate_unique_id(self, value):
        value = value.upper().strip()
        if not re.match(r"^N\d{11}$", value):
            raise serializers.ValidationError(
                "Unique ID must be 'N' followed by 11 digits, e.g. N02122500051."
            )
        if User.objects.filter(unique_id=value).exists():
            raise serializers.ValidationError("An account with this unique ID already exists.")
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    # --- cross-field validation ---------------------------------------------

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        if attrs["batch_end"] <= attrs["batch_start"]:
            raise serializers.ValidationError(
                {"batch_end": "Batch end year must be after the batch start year."}
            )

        return attrs

    # --- creation -------------------------------------------------------------

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    unique_id=validated_data["unique_id"],
                    email=validated_data["email"],
                    password=password,
                    role=User.Role.STUDENT,
                )

                print("USER CREATED:", user.pk)

                student = Student.objects.create(
                    user=user,
                    first_name=validated_data["first_name"],
                    middle_name=validated_data.get("middle_name", ""),
                    last_name=validated_data["last_name"],
                    course=validated_data["course"],
                    batch_start=validated_data["batch_start"],
                    batch_end=validated_data["batch_end"],
                )

                print("STUDENT CREATED:", student.pk)

            return student

        except Exception as e:
            print("REGISTRATION DB ERROR:", repr(e))
            raise

    def save(self, **kwargs):
        # Student instance RegisterView expects.
        return self.create(self.validated_data)

#student serializer
class StudentSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Student
        fields = ['bio','gfg_url','github_url','linkedin_url','leetcode_url','profile_photo']

#faculty serializer
class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = [
            "bio"
        ]
