from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

from listings.views import HostDashboardView, UploadView, WishlistToggleView, WishlistView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/listings/", include("listings.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/wishlists/", WishlistView.as_view(), name="wishlists"),
    path("api/wishlists/toggle/", WishlistToggleView.as_view(), name="wishlist-toggle"),
    path("api/host/dashboard/", HostDashboardView.as_view(), name="host-dashboard"),
    path("api/uploads/", UploadView.as_view(), name="upload"),
    # Demo-grade media serving (uploaded photos). Production: object storage + CDN.
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
