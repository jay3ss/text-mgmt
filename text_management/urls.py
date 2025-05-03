from django.urls import path

from text_management import views

app_name = "text_management"
urlpatterns = [
    path("", views.home, name="home"),
    path("tc", views.TextChunkListView.as_view(), name="tc-list"),
    path("tc/<int:pk>", views.TextChunkDetailView.as_view(), name="tc-detail"),
]
