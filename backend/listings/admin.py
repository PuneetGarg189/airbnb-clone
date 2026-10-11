from django.contrib import admin

from .models import Listing, ListingImage, Review, Wishlist

admin.site.register([Listing, ListingImage, Review, Wishlist])
