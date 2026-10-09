from rest_framework import serializers
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
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return img.url if img else ''

class BookingSerializer(serializers.ModelSerializer):
    listing = ListingMiniSerializer(read_only=True)
    listing_id = serializers.IntegerField(write_only=True)
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()
    guests_count = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'listing', 'listing_id', 'guest',
            'check_in_date', 'check_out_date', 'guest_count',
            'start_date', 'end_date', 'guests_count',
            'total_price', 'status', 'created_at'
        )
        read_only_fields = ('guest', 'total_price', 'status', 'created_at')

    def get_start_date(self, obj):
        return str(obj.check_in_date)

    def get_end_date(self, obj):
        return str(obj.check_out_date)

    def get_guests_count(self, obj):
        return obj.guest_count

    def validate(self, data):
        check_in = data.get('check_in_date')
        check_out = data.get('check_out_date')
        if check_in and check_out:
            if check_in >= check_out:
                raise serializers.ValidationError('Check-out must be after check-in.')
            listing_id = data.get('listing_id')
            overlapping = Booking.objects.filter(
                listing_id=listing_id,
                status='CONFIRMED',
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            ).exists()
            if overlapping:
                raise serializers.ValidationError('These dates are already booked.')
        return data

    def create(self, validated_data):
        listing_id = validated_data['listing_id']
        from listings.models import Listing
        listing = Listing.objects.get(id=listing_id)
        nights = (validated_data['check_out_date'] - validated_data['check_in_date']).days
        total = float(listing.price_per_night) * nights + float(listing.cleaning_fee) + float(listing.service_fee)
        validated_data['total_price'] = total
        return super().create(validated_data)
