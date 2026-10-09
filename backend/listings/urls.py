from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, ReviewViewSet, WishlistToggleView, HostDashboardView

router = DefaultRouter()
router.register(r'', ListingViewSet, basename='listing')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:listing_pk>/reviews/', ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='listing-reviews'),
]
