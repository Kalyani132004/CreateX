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

        serializer = FeedbackSerializer(
            data=request.data
        )

        if serializer.is_valid():

            # IMPORTANT:
            # This assumes your gateway/authentication
            # puts faculty ID in the request headers.
            faculty_id = request.headers.get("X-User-ID")

            if not faculty_id:
                return Response(
                    {
                        "detail": "Faculty authentication required."
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

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
