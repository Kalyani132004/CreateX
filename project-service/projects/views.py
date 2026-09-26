from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from .models import Project, ProjectImage
from .serializers import ProjectSerializer


class ProjectListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        projects = Project.objects.all().order_by("-created_at")

        serializer = ProjectSerializer(
            projects,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request):

        # Check logged-in user
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        print(request.data.get("technologies"))

        # Project data
        serializer = ProjectSerializer(
            data=request.data
        )

        if serializer.is_valid():

            # Save project with logged-in user's ID
            project = serializer.save(
                owner_id=request.user.id
            )

            # Get uploaded images
            images = request.FILES.getlist("images")

            # Save each image
            for image in images:
                ProjectImage.objects.create(
                    project=project,
                    image=image
                )

            return Response(
                ProjectSerializer(
                    project,
                    context={"request": request}
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProjectDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_project(self, pk):

        try:
            return Project.objects.get(pk=pk)

        except Project.DoesNotExist:
            raise NotFound(
                "Project not found."
            )

    def get(self, request, pk):

        project = self.get_project(pk)

        serializer = ProjectSerializer(
            project,
            context={"request": request}
        )

        return Response(serializer.data)

    def patch(self, request, pk):

        project = self.get_project(pk)

        # Only owner can edit
        if project.owner_id != request.user.id:
            return Response(
                {
                    "detail": "You can edit only your own projects."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectSerializer(
            project,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            project = serializer.save()

            return Response(
                ProjectSerializer(
                    project,
                    context={"request": request}
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        project = self.get_project(pk)

        # Only owner can delete
        if project.owner_id != request.user.id:
            return Response(
                {
                    "detail": "You can delete only your own projects."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        project.delete()

        return Response(
            {
                "message": "Project deleted successfully."
            },
            status=status.HTTP_200_OK
        )


class MyProjectsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        projects = Project.objects.filter(
            owner_id=request.user.id
        ).order_by("-created_at")

        serializer = ProjectSerializer(
            projects,
            many=True,
            context={"request": request}
        )
        
        return Response(serializer.data)
