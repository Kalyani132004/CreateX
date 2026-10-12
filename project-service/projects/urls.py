from django.urls import path

from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    MyProjectsView,
    WishlistCreateListView,
    FacultyStatsView,
    StudentStatsView
)

urlpatterns = [
    path(
        "",
        ProjectListCreateView.as_view(),
        name="project-list-create"
    ),
    path(
        "wishlist/",
        WishlistCreateListView.as_view(),
        name='wishlist'
    ),
    path(
        "wishlist/<int:project_id>/",
        WishlistCreateListView.as_view(),
        name='wishlist'
    ),

    path(
        "mine/",
        MyProjectsView.as_view(),
        name="my-projects"
    ),

    path(
        "<int:pk>/",
        ProjectDetailView.as_view(),
        name="project-detail"
    ),
    
    path(
        "faculty-stats/",
        FacultyStatsView.as_view(),
        name="faculty-stats"
    ),
        path(
        "student-stats/",
        StudentStatsView.as_view(),
        name="student-stats"
    ),
]
