from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def _first_message(data):
    """Dig the first human-readable message out of DRF's nested error data."""
    if isinstance(data, dict):
        for value in data.values():
            msg = _first_message(value)
            if msg:
                return msg
    elif isinstance(data, (list, tuple)):
        for value in data:
            msg = _first_message(value)
            if msg:
                return msg
    elif data:
        return str(data)
    return None


def api_exception_handler(exc, context):
    """Every error body has a top-level `detail` string the UI can show."""
    response = exception_handler(exc, context)
    if response is not None and isinstance(exc, ValidationError):
        errors = response.data
        response.data = {
            "detail": _first_message(errors) or "Invalid request.",
            "errors": errors,
        }
    return response
