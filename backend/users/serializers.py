from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    is_superhost = serializers.SerializerMethodField()
    joined_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'name', 'avatar_url', 'is_host', 'is_superhost', 'joined_date')
        read_only_fields = ('id',)

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

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_host')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
