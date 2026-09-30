
from functools import partial

from django.db.migrations import serializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from urllib3 import Retry

from .models import Project, ProjectImage, Wishlist
from .serializers import ProjectSerializer, WishlistSerializer
from django.conf import settings
import requests
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

class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        projects = (
            Project.objects
            .all()
            .order_by("-created_at")
        )

        serializer = ProjectSerializer(
            projects,
            many=True
        )

        return Response(
            serializer.data
        )

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
