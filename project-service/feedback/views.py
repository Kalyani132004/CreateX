from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Feedback
from .serializers import FeedbackSerializer

class ProjectFeedbackView(APIView):
    def get(self, request, project_id):
        """
        GET /projects/<project_id>/feedback/
        """
        feedback = Feedback.objects.filter(
            project_id=project_id
        ).order_by("-created_at")

        serializer = FeedbackSerializer(
            feedback,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request, project_id):
        """
        POST /projects/<project_id>/feedback/
        """

        # request.user comes from the JWT token (MicroserviceJWTAuthentication)
        if request.user.role != "faculty":
            return Response(
                {"detail": "Only faculty can give feedback."},
                status=status.HTTP_403_FORBIDDEN
            )

        faculty_id = request.user.id

        # one faculty = one feedback row per project
        # (Submit Feedback and Submit Recommendation update the same row)
        old_feedback = Feedback.objects.filter(
            project_id=project_id,
            faculty_id=faculty_id
        ).first()

        serializer = FeedbackSerializer(
            old_feedback,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save(
                project_id=project_id,
                faculty_id=faculty_id
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )