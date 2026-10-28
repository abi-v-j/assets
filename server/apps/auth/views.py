from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.db import connection

from apps.core.response import api_success, api_error
from apps.core.security import generate_jwt_tokens, verify_jwt_token
from apps.core.authentication import AdminJWTAuthentication
from apps.core.permissions import IsAuthenticatedAdmin
from .serializers import LoginSerializer, RefreshTokenSerializer, AdminUserSerializer


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST: Authenticate an admin user via PostgreSQL stored procedure (sp_authenticate_admin).
    Returns JWT access and refresh tokens.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error("Invalid login parameters", serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data.get("email").strip().lower()
    password = serializer.validated_data.get("password")

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_authenticate_admin(%s, %s, NULL, NULL, NULL, NULL);",
                [email, password],
            )
            row = cursor.fetchone()
            if not row:
                return api_error("Invalid email or password", status_code=status.HTTP_401_UNAUTHORIZED)

            user_id, full_name, role, is_active = row[0], row[1], row[2], row[3]

            if not is_active:
                return api_error("This administrator account has been deactivated.", status_code=status.HTTP_403_FORBIDDEN)

        # Generate enterprise JWT tokens
        tokens = generate_jwt_tokens(user_id=user_id, email=email, full_name=full_name, role=role)

        data = {
            "user": {
                "user_id": user_id,
                "email": email,
                "full_name": full_name,
                "role": role,
            },
            "tokens": tokens,
        }

        return api_success(data=data, message="Admin authenticated successfully", status_code=status.HTTP_200_OK)

    except Exception as e:
        error_msg = str(e)
        if "Invalid email or password" in error_msg:
            return api_error("Invalid email or password.", status_code=status.HTTP_401_UNAUTHORIZED)
        return api_error(f"Authentication failed: {error_msg}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    POST: Refresh an expired JWT access token using a valid refresh token.
    """
    serializer = RefreshTokenSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error("Invalid refresh request", serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    refresh_token = serializer.validated_data.get("refresh_token")
    payload = verify_jwt_token(refresh_token, expected_type='refresh')

    if not payload:
        return api_error("Invalid or expired refresh token", status_code=status.HTTP_401_UNAUTHORIZED)

    user_id = payload.get("user_id")
    email = payload.get("email")

    # Fetch fresh admin info from DB
    with connection.cursor() as cursor:
        cursor.execute("SELECT full_name, role, is_active FROM admin_users WHERE user_id = %s;", [user_id])
        row = cursor.fetchone()
        if not row or not row[2]:
            return api_error("Admin account is no longer active", status_code=status.HTTP_403_FORBIDDEN)
        full_name, role = row[0], row[1]

    tokens = generate_jwt_tokens(user_id=user_id, email=email, full_name=full_name, role=role)
    return api_success(data={"tokens": tokens}, message="Token refreshed successfully")


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def profile_view(request):
    """
    GET: Get current authenticated admin profile.
    """
    user = request.user
    data = {
        "user_id": user.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }
    return api_success(data=data, message="Admin profile retrieved successfully")