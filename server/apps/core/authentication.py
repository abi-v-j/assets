from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.db import connection
from .security import verify_jwt_token


class AdminUserContext:
    """Represents the authenticated admin user in request.user."""
    def __init__(self, user_id: int, email: str, full_name: str, role: str):
        self.user_id = user_id
        self.email = email
        self.full_name = full_name
        self.role = role
        self.is_authenticated = True

    def __str__(self):
        return f"{self.email} ({self.role})"


class AdminJWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication class for Django REST framework.
    Extracts Bearer token from the Authorization header.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        payload = verify_jwt_token(token, expected_type='access')
        if not payload:
            raise AuthenticationFailed('Invalid or expired authentication token.')

        user_id = payload.get('user_id')
        email = payload.get('email')
        full_name = payload.get('full_name', '')
        role = payload.get('role', 'ADMIN')

        # Verify active status in DB
        with connection.cursor() as cursor:
            cursor.execute("SELECT is_active FROM admin_users WHERE user_id = %s;", [user_id])
            row = cursor.fetchone()
            if not row or not row[0]:
                raise AuthenticationFailed('Admin account does not exist or has been deactivated.')

        admin_user = AdminUserContext(user_id=user_id, email=email, full_name=full_name, role=role)
        return (admin_user, token)
