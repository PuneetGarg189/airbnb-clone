"""Seed the database with a realistic, deterministic demo dataset.

    python manage.py seed            # add data if the database is empty
    python manage.py seed --reset    # wipe app data first, then seed

Creates: 5 hosts, 7 guests, 16 curated listings with 5 photos each, past
completed stays with reviews, and upcoming bookings that block dates.
Every demo account uses the password `demo1234`.
"""
import json
import random
from datetime import date, timedelta
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from bookings.models import Booking
from bookings.services import quote
from listings.models import Listing, ListingImage, Review, Wishlist

User = get_user_model()
SEED_DIR = Path(__file__).resolve().parents[3] / "seed_data"
PASSWORD = "demo1234"

HOSTS = [
    ("elena", "Elena", "Rostova", "elena.rostova@example.com"),
    ("liam", "Liam", "Vance", "liam.vance@example.com"),
    ("sofia", "Sofia", "Rossi", "sofia.rossi@example.com"),
    ("kenji", "Kenji", "Sato", "kenji.sato@example.com"),
    ("amara", "Amara", "Okafor", "amara.okafor@example.com"),
]
GUESTS = [
    ("alex", "Alex", "Rivera", "alex.rivera@example.com"),
    ("priya", "Priya", "Nair", "priya.nair@example.com"),
    ("marcus", "Marcus", "Lee", "marcus.lee@example.com"),
    ("aisha", "Aisha", "Khan", "aisha.khan@example.com"),
    ("noah", "Noah", "Bennett", "noah.bennett@example.com"),
    ("mei", "Mei", "Tanaka", "mei.tanaka@example.com"),
    ("diego", "Diego", "Alvarez", "diego.alvarez@example.com"),
]

COMMENTS = [
    "Exactly as pictured and even better in person. The host thought of everything.",
    "Spotless, quiet and the view is unreal. We did not want to leave.",
    "Great location, easy check-in and a very comfortable bed. Would stay again.",
    "Lovely space with thoughtful touches. The kitchen had everything we needed.",
    "Fantastic stay. Responsive host and a beautiful neighbourhood to explore.",
    "Perfect for our family trip. Plenty of room and a lovely terrace in the evenings.",
    "Beautifully designed and very clean. Sleeping here was a treat.",
    "A little pricey but worth it for the setting. Everything worked perfectly.",
]


class Command(BaseCommand):
    help = "Seed demo users, listings, bookings and reviews."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="delete existing app data first")

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["reset"]:
            for model in (Review, Wishlist, Booking, ListingImage, Listing):
                model.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
        elif Listing.objects.exists():
            self.stdout.write("Database already has listings; use --reset to reseed.")
            return

        rng = random.Random(2026)  # deterministic: same data on every machine
        today = date.today()

        hosts = [self._user(u, is_host=True) for u in HOSTS]
        guests = [self._user(u, is_host=False) for u in GUESTS]

        raw = json.loads((SEED_DIR / "listings_1.json").read_text()) + json.loads(
            (SEED_DIR / "listings_2.json").read_text()
        )
        listings = []
        for item in raw:
            host = hosts[(item["host_idx"] - 1) % len(hosts)]
            listing = Listing.objects.create(
                host=host,
                title=item["title"], description=item["description"],
                category=item["category"], property_type=item["property_type"],
                price_per_night=item["price_per_night"],
                cleaning_fee=item["cleaning_fee"], service_fee=item["service_fee"],
                city=item["city"], country=item["country"], location=item["location"],
                latitude=item["latitude"], longitude=item["longitude"],
                max_guests=item["max_guests"], bedrooms=item["bedrooms"],
                beds=item["beds"], baths=item["baths"], amenities=item["amenities"],
            )
            ListingImage.objects.bulk_create(
                ListingImage(listing=listing, url=url, is_cover=(i == 0), display_order=i)
                for i, url in enumerate(item["images"])
            )
            listings.append(listing)

        # Past, completed stays (each one earns a review) ...
        for listing in listings:
            reviewers = rng.sample(guests, k=rng.randint(4, 6))
            for n, guest in enumerate(reviewers):
                end = today - timedelta(days=rng.randint(7, 200) + n * 9)
                start = end - timedelta(days=rng.randint(2, 6))
                self._booking(listing, guest, start, end, rng)
                rating = rng.choices([5, 4], weights=[7, 3])[0]
                Review.objects.create(
                    listing=listing, guest=guest, rating=rating,
                    cleanliness=rng.choice([4, 5, 5]), accuracy=rng.choice([4, 5, 5]),
                    communication=rng.choice([4, 5, 5]), location_rating=rng.choice([4, 5, 5]),
                    value_rating=rng.choice([4, 4, 5]), comment=rng.choice(COMMENTS),
                )
            listing.refresh_rating()

        # ... and upcoming stays that block dates on the calendar.
        for listing in listings:
            cursor = today + timedelta(days=rng.randint(2, 10))
            for _ in range(rng.randint(1, 2)):
                start = cursor
                end = start + timedelta(days=rng.randint(2, 6))
                self._booking(listing, rng.choice(guests), start, end, rng)
                cursor = end + timedelta(days=rng.randint(3, 15))

        # A few wishlist hearts for the demo guest.
        for listing in rng.sample(listings, 4):
            Wishlist.objects.create(user=guests[0], listing=listing)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(hosts)} hosts, {len(guests)} guests, {len(listings)} listings, "
            f"{Booking.objects.count()} bookings, {Review.objects.count()} reviews."
        ))
        self.stdout.write(f"Demo logins (password '{PASSWORD}'): guest 'alex', host 'elena'.")

    def _user(self, data, is_host):
        username, first, last, email = data
        user = User(username=username, first_name=first, last_name=last, email=email, is_host=is_host)
        user.set_password(PASSWORD)
        user.save()
        return user

    def _booking(self, listing, guest, start, end, rng):
        guests = rng.randint(1, listing.max_guests)
        _, total = quote(listing, start, end)
        return Booking.objects.create(
            listing=listing, guest=guest, check_in_date=start, check_out_date=end,
            guest_count=guests, total_price=total,
        )
