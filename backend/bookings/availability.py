"""The one definition of "these dates clash", shared by booking and search."""
from .models import Booking


def overlapping(start, end, queryset=None):
    """CONFIRMED bookings that occupy any night in [start, end).

    Two half-open ranges overlap when each starts before the other ends, so a
    guest checking out on the 13th does not clash with one checking in on the 13th.
    """
    qs = queryset if queryset is not None else Booking.objects.all()
    return qs.filter(
        status=Booking.Status.CONFIRMED,
        check_in_date__lt=end,
        check_out_date__gt=start,
    )
