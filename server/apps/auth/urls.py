from django.urls import path
from .views import login_view, refresh_token_view, profile_view

urlpatterns = [
    path("login/", login_view, name="admin-login"),
    path("refresh/", refresh_token_view, name="admin-refresh-token"),
    path("profile/", profile_view, name="admin-profile"),
]