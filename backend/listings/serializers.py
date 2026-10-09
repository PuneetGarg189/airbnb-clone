from rest_framework import serializers
from django.db.models import Avg
from .models import Listing, ListingImage, Review, Wishlist

class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ('id', 'url', 'is_primary', 'display_order')

    def get_url(self, obj):
        return obj.url

class ReviewAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    joined_date = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_avatar_url(self, obj):
        if hasattr(obj, 'profile_picture') and obj.profile_picture:
            return obj.profile_picture.url
        return f'https://api.dicebear.com/7.x/avataaars/svg?seed={obj.username}'

    def get_joined_date(self, obj):
        return f'Joined {obj.date_joined.strftime("%B %Y")}'

class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ('id', 'author', 'rating', 'cleanliness', 'accuracy',
                  'communication', 'location_rating', 'value_rating', 'comment', 'created_at')
        read_only_fields = ('author', 'created_at')

    def get_author(self, obj):
        return ReviewAuthorSerializer(obj.guest).data

class HostSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.SerializerMethodField()
    email = serializers.EmailField()
    avatar_url = serializers.SerializerMethodField()
    is_host = serializers.BooleanField()
    is_superhost = serializers.SerializerMethodField()
    joined_date = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_avatar_url(self, obj):
        if hasattr(obj, 'profile_picture') and obj.profile_picture:
            return obj.profile_picture.url
        return f'https://api.dicebear.com/7.x/avataaars/svg?seed={obj.username}'

    def get_is_superhost(self, obj):
        return obj.listings.count() >= 3

    def get_joined_date(self, obj):
        return f'Joined {obj.date_joined.strftime("%B %Y")}'

class ListingSerializer(serializers.ModelSerializer):
    host = HostSerializer(read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ('host', 'rating', 'reviews_count', 'created_at', 'updated_at')

    def get_cover_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary.url if primary else ''

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        user_id = None
        if request:
            user_id = request.query_params.get('user_id') or (request.user.id if request.user.is_authenticated else None)
        if user_id:
            return Wishlist.objects.filter(user_id=user_id, listing=obj).exists()
        return False

class ListingCreateSerializer(serializers.ModelSerializer):
    image_urls = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Listing
        fields = [
            'title', 'description', 'category', 'property_type',
            'price_per_night', 'cleaning_fee', 'service_fee',
            'city', 'country', 'location', 'latitude', 'longitude',
            'max_guests', 'bedrooms', 'beds', 'baths', 'amenities', 'image_urls'
        ]

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        listing = Listing.objects.create(**validated_data)
        for i, url in enumerate(image_urls):
            ListingImage.objects.create(
                listing=listing, image_url=url,
                is_primary=(i == 0), display_order=i
            )
        return listing

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if image_urls is not None:
            instance.images.all().delete()
            for i, url in enumerate(image_urls):
                ListingImage.objects.create(
                    listing=instance, image_url=url,
                    is_primary=(i == 0), display_order=i
                )
        return instance

class WishlistSerializer(serializers.ModelSerializer):
    listing = ListingSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'listing', 'created_at')
