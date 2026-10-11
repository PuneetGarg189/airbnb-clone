from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import CurrentUserView, LoginView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
]
