from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from listings.views import WishlistToggleView, HostDashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/listings/', include('listings.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/wishlists/', WishlistToggleView.as_view(), name='wishlists'),
    path('api/wishlists/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('api/host/dashboard/', HostDashboardView.as_view(), name='host-dashboard'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
