from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Avg
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from .models import Listing, ListingImage, Review, Wishlist
from .serializers import (
    ListingSerializer, ListingCreateSerializer,
    ReviewSerializer, WishlistSerializer
)

class IsHostOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'host'):
            return obj.host == request.user
        return False

class ListingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'property_type', 'city', 'country']
    search_fields = ['title', 'description', 'location', 'city', 'country']
    ordering_fields = ['price_per_night', 'rating', 'created_at']

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return ListingCreateSerializer
        return ListingSerializer

    def get_queryset(self):
        qs = Listing.objects.all().prefetch_related('images', 'reviews').select_related('host').order_by('-created_at')
        params = self.request.query_params

        # Filters
        min_price = params.get('min_price')
        max_price = params.get('max_price')
        guests = params.get('guests')
        property_type = params.get('property_type')
        start_date = params.get('start_date')
        end_date = params.get('end_date')
        amenities = params.get('amenities')

        if min_price:
            try:
                qs = qs.filter(price_per_night__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                qs = qs.filter(price_per_night__lte=float(max_price))
            except ValueError:
                pass
        if guests:
            try:
                qs = qs.filter(max_guests__gte=int(guests))
            except ValueError:
                pass
        if property_type and property_type != 'Any':
            qs = qs.filter(property_type__iexact=property_type)
        if amenities:
            for amenity in amenities.split(','):
                qs = qs.filter(amenities__icontains=amenity.strip())
        if start_date and end_date:
            # Exclude listings that have confirmed bookings overlapping with requested dates
            from bookings.models import Booking
            booked_listing_ids = Booking.objects.filter(
                status='CONFIRMED',
                check_in_date__lt=end_date,
                check_out_date__gt=start_date
            ).values_list('listing_id', flat=True)
            qs = qs.exclude(id__in=booked_listing_ids)

        return qs

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        host_id = self.request.data.get('host_id')
        if host_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                host = User.objects.get(id=host_id)
            except User.DoesNotExist:
                host = None
        else:
            host = self.request.user if self.request.user.is_authenticated else None
        serializer.save(host=host)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def my_listings(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            qs = self.get_queryset().filter(host_id=user_id)
        else:
            qs = self.get_queryset().filter(host=request.user if request.user.is_authenticated else None)
        serializer = ListingSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        listing_id = self.kwargs.get('listing_pk')
        if listing_id:
            return Review.objects.filter(listing_id=listing_id).select_related('guest').order_by('-created_at')
        return Review.objects.none()

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        reviews = ReviewSerializer(qs, many=True).data
        listing_id = self.kwargs.get('listing_pk')
        try:
            listing = Listing.objects.get(id=listing_id)
            avg = listing.rating
        except Listing.DoesNotExist:
            avg = 0

        # Aggregate sub-ratings
        agg = qs.aggregate(
            avg_cleanliness=Avg('cleanliness'),
            avg_accuracy=Avg('accuracy'),
            avg_communication=Avg('communication'),
            avg_location=Avg('location_rating'),
            avg_value=Avg('value_rating')
        )

        return Response({
            'avg_rating': avg,
            'total_reviews': len(reviews),
            'cleanliness': round(agg['avg_cleanliness'] or avg, 2),
            'accuracy': round(agg['avg_accuracy'] or avg, 2),
            'communication': round(agg['avg_communication'] or avg, 2),
            'location_rating': round(agg['avg_location'] or avg, 2),
            'value_rating': round(agg['avg_value'] or avg, 2),
            'reviews': reviews,
        })

    def perform_create(self, serializer):
        listing_id = self.kwargs.get('listing_pk')
        user_id = self.request.data.get('user_id')
        if user_id:
            from users.models import User
            guest = User.objects.get(id=user_id)
        else:
            guest = self.request.user
        review = serializer.save(guest=guest, listing_id=listing_id)
        # Update listing rating
        listing = Listing.objects.get(id=listing_id)
        reviews = Review.objects.filter(listing=listing)
        if reviews.exists():
            listing.rating = round(reviews.aggregate(Avg('rating'))['rating__avg'], 2)
            listing.reviews_count = reviews.count()
            listing.save()

class WishlistToggleView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response([])
        wishlists = Wishlist.objects.filter(user_id=user_id).select_related('listing').prefetch_related('listing__images', 'listing__host')
        listings = [w.listing for w in wishlists]
        data = ListingSerializer(listings, many=True, context={'request': request}).data
        return Response(data)

    def post(self, request):
        listing_id = request.data.get('listing_id')
        user_id = request.data.get('user_id')
        if not listing_id or not user_id:
            return Response({'error': 'listing_id and user_id required'}, status=400)
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=404)
        wishlist_item, created = Wishlist.objects.get_or_create(
            user_id=user_id, listing=listing
        )
        if not created:
            wishlist_item.delete()
            return Response({'listing_id': listing_id, 'is_wishlisted': False, 'message': 'Removed from wishlist'})
        return Response({'listing_id': listing_id, 'is_wishlisted': True, 'message': 'Added to wishlist'})

class HostDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from bookings.models import Booking
        from bookings.serializers import BookingSerializer
        host_id = request.query_params.get('host_id')
        if not host_id:
            return Response({'error': 'host_id required'}, status=400)
        listings = Listing.objects.filter(host_id=host_id).prefetch_related('images').select_related('host')
        bookings = Booking.objects.filter(listing__host_id=host_id).select_related('listing', 'guest').order_by('-created_at')
        
        total_revenue = sum(float(b.total_price) for b in bookings if b.status == 'CONFIRMED')
        avg_rating = sum(l.rating for l in listings) / len(listings) if listings else 0

        return Response({
            'listings': ListingSerializer(listings, many=True, context={'request': request}).data,
            'bookings': BookingSerializer(bookings, many=True).data,
            'total_revenue': round(total_revenue, 2),
            'total_listings': listings.count(),
            'avg_rating': round(avg_rating, 2),
        })
