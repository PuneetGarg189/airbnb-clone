from django.conf import settings
from django.db import models
from django.db.models import F, Q

from listings.models import Listing


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bookings")
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings"
    )
    # A stay occupies the nights [check_in_date, check_out_date). The check-out
    # day itself is free for the next guest (half-open interval).
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    guest_count = models.PositiveIntegerField()
    # Snapshot of what the guest agreed to pay; later price edits never change it.
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            # Serves the overlap check on every booking and every date search.
            models.Index(fields=["listing", "status", "check_in_date", "check_out_date"], name="booking_overlap_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(check_out_date__gt=F("check_in_date")), name="checkout_after_checkin"
            ),
            models.CheckConstraint(condition=Q(guest_count__gte=1), name="at_least_one_guest"),
        ]

    def __str__(self):
        return f"{self.guest_id}: {self.listing_id} {self.check_in_date}->{self.check_out_date}"

    @property
    def nights(self):
        return (self.check_out_date - self.check_in_date).days
