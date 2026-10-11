from django.db.models import Count
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    EmailOrUsernameTokenSerializer,
    RegisterSerializer,
    UserSerializer,
)

SUPERHOST_MIN_LISTINGS = 3


def superhost_ids():
    """Ids of hosts with enough listings to carry the Superhost badge (1 query)."""
    rows = (
        User.objects.filter(is_host=True)
        .annotate(n=Count("listings"))
        .filter(n__gte=SUPERHOST_MIN_LISTINGS)
        .values_list("id", flat=True)
    )
    return set(rows)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class LoginView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenSerializer


class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def _data(self, request):
        return UserSerializer(request.user, context={"superhost_ids": superhost_ids()}).data

    def get(self, request):
        return Response(self._data(request))

    def patch(self, request):
        """Only one self-service change today: become a host."""
        if request.data.get("is_host") is True and not request.user.is_host:
            request.user.is_host = True
            request.user.save(update_fields=["is_host"])
        return Response(self._data(request))
