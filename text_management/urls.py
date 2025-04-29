from django.urls import path
from text_management import views

app_name = "text_management"
urlpatterns = [
    path("index", view=views.textchunks_index, name="chunks_index"),
]
