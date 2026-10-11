from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import Listing, Review

User = get_user_model()


def d(offset):
    return (date.today() + timedelta(days=offset)).isoformat()


class Base(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user("host", "h@x.com", "pass12345", is_host=True)
        self.guest = User.objects.create_user("guest", "g@x.com", "pass12345")
        self.other = User.objects.create_user("other", "o@x.com", "pass12345")
        self.listing = Listing.objects.create(
            host=self.host, title="Loft", description="Nice", category="City",
            property_type="Apartment", price_per_night=Decimal("100.00"),
            cleaning_fee=Decimal("20.00"), service_fee=Decimal("10.00"),
            city="Paris", country="France", location="Paris, France",
            latitude=48.85, longitude=2.35, max_guests=3, bedrooms=1, beds=1, baths=1,
            amenities=["Wifi", "Pool"],
        )

    def login(self, user):
        self.client.force_authenticate(user)

    def book(self, start, end, guests=2, listing=None):
        return self.client.post("/api/bookings/", {
            "listing_id": (listing or self.listing).id,
            "start_date": d(start), "end_date": d(end), "guests_count": guests,
        }, format="json")


class BookingRules(Base):
    def test_requires_login(self):
        self.assertEqual(self.book(5, 8).status_code, 401)

    def test_create_computes_price_on_server(self):
        self.login(self.guest)
        r = self.book(5, 8)
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(Decimal(str(r.data["total_price"])), Decimal("330.00"))  # 3*100+20+10
        self.assertEqual(r.data["user_id"], self.guest.id)

    def test_overlap_rejected(self):
        self.login(self.guest)
        self.assertEqual(self.book(5, 8).status_code, 201)
        self.login(self.other)
        for s, e in [(6, 7), (4, 6), (7, 10), (3, 12)]:
            self.assertEqual(self.book(s, e).status_code, 400, (s, e))

    def test_back_to_back_allowed(self):
        self.login(self.guest)
        self.assertEqual(self.book(5, 8).status_code, 201)
        self.assertEqual(self.book(8, 10).status_code, 201)
        self.assertEqual(self.book(3, 5).status_code, 201)

    def test_cancel_frees_dates(self):
        self.login(self.guest)
        bid = self.book(5, 8).data["id"]
        self.assertEqual(self.client.delete(f"/api/bookings/{bid}/").status_code, 200)
        self.assertEqual(self.book(5, 8).status_code, 201)

    def test_invalid_inputs(self):
        self.login(self.guest)
        self.assertEqual(self.book(-3, 2).status_code, 400)   # in the past
        self.assertEqual(self.book(8, 5).status_code, 400)    # reversed
        self.assertEqual(self.book(5, 5).status_code, 400)    # zero nights
        self.assertEqual(self.book(5, 8, guests=4).status_code, 400)  # over capacity
        self.assertEqual(self.book(5, 8, guests=0).status_code, 400)

    def test_cannot_book_own_listing(self):
        self.login(self.host)
        self.assertEqual(self.book(5, 8).status_code, 400)

    def test_only_participants_can_cancel(self):
        self.login(self.guest)
        bid = self.book(5, 8).data["id"]
        self.login(self.other)
        self.assertEqual(self.client.delete(f"/api/bookings/{bid}/").status_code, 404)
        self.login(self.host)
        self.assertEqual(self.client.delete(f"/api/bookings/{bid}/").status_code, 200)

    def test_my_trips_only_mine(self):
        self.login(self.guest)
        self.book(5, 8)
        self.login(self.other)
        self.assertEqual(self.client.get("/api/bookings/my_trips/").data, [])

    def test_booked_dates_public_without_guest_details(self):
        self.login(self.guest)
        self.book(5, 8)
        self.client.force_authenticate(None)
        r = self.client.get(f"/api/bookings/booked_dates/?listing_id={self.listing.id}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data, [{"start_date": d(5), "end_date": d(8)}])


class ListingRules(Base):
    payload = {
        "title": "New", "description": "d", "category": "City", "property_type": "House",
        "price_per_night": "80.00", "city": "Rome", "country": "Italy",
        "location": "Rome, Italy", "latitude": 41.9, "longitude": 12.5,
        "max_guests": 2, "bedrooms": 1, "beds": 1, "baths": 1, "amenities": ["Wifi"],
        "image_urls": ["https://example.com/a.jpg"],
    }

    def test_anonymous_cannot_write(self):
        self.assertEqual(self.client.post("/api/listings/", self.payload, format="json").status_code, 401)

    def test_guest_cannot_create_host_can(self):
        self.login(self.guest)
        self.assertEqual(self.client.post("/api/listings/", self.payload, format="json").status_code, 403)
        self.login(self.host)
        r = self.client.post("/api/listings/", self.payload, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data["host_id"], self.host.id)

    def test_owner_only_edit_and_delete(self):
        self.login(self.other)
        self.assertEqual(self.client.patch(f"/api/listings/{self.listing.id}/", {"title": "x"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/listings/{self.listing.id}/").status_code, 403)
        self.login(self.host)
        self.assertEqual(self.client.patch(f"/api/listings/{self.listing.id}/", {"title": "Renamed"}, format="json").status_code, 200)

    def test_delete_blocked_with_upcoming_booking(self):
        self.login(self.guest)
        self.book(5, 8)
        self.login(self.host)
        self.assertEqual(self.client.delete(f"/api/listings/{self.listing.id}/").status_code, 409)

    def test_negative_price_rejected(self):
        self.login(self.host)
        r = self.client.post("/api/listings/", {**self.payload, "price_per_night": "-5"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_search_filters(self):
        self.client.force_authenticate(None)
        base = "/api/listings/"
        self.assertEqual(self.client.get(base + "?amenities=Pool").data["total"], 1)
        self.assertEqual(self.client.get(base + "?amenities=Poo").data["total"], 0)
        self.assertEqual(self.client.get(base + "?guests=4").data["total"], 0)
        self.assertEqual(self.client.get(base + "?min_price=200").data["total"], 0)
        self.assertEqual(self.client.get(base + "?min_price=abc").status_code, 400)

    def test_availability_filter(self):
        self.login(self.guest)
        self.book(5, 8)
        self.client.force_authenticate(None)
        url = "/api/listings/?start_date=%s&end_date=%s"
        self.assertEqual(self.client.get(url % (d(6), d(7))).data["total"], 0)
        self.assertEqual(self.client.get(url % (d(8), d(10))).data["total"], 1)  # back-to-back ok

    def test_wishlist_toggle(self):
        self.login(self.guest)
        r = self.client.post("/api/wishlists/toggle/", {"listing_id": self.listing.id}, format="json")
        self.assertTrue(r.data["is_wishlisted"])
        self.assertEqual(len(self.client.get("/api/wishlists/").data), 1)
        r = self.client.post("/api/wishlists/toggle/", {"listing_id": self.listing.id}, format="json")
        self.assertFalse(r.data["is_wishlisted"])


class ReviewRules(Base):
    url = property(lambda self: f"/api/listings/{self.listing.id}/reviews/")
    body = {"rating": 5, "cleanliness": 5, "accuracy": 5, "communication": 5,
            "location_rating": 5, "value_rating": 5, "comment": "Great"}

    def test_needs_completed_stay(self):
        self.login(self.guest)
        self.assertEqual(self.client.post(self.url, self.body, format="json").status_code, 400)
        Booking.objects.create(listing=self.listing, guest=self.guest, check_in_date=date.today() + timedelta(days=3),
                               check_out_date=date.today() + timedelta(days=5), guest_count=1, total_price=1)
        self.assertEqual(self.client.post(self.url, self.body, format="json").status_code, 400)  # future

    def test_review_after_stay_once_updates_rating(self):
        Booking.objects.create(listing=self.listing, guest=self.guest, check_in_date=date.today() - timedelta(days=5),
                               check_out_date=date.today() - timedelta(days=2), guest_count=1, total_price=1)
        self.login(self.guest)
        r = self.client.post(self.url, self.body, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(self.client.post(self.url, self.body, format="json").status_code, 400)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.reviews_count, 1)
        s = self.client.get(self.url).data
        self.assertEqual(s["total_reviews"], 1)
        self.assertEqual(s["reviews"][0]["user"]["id"], self.guest.id)


class DashboardAndAuth(Base):
    def test_dashboard_shape_and_permissions(self):
        self.login(self.guest)
        self.assertEqual(self.client.get("/api/host/dashboard/").status_code, 403)
        self.login(self.host)
        r = self.client.get("/api/host/dashboard/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(set(r.data), {"stats", "listings", "recent_bookings"})
        self.assertEqual(r.data["stats"]["total_listings"], 1)

    def test_register_login_me_become_host(self):
        r = self.client.post("/api/users/register/", {"name": "Zed Zed", "email": "z@x.com", "password": "Sup3rSecret!"}, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        r = self.client.post("/api/users/login/", {"username": "z@x.com", "password": "Sup3rSecret!"}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + r.data["access"])
        me = self.client.get("/api/users/me/")
        self.assertFalse(me.data["is_host"])
        me = self.client.patch("/api/users/me/", {"is_host": True}, format="json")
        self.assertTrue(me.data["is_host"])

    def test_duplicate_email_and_bad_login(self):
        body = {"name": "A B", "email": "g@x.com", "password": "Sup3rSecret!"}
        self.assertEqual(self.client.post("/api/users/register/", body, format="json").status_code, 400)
        r = self.client.post("/api/users/login/", {"username": "g@x.com", "password": "wrong"}, format="json")
        self.assertEqual(r.status_code, 401)
        self.assertIn("detail", r.data)
