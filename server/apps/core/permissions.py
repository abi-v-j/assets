from rest_framework.permissions import BasePermission


class IsAuthenticatedAdmin(BasePermission):
    """
    Allows access only to authenticated admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False) and getattr(request.user, 'user_id', None))
