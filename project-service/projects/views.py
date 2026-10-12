
from functools import partial

from django.db.migrations import serializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from .models import Project, ProjectImage, Wishlist
from .serializers import ProjectSerializer, WishlistSerializer
from django.conf import settings
import requests
from django.db.models import Q



def get_owner_name(unique_id, token):
        if not unique_id:
            return "Unknown Student"
        url = (
            f"{settings.AUTH_SERVICE_URL}"
            f"/auth/internal/students/"
            f"{unique_id}/"
        )
        try:

            authorization = token

            response = requests.get(
                url,
                headers={
                    "Authorization": authorization
                },
                timeout=3
            )
            if response.status_code == 200:
                data = response.json()
                return data.get(
                    "full_name",
                    "Unknown Student"
                )
            print(
                "Auth service returned:",
                response.status_code,
                response.text
            )

        except requests.RequestException as e:
            print("AUTH SERVICE ERROR:",e)
        return "Unknown Student"


def calculate_scores(project):
    """Ask the ML service for innovation + similarity and save them on the project."""
    existing = []
    for other in Project.objects.exclude(id=project.id):
        existing.append({
            "id": other.id,
            "title": other.title,
            "description": other.description,
            "domain": other.domain,
            "technologies": other.technologies or [],
        })

    try:
        response = requests.post(
            f"{settings.ML_SERVICE_URL}/api/ml/analyze",
            json={
                "title": project.title,
                "description": project.description,
                "domain": project.domain,
                "technologies": project.technologies or [],
                "existing_projects": existing,
            },
            timeout=30,
        )

        if response.status_code == 200:
            ml = response.json()
            project.similarity = ml.get("similarity", 0)
            project.innovation = ml.get("innovation", 0)
            project.save()
        else:
            print("ML service returned:", response.status_code, response.text)

    except requests.RequestException as e:
        # project must still be saved even if ML service is down
        print("ML SERVICE ERROR:", e)


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        projects = Project.objects.all()

        # values coming from the URL, like ?q=diet&domain=IoT
        q = request.query_params.get("q")
        domain = request.query_params.get("domain")
        technology = request.query_params.get("technology")
        course = request.query_params.get("course")
        batch = request.query_params.get("batch")
        sort = request.query_params.get("sort")

        # search text: check title, description, domain, student name and technologies
        if q:
            projects = projects.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(domain__icontains=q)
                | Q(owner_name__icontains=q)
                | Q(technologies__icontains=q)
            )

        if domain:
            projects = projects.filter(domain=domain)

        if technology:
            projects = projects.filter(technologies__icontains=technology)

        if course:
            projects = projects.filter(course=course)

        if batch:
            projects = projects.filter(batch=batch)

        # sorting
        if sort == "innovation":
            projects = projects.order_by("-innovation")
        else:
            # "recent" and "relevant" both show newest first
            projects = projects.order_by("-created_at")

        serializer = ProjectSerializer(
            projects,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = serializer.save(
            owner_id=request.user.id,
            owner_name=get_owner_name(
                request.user.unique_id,
                request.headers.get("Authorization")
            )
        )

        # calculate innovation + similarity score
        calculate_scores(project)

        images = request.FILES.getlist("images")

        print("========== IMAGE DEBUG ==========")
        print("Total images received:", len(images))

        for image in images:
            print("Image:", image.name)

            ProjectImage.objects.create(
                project=project,
                image=image
            )

        print("=================================")

        return Response(
            ProjectSerializer(
                project,
                context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED
        )

class ProjectDetailView(APIView):

    permission_classes = [ IsAuthenticated ]

    def get_project(self, pk):
        try:
            return Project.objects.get(
                pk=pk
            )
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

    def get(self, request, pk):
        project = self.get_project(pk)
        serializer = ProjectSerializer(
            project,
            context={
                "request": request
            }
        )
        return Response(serializer.data)

    def patch(self, request, pk):

        project = self.get_project(pk)

        # Only project owner can edit
        if project.owner_id != request.user.id:

            return Response(
                {
                    "detail":
                    "You can edit only your own projects."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectSerializer(
            project,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        project = serializer.save()

        return Response(
            ProjectSerializer(
                project,
                context={
                    "request": request
                }
            ).data
        )

    # def delete(self, request, pk):

    #     project = self.get_project(pk)

    #     # Only project owner can delete
    #     if project.owner_id != request.user.id:

    #         return Response(
    #             {
    #                 "detail":
    #                 "You can delete only your own projects."
    #             },
    #             status=status.HTTP_403_FORBIDDEN
    #         )

    #     project.delete()

    #     return Response(
    #         {
    #             "message":
    #             "Project deleted successfully."
    #         },
    #         status=status.HTTP_200_OK
    #     )
    def delete(self, request, pk):
        project = Project.objects.filter(
            id=pk,
            owner_id=request.user.id
        ).first()

        if not project:
            return Response(
                {
                    "detail": "Project not found or you are not the owner."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        project.delete()

        return Response(
            {
                "detail": "Project deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )


class MyProjectsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        projects = (
            Project.objects
            .filter(
                owner_id=request.user.id
            )
            .order_by("-created_at")
        )

        serializer = ProjectSerializer(
            projects,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data
        )

class WishlistCreateListView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_id = request.data.get("project")

        if not project_id:
            return Response(
                {"detail": "Project ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Wishlist.objects.filter(
            user_id=request.user.id,
            project_id=project_id
        ).exists():
            return Response(
                {"detail": "Project already exists in wishlist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wishlist = Wishlist.objects.create(
            user_id=request.user.id,
            project_id=project_id
        )

        serializer = WishlistSerializer(wishlist)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def get(self, request):

        wishlists = (
            Wishlist.objects
            .filter(user_id=request.user.id)
            .select_related("project")
            .prefetch_related("project__images")
            .order_by("-created_at")
        )

        serializer = WishlistSerializer(
            wishlists,
            many=True,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    def patch(self, request, project_id):
        project = Project.objects.filter(
            id=project_id,
            owner_id=request.user.id
        ).first()

        if not project:
            return Response(
                {"detail": "Project not found or you are not the owner."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(
            project,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, project_id):

        wishlist = Wishlist.objects.filter(
            user_id=request.user.id,
            project_id=project_id
        ).first()

        if not wishlist:
            return Response(
                {"detail": "Project is not in your wishlist."},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist.delete()

        return Response(
            {"detail": "Project removed from wishlist."},
            status=status.HTTP_200_OK
        )


class FacultyStatsView(APIView):
    """GET /projects/faculty-stats/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from feedback.models import Feedback

        my_feedback = Feedback.objects.filter(faculty_id=request.user.id)

        data = {
            "projects_reviewed": my_feedback.values("project_id").distinct().count(),
            "feedback_given": my_feedback.count(),
            "recommendations_given": my_feedback.exclude(recommendation="").count(),
        }
        return Response(data)


class StudentStatsView(APIView):
    """GET /projects/student-stats/  -> project count and avg innovation per student"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count, Avg, Q

        rows = (
            Project.objects
            .values("owner_id")
            .annotate(
                project_count=Count("id"),
                # only projects that really have a score (0 means not scored yet)
                avg_innovation=Avg("innovation", filter=Q(innovation__gt=0)),
            )
        )

        data = []
        for row in rows:
            data.append({
                "owner_id": row["owner_id"],
                "project_count": row["project_count"],
                "avg_innovation": (
                    round(row["avg_innovation"])
                    if row["avg_innovation"] is not None
                    else None
                ),
            })

        return Response(data)