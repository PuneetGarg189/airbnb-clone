from django.db import models
from django.conf import settings


class Listing(models.Model):
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    property_type = models.CharField(max_length=100, default='House')

    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    cleaning_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    city = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    max_guests = models.PositiveIntegerField(default=1)
    bedrooms = models.PositiveIntegerField(default=1)
    beds = models.PositiveIntegerField(default=1)
    baths = models.FloatField(default=1.0)

    amenities = models.JSONField(default=list, blank=True)

    # Denormalized for fast queries — updated on review submit
    rating = models.FloatField(default=0.0)
    reviews_count = models.PositiveIntegerField(default=0)

    is_guest_favourite = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image_url = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='listings/', blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f'Image for {self.listing.title}'

    @property
    def url(self):
        if self.image_url:
            return self.image_url
        if self.image:
            return self.image.url
        return ''


class Review(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reviews')
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField()   # Overall 1–5
    # Sub-ratings (1.0–5.0)
    cleanliness = models.FloatField(default=5.0)
    accuracy = models.FloatField(default=5.0)
    communication = models.FloatField(default=5.0)
    location_rating = models.FloatField(default=5.0)
    value_rating = models.FloatField(default=5.0)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Review by {self.guest.username} on {self.listing.title}'


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlists'
    )
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'listing')

    def __str__(self):
        return f'{self.user.username} → {self.listing.title}'
