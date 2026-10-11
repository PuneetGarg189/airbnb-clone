"""Booking business rules, in one place and one transaction."""
from datetime import date
from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from listings.models import Listing

from .availability import overlapping
from .models import Booking


def quote(listing, start, end):
    """Total price in Decimal: nights x nightly rate + cleaning fee + service fee."""
    nights = (end - start).days
    total = listing.price_per_night * nights + listing.cleaning_fee + listing.service_fee
    return nights, Decimal(total).quantize(Decimal("0.01"))


@transaction.atomic
def create_booking(*, user, listing_id, start, end, guests):
    # Lock the listing row for the duration of the transaction so two
    # simultaneous requests for the same listing are processed one at a time
    # (on PostgreSQL; SQLite already serialises writers).
    try:
        listing = Listing.objects.select_for_update().get(pk=listing_id)
    except Listing.DoesNotExist:
        raise NotFound("Listing not found.")

    if end <= start:
        raise ValidationError("Check-out must be after check-in.")
    if start < date.today():
        raise ValidationError("Check-in cannot be in the past.")
    if guests < 1:
        raise ValidationError("At least one guest is required.")
    if guests > listing.max_guests:
        raise ValidationError(f"This place sleeps at most {listing.max_guests} guests.")
    if listing.host_id == user.id:
        raise ValidationError("You cannot book your own listing.")
    if overlapping(start, end, Booking.objects.filter(listing=listing)).exists():
        raise ValidationError("These dates are already booked.")

    _, total = quote(listing, start, end)
    return Booking.objects.create(
        listing=listing,
        guest=user,
        check_in_date=start,
        check_out_date=end,
        guest_count=guests,
        total_price=total,
    )
