import uuid
from datetime import date
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Avg, Count, Sum
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.availability import overlapping
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from users.views import superhost_ids

from .models import Listing, Review, Wishlist
from .permissions import IsHostOrReadOnly
from .serializers import (
    ListingCardSerializer,
    ListingDetailSerializer,
    ListingWriteSerializer,
    ReviewSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend


def parse_decimal(params, key):
    raw = params.get(key)
    if raw in (None, ""):
        return None
    try:
        return Decimal(raw)
    except InvalidOperation:
        raise ValidationError({key: "Must be a number."})


def parse_int(params, key):
    raw = params.get(key)
    if raw in (None, ""):
        return None
    try:
        return int(raw)
    except ValueError:
        raise ValidationError({key: "Must be a whole number."})


def parse_date(params, key):
    raw = params.get(key)
    if not raw:
        return None
    try:
        return date.fromisoformat(raw)
    except ValueError:
        raise ValidationError({key: "Use the format YYYY-MM-DD."})


def card_context(request):
    """Per-request lookups shared by every serialized listing (2 queries total)."""
    wishlist_ids = set()
    if request.user.is_authenticated:
        wishlist_ids = set(
            Wishlist.objects.filter(user=request.user).values_list("listing_id", flat=True)
        )
    return {"request": request, "superhost_ids": superhost_ids(), "wishlist_ids": wishlist_ids}


class ListingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsHostOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "city", "country"]
    search_fields = ["title", "description", "location", "city", "country"]
    ordering_fields = ["price_per_night", "rating", "created_at"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ListingWriteSerializer
        if self.action == "retrieve":
            return ListingDetailSerializer
        return ListingCardSerializer

    def get_serializer_context(self):
        return card_context(self.request)

    def get_queryset(self):
        qs = Listing.objects.select_related("host").prefetch_related("images")
        if self.action != "list":
            return qs  # detail/edit/delete address one listing by id

        p = self.request.query_params
        min_price, max_price = parse_decimal(p, "min_price"), parse_decimal(p, "max_price")
        guests = parse_int(p, "guests")
        start, end = parse_date(p, "start_date"), parse_date(p, "end_date")

        if min_price is not None:
            qs = qs.filter(price_per_night__gte=min_price)
        if max_price is not None:
            qs = qs.filter(price_per_night__lte=max_price)
        if guests:
            qs = qs.filter(max_guests__gte=guests)
        property_type = p.get("property_type")
        if property_type and property_type != "Any":
            qs = qs.filter(property_type__iexact=property_type)
        for amenity in filter(None, (a.strip() for a in p.get("amenities", "").split(","))):
            # amenities is stored as a JSON list; match the quoted element so
            # "Pool" does not also match "Pool table"
            qs = qs.filter(amenities__icontains=f'"{amenity}"')
        if start and end:
            if end <= start:
                raise ValidationError({"end_date": "Check-out must be after check-in."})
            clashing = overlapping(start, end).values("listing_id")
            qs = qs.exclude(id__in=clashing)
        return qs

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        upcoming = listing.bookings.filter(
            status=Booking.Status.CONFIRMED, check_out_date__gte=date.today()
        ).count()
        if upcoming:
            return Response(
                {"detail": f"This listing has {upcoming} upcoming booking(s). Cancel them first."},
                status=status.HTTP_409_CONFLICT,
            )
        listing.delete()
        return Response({"message": "Listing deleted", "id": kwargs.get("pk")})

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        qs = self.get_queryset().filter(host=request.user)
        return Response(ListingCardSerializer(qs, many=True, context=self.get_serializer_context()).data)


class ReviewViewSet(viewsets.GenericViewSet):
    """Nested under /listings/{listing_pk}/reviews/."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    filter_backends = []

    def get_queryset(self):
        return Review.objects.filter(listing_id=self.kwargs["listing_pk"]).select_related("guest")

    def list(self, request, listing_pk=None):
        qs = self.get_queryset()
        agg = qs.aggregate(
            avg=Avg("rating"), n=Count("id"), clean=Avg("cleanliness"), acc=Avg("accuracy"),
            comm=Avg("communication"), loc=Avg("location_rating"), val=Avg("value_rating"),
        )
        ctx = {"superhost_ids": superhost_ids()}
        r = lambda v: round(v or 0.0, 2)  # noqa: E731
        return Response(
            {
                "average_rating": r(agg["avg"]),
                "total_reviews": agg["n"],
                "cleanliness_avg": r(agg["clean"]),
                "accuracy_avg": r(agg["acc"]),
                "communication_avg": r(agg["comm"]),
                "location_avg": r(agg["loc"]),
                "value_avg": r(agg["val"]),
                "reviews": ReviewSerializer(qs, many=True, context=ctx).data,
            }
        )

    def create(self, request, listing_pk=None):
        try:
            listing = Listing.objects.get(pk=listing_pk)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=404)

        stayed = Booking.objects.filter(
            listing=listing, guest=request.user, status=Booking.Status.CONFIRMED,
            check_out_date__lte=date.today(),
        ).exists()
        if not stayed:
            raise ValidationError("You can review a place after you have stayed there.")
        if Review.objects.filter(listing=listing, guest=request.user).exists():
            raise ValidationError("You have already reviewed this place.")

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(guest=request.user, listing=listing)
        listing.refresh_rating()
        return Response(
            ReviewSerializer(review, context={"superhost_ids": superhost_ids()}).data,
            status=status.HTTP_201_CREATED,
        )


class WishlistView(APIView):
    """GET: the signed-in user's saved listings."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        listings = (
            Listing.objects.filter(wishlisted_by__user=request.user)
            .select_related("host").prefetch_related("images")
            .order_by("-wishlisted_by__created_at")
        )
        return Response(ListingCardSerializer(listings, many=True, context=card_context(request)).data)


class WishlistToggleView(APIView):
    """POST {listing_id}: save the listing if it is not saved, remove it if it is."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        listing_id = request.data.get("listing_id")
        if not listing_id:
            raise ValidationError({"listing_id": "This field is required."})
        try:
            listing = Listing.objects.get(pk=listing_id)
        except (Listing.DoesNotExist, ValueError):
            return Response({"detail": "Listing not found."}, status=404)
        item, created = Wishlist.objects.get_or_create(user=request.user, listing=listing)
        if not created:
            item.delete()
        return Response(
            {
                "listing_id": listing.id,
                "is_wishlisted": created,
                "message": "Added to wishlist" if created else "Removed from wishlist",
            }
        )


class HostDashboardView(APIView):
    """The signed-in host's listings, bookings and headline numbers."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_host:
            return Response({"detail": "Only hosts have a dashboard."}, status=403)

        listings = (
            Listing.objects.filter(host=request.user)
            .select_related("host").prefetch_related("images")
        )
        bookings = Booking.objects.filter(listing__host=request.user)
        confirmed = bookings.filter(status=Booking.Status.CONFIRMED)
        rated = listings.filter(reviews_count__gt=0).aggregate(avg=Avg("rating"))["avg"]

        recent = bookings.select_related("listing", "guest").prefetch_related("listing__images")[:20]
        ctx = card_context(request)
        return Response(
            {
                "stats": {
                    "total_listings": listings.count(),
                    "total_bookings": confirmed.count(),
                    "total_revenue": float(confirmed.aggregate(s=Sum("total_price"))["s"] or 0),
                    "average_rating": round(rated or 0.0, 2),
                },
                "listings": ListingCardSerializer(listings, many=True, context=ctx).data,
                "recent_bookings": BookingSerializer(recent, many=True, context=ctx).data,
            }
        )


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
}


class UploadView(APIView):
    """POST multipart `file`: store a photo and return its URL.

    Demo storage on local disk. Production: S3/Cloudinary behind a CDN.
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            raise ValidationError({"file": "Choose an image to upload."})
        ext = ALLOWED_IMAGE_TYPES.get(file.content_type)
        if not ext:
            raise ValidationError({"file": "Only JPEG, PNG, WebP or GIF images are allowed."})
        if file.size > settings.MAX_UPLOAD_BYTES:
            raise ValidationError({"file": "Images must be 5 MB or smaller."})
        name = default_storage.save(f"uploads/{uuid.uuid4().hex}.{ext}", file)
        url = request.build_absolute_uri(f"{settings.MEDIA_URL}{name}")
        return Response({"url": url}, status=status.HTTP_201_CREATED)
