from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Guests and hosts share one table; `is_host` is the role flag."""

    is_host = models.BooleanField(default=False)
    avatar_url = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.username

    @property
    def display_name(self):
        return self.get_full_name() or self.username
