from rest_framework import serializers

from listings.serializers import cover_url
from users.serializers import PublicUserSerializer

from .models import Booking


class ListingMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    location = serializers.CharField()
    city = serializers.CharField()
    country = serializers.CharField()
    property_type = serializers.CharField()
    price_per_night = serializers.DecimalField(max_digits=10, decimal_places=2)
    cover_image = serializers.SerializerMethodField()

    def get_cover_image(self, obj):
        return cover_url(obj)


class BookingSerializer(serializers.ModelSerializer):
    """How a booking is returned to the UI."""

    listing = ListingMiniSerializer(read_only=True)
    listing_id = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(source="guest_id", read_only=True)
    guest = PublicUserSerializer(read_only=True)
    start_date = serializers.DateField(source="check_in_date", read_only=True)
    end_date = serializers.DateField(source="check_out_date", read_only=True)
    guests_count = serializers.IntegerField(source="guest_count", read_only=True)
    nightly_price = serializers.DecimalField(
        source="listing.price_per_night", max_digits=10, decimal_places=2, read_only=True
    )
    nights = serializers.IntegerField(read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id", "listing", "listing_id", "user_id", "guest", "start_date", "end_date",
            "guests_count", "nights", "nightly_price", "total_price", "status", "created_at",
        )


class BookingCreateSerializer(serializers.Serializer):
    """Input for POST /bookings/. The guest is the signed-in user; the price is
    always computed on the server, never taken from the client."""

    listing_id = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    guests_count = serializers.IntegerField(min_value=1, max_value=50)
