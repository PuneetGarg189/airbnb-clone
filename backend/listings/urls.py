from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ListingViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r"", ListingViewSet, basename="listing")

urlpatterns = [
    path(
        "<int:listing_pk>/reviews/",
        ReviewViewSet.as_view({"get": "list", "post": "create"}),
        name="listing-reviews",
    ),
] + router.urls
