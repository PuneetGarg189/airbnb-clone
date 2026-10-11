from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


def default_avatar(user):
    return user.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}"


class PublicUserSerializer(serializers.ModelSerializer):
    """What anyone may see about a host or a review author. No email."""

    name = serializers.CharField(source="display_name", read_only=True)
    avatar_url = serializers.SerializerMethodField()
    is_superhost = serializers.SerializerMethodField()
    joined_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "avatar_url", "is_host", "is_superhost", "joined_date")

    def get_avatar_url(self, obj):
        return default_avatar(obj)

    def get_is_superhost(self, obj):
        # The set of superhost ids is computed once per request by the view
        # (one query) and passed in the serializer context.
        return obj.id in self.context.get("superhost_ids", ())

    def get_joined_date(self, obj):
        return f"Joined {obj.date_joined.strftime('%B %Y')}"


class UserSerializer(PublicUserSerializer):
    """The signed-in user's own profile (includes email)."""

    class Meta(PublicUserSerializer.Meta):
        fields = PublicUserSerializer.Meta.fields + ("email", "username")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "name", "password", "is_host")
        extra_kwargs = {"username": {"required": False}}

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        name = validated_data.pop("name", "").strip()
        if not validated_data.get("username"):
            validated_data["username"] = self._free_username(validated_data["email"])
        user = User(**validated_data)
        if name:
            first, _, last = name.partition(" ")
            user.first_name, user.last_name = first, last
        user.set_password(password)
        user.save()
        return user


    @staticmethod
    def _free_username(email):
        base = email.split("@")[0][:130] or "user"
        candidate, n = base, 1
        while User.objects.filter(username__iexact=candidate).exists():
            n += 1
            candidate = f"{base}{n}"
        return candidate


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Lets people sign in with their email address or their username."""

    def validate(self, attrs):
        identifier = attrs.get(self.username_field, "")
        if "@" in identifier:
            match = User.objects.filter(email__iexact=identifier).first()
            if match:
                attrs[self.username_field] = match.get_username()
        return super().validate(attrs)
