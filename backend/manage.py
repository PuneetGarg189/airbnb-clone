#!/usr/bin/env python
"""Django's command-line utility.

Local convenience: when you run `python manage.py ...` we default to DEBUG
mode and a throw-away secret key so that nothing needs to be configured.
Production runs through gunicorn (config.wsgi) and does NOT get these
defaults - it must provide SECRET_KEY, ALLOWED_HOSTS, etc. itself.
"""
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    os.environ.setdefault("DJANGO_DEBUG", "True")
    os.environ.setdefault("SECRET_KEY", "local-development-only-not-a-secret")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
