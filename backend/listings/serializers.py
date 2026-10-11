from rest_framework import serializers

from users.serializers import PublicUserSerializer

from .models import Listing, ListingImage, Review

MAX_PHOTOS = 20


def cover_url(listing):
    """Cover photo from the prefetched images (no extra query)."""
    images = list(listing.images.all())
    for img in images:
        if img.is_cover:
            return img.url
    return images[0].url if images else ""


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ("id", "url", "is_cover", "display_order")


class ListingCardSerializer(serializers.ModelSerializer):
    """Compact shape for grids: no description, no fees, plain photo URLs."""

    cover_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    host = PublicUserSerializer(read_only=True)
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = (
            "id", "title", "category", "property_type", "price_per_night",
            "city", "country", "location", "latitude", "longitude",
            "max_guests", "rating", "reviews_count", "is_guest_favourite",
            "cover_image", "images", "host", "is_wishlisted",
        )

    def get_cover_image(self, obj):
        return cover_url(obj)

    def get_images(self, obj):
        return [img.url for img in obj.images.all()]

    def get_is_wishlisted(self, obj):
        return obj.id in self.context.get("wishlist_ids", ())


class ListingDetailSerializer(ListingCardSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    host_id = serializers.IntegerField(read_only=True)

    class Meta(ListingCardSerializer.Meta):
        fields = ListingCardSerializer.Meta.fields + (
            "host_id", "description", "cleaning_fee", "service_fee",
            "bedrooms", "beds", "baths", "amenities", "created_at",
        )


class ListingWriteSerializer(serializers.ModelSerializer):
    """Create/update. The owner is set by the view, never by the client."""

    image_urls = serializers.ListField(
        child=serializers.CharField(max_length=500), write_only=True, required=False,
        max_length=MAX_PHOTOS,
    )

    class Meta:
        model = Listing
        fields = (
            "title", "description", "category", "property_type",
            "price_per_night", "cleaning_fee", "service_fee",
            "city", "country", "location", "latitude", "longitude",
            "max_guests", "bedrooms", "beds", "baths", "amenities", "image_urls",
        )

    def validate_image_urls(self, urls):
        for url in urls:
            if not url.startswith(("http://", "https://")):
                raise serializers.ValidationError("Photo links must start with http:// or https://")
        return urls

    def validate_amenities(self, value):
        if not isinstance(value, list) or not all(isinstance(a, str) for a in value):
            raise serializers.ValidationError("Amenities must be a list of names.")
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get("image_urls"):
            raise serializers.ValidationError("Add at least one photo.")
        return attrs

    @staticmethod
    def _set_images(listing, urls):
        listing.images.all().delete()
        ListingImage.objects.bulk_create(
            ListingImage(listing=listing, url=url, is_cover=(i == 0), display_order=i)
            for i, url in enumerate(urls)
        )

    def create(self, validated_data):
        urls = validated_data.pop("image_urls", [])
        listing = Listing.objects.create(**validated_data)
        self._set_images(listing, urls)
        return listing

    def update(self, instance, validated_data):
        urls = validated_data.pop("image_urls", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if urls is not None:
            self._set_images(instance, urls)
        return instance

    def to_representation(self, instance):
        instance = Listing.objects.prefetch_related("images").select_related("host").get(pk=instance.pk)
        return ListingDetailSerializer(instance, context=self.context).data


class ReviewSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(source="guest", read_only=True)
    user_id = serializers.IntegerField(source="guest_id", read_only=True)
    listing_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Review
        fields = (
            "id", "listing_id", "user_id", "user", "rating", "cleanliness", "accuracy",
            "communication", "location_rating", "value_rating", "comment", "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_comment(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError("Please write a few words about your stay.")
        return value
