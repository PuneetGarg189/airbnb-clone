from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_host = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return self.username
