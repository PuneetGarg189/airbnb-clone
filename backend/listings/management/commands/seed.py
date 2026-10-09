from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Listing, ListingImage, Review, Wishlist
from bookings.models import Booking
from datetime import date, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # 1. Create users
        users_data = [
            {'username': 'host1', 'email': 'host1@example.com', 'is_host': True},
            {'username': 'host2', 'email': 'host2@example.com', 'is_host': True},
            {'username': 'host3', 'email': 'host3@example.com', 'is_host': True},
            {'username': 'host4', 'email': 'host4@example.com', 'is_host': True},
            {'username': 'guest1', 'email': 'guest1@example.com', 'is_host': False},
        ]

        users = []
        for u_data in users_data:
            user, created = User.objects.get_or_create(username=u_data['username'], defaults={'email': u_data['email'], 'is_host': u_data['is_host']})
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)
        
        hosts = [u for u in users if u.is_host]
        guest = users[-1]

        # 2. Create listings
        locations = ['Goa', 'Manali', 'Jaipur', 'Rishikesh', 'Udaipur', 'Bali', 'Santorini', 'Barcelona', 'Kyoto', 'Maldives', 'Tuscany', 'Cape Town', 'New York', 'Paris', 'Dubai']
        categories = ['Beachfront', 'Cabins', 'Trending', 'Amazing views', 'Iconic cities', 'Countryside', 'Tiny homes', 'Camping', 'Mansions', 'Boats']
        property_types = ['Villa', 'Cottage', 'Apartment', 'Bungalow', 'Cabin', 'Studio', 'Penthouse', 'Treehouse', 'Houseboat', 'Farmhouse']
        amenities = ['Wifi', 'Pool', 'Kitchen', 'Air conditioning', 'Washer', 'Dryer', 'Free parking', 'Hot tub', 'Gym', 'BBQ grill', 'Beach access', 'Mountain views', 'Dedicated workspace', 'EV charger', 'Breakfast included']

        image_sets = {
            'Beachfront': ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'],
            'Cabins': ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800'],
            'Amazing views': ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'],
            'Iconic cities': ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
            'Countryside': ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
        }

        default_images = ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']

        created_listings = []
        for i in range(40):
            cat = random.choice(categories)
            prop = random.choice(property_types)
            loc = random.choice(locations)
            host = random.choice(hosts)
            
            listing, created = Listing.objects.get_or_create(
                title=f"{prop} in {loc} ({i})",
                defaults={
                    'host': host,
                    'description': f"Beautiful {prop} located in {loc}. Enjoy your stay!",
                    'category': cat,
                    'property_type': prop,
                    'price_per_night': random.randint(50, 500),
                    'cleaning_fee': random.randint(10, 50),
                    'service_fee': random.randint(5, 30),
                    'city': loc,
                    'country': 'World',
                    'location': f"{loc}, World",
                    'latitude': random.uniform(-90, 90),
                    'longitude': random.uniform(-180, 180),
                    'max_guests': random.randint(1, 10),
                    'bedrooms': random.randint(1, 5),
                    'beds': random.randint(1, 5),
                    'baths': random.uniform(1.0, 3.0),
                    'amenities': random.sample(amenities, k=random.randint(3, 8))
                }
            )
            created_listings.append(listing)

            if created:
                imgs = image_sets.get(cat, default_images)
                for j, img_url in enumerate(imgs):
                    ListingImage.objects.create(listing=listing, image_url=img_url, is_primary=(j==0), display_order=j)

        # 3. Create bookings
        for i in range(20):
            listing = random.choice(created_listings)
            start = date.today() + timedelta(days=random.randint(1, 30))
            end = start + timedelta(days=random.randint(1, 7))
            Booking.objects.get_or_create(
                listing=listing,
                guest=guest,
                check_in_date=start,
                defaults={
                    'check_out_date': end,
                    'guest_count': random.randint(1, listing.max_guests),
                    'total_price': float(listing.price_per_night) * (end - start).days + float(listing.cleaning_fee) + float(listing.service_fee),
                    'status': 'CONFIRMED'
                }
            )

        # 4. Create reviews
        for i in range(30):
            listing = random.choice(created_listings)
            Review.objects.get_or_create(
                listing=listing,
                guest=guest,
                defaults={
                    'rating': random.randint(3, 5),
                    'cleanliness': random.uniform(3.0, 5.0),
                    'accuracy': random.uniform(3.0, 5.0),
                    'communication': random.uniform(3.0, 5.0),
                    'location_rating': random.uniform(3.0, 5.0),
                    'value_rating': random.uniform(3.0, 5.0),
                    'comment': "Great place, really enjoyed my stay here!"
                }
            )
            # Update listing rating
            reviews = Review.objects.filter(listing=listing)
            listing.rating = sum(r.rating for r in reviews) / len(reviews)
            listing.reviews_count = len(reviews)
            listing.save()

        # 5. Create wishlists
        for i in range(10):
            listing = random.choice(created_listings)
            Wishlist.objects.get_or_create(user=guest, listing=listing)

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database.'))
