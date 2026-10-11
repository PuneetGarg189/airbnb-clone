from rest_framework import permissions


class IsHostOrReadOnly(permissions.BasePermission):
    """Anyone can read. Writing needs a signed-in host; editing needs ownership."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        # creating a listing needs the host role; other writes are checked per object
        return user.is_host if view.action == "create" else True

    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS or obj.host_id == request.user.id
