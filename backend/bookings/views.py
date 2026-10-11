from datetime import date

from django.db.models import Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer
from .services import create_booking


class BookingViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    """Bookings the signed-in user may see: their own trips, plus bookings on
    listings they host."""

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    filter_backends = []

    def get_queryset(self):
        user = self.request.user
        return (
            Booking.objects.filter(Q(guest=user) | Q(listing__host=user))
            .select_related("listing", "guest")
            .prefetch_related("listing__images")
        )

    def create(self, request, *args, **kwargs):
        data = BookingCreateSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        v = data.validated_data
        booking = create_booking(
            user=request.user,
            listing_id=v["listing_id"],
            start=v["start_date"],
            end=v["end_date"],
            guests=v["guests_count"],
        )
        booking = self.get_queryset().get(pk=booking.pk)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Cancel (soft delete) - the guest or the listing's host may cancel."""
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELLED:
            raise ValidationError("This booking is already cancelled.")
        if booking.check_out_date < date.today():
            raise ValidationError("A completed stay cannot be cancelled.")
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=["status", "updated_at"])
        return Response({"message": "Booking cancelled", "id": booking.id})

    @action(detail=False, methods=["get"])
    def my_trips(self, request):
        qs = self.get_queryset().filter(guest=request.user)
        return Response(BookingSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def booked_dates(self, request):
        """Public: the date ranges that cannot be booked (no guest details)."""
        listing_id = request.query_params.get("listing_id")
        if not listing_id or not listing_id.isdigit():
            raise ValidationError({"listing_id": "A numeric listing_id is required."})
        rows = (
            Booking.objects.filter(
                listing_id=listing_id,
                status=Booking.Status.CONFIRMED,
                check_out_date__gte=date.today(),
            )
            .order_by("check_in_date")
            .values("check_in_date", "check_out_date")
        )
        return Response(
            [{"start_date": str(r["check_in_date"]), "end_date": str(r["check_out_date"])} for r in rows]
        )
