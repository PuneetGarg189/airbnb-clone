from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Listing(models.Model):
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True, db_index=True)
    property_type = models.CharField(max_length=100, default="House")

    price_per_night = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(1)]
    )
    cleaning_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )
    service_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )

    city = models.CharField(max_length=255, blank=True, db_index=True)
    country = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(
        null=True, blank=True, validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.FloatField(
        null=True, blank=True, validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )

    max_guests = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    bedrooms = models.PositiveIntegerField(default=1)
    beds = models.PositiveIntegerField(default=1)
    baths = models.FloatField(default=1.0, validators=[MinValueValidator(0)])

    # A list of amenity names. A real product would normalise this into an
    # Amenity table with a many-to-many; JSON keeps the schema small here.
    amenities = models.JSONField(default=list, blank=True)

    # Denormalised from Review so listing cards need no join. Recomputed by
    # `refresh_rating()` whenever a review is added.
    rating = models.FloatField(default=0.0)
    reviews_count = models.PositiveIntegerField(default=0)

    is_guest_favourite = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return self.title

    def refresh_rating(self):
        agg = self.reviews.aggregate(avg=models.Avg("rating"), n=models.Count("id"))
        self.rating = round(agg["avg"] or 0.0, 2)
        self.reviews_count = agg["n"]
        self.is_guest_favourite = self.reviews_count >= 3 and self.rating >= 4.8
        self.save(update_fields=["rating", "reviews_count", "is_guest_favourite"])


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    url = models.CharField(max_length=500)
    is_cover = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"Image {self.display_order} of {self.listing_id}"


class Review(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="reviews")
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    cleanliness = models.PositiveSmallIntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    accuracy = models.PositiveSmallIntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    communication = models.PositiveSmallIntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    location_rating = models.PositiveSmallIntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    value_rating = models.PositiveSmallIntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["listing", "guest"], name="one_review_per_guest_per_listing"),
        ]

    def __str__(self):
        return f"Review by {self.guest_id} on {self.listing_id}"


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlists"
    )
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="wishlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "listing"], name="unique_wishlist_entry"),
        ]

    def __str__(self):
        return f"{self.user_id} -> {self.listing_id}"
