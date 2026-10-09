from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        params = self.request.query_params
        user_id = params.get('user_id')
        host_id = params.get('host_id')
        listing_id = params.get('listing_id')

        qs = Booking.objects.all().select_related('listing', 'guest').prefetch_related('listing__images').order_by('-created_at')

        if listing_id:
            qs = qs.filter(listing_id=listing_id)
        elif host_id:
            qs = qs.filter(listing__host_id=host_id)
        elif user_id:
            qs = qs.filter(guest_id=user_id)
        elif self.request.user.is_authenticated:
            if self.request.user.is_host:
                qs = qs.filter(listing__host=self.request.user)
            else:
                qs = qs.filter(guest=self.request.user)
        return qs

    def perform_create(self, serializer):
        data = self.request.data
        user_id = data.get('user_id')
        if user_id:
            from users.models import User
            guest = User.objects.get(id=user_id)
        elif self.request.user.is_authenticated:
            guest = self.request.user
        else:
            from users.models import User
            guest = User.objects.first()

        # Map frontend field names to model field names
        check_in = data.get('start_date') or data.get('check_in_date')
        check_out = data.get('end_date') or data.get('check_out_date')
        guest_count = data.get('guests_count') or data.get('guest_count', 1)

        from listings.models import Listing
        listing = Listing.objects.get(id=data['listing_id'])
        from datetime import date
        check_in_date = date.fromisoformat(check_in)
        check_out_date = date.fromisoformat(check_out)
        nights = (check_out_date - check_in_date).days
        total = float(listing.price_per_night) * nights + float(listing.cleaning_fee) + float(listing.service_fee)

        serializer.save(
            guest=guest,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            guest_count=int(guest_count),
            total_price=total,
            status='CONFIRMED'
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = 'CANCELLED'
        instance.save()
        return Response({'message': 'Booking cancelled', 'id': instance.id})

    @action(detail=False, methods=['get'], url_path='booked_dates')
    def booked_dates(self, request):
        listing_id = request.query_params.get('listing_id')
        if not listing_id:
            return Response([])
        bookings = Booking.objects.filter(
            listing_id=listing_id,
            status='CONFIRMED'
        ).values('check_in_date', 'check_out_date')
        return Response([
            {'start_date': str(b['check_in_date']), 'end_date': str(b['check_out_date'])}
            for b in bookings
        ])

    @action(detail=False, methods=['get'], url_path='my_trips')
    def my_trips(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            qs = Booking.objects.filter(guest_id=user_id)
        elif request.user.is_authenticated:
            qs = Booking.objects.filter(guest=request.user)
        else:
            return Response([])
        qs = qs.select_related('listing', 'guest').prefetch_related('listing__images').order_by('-created_at')
        return Response(BookingSerializer(qs, many=True).data)
