import datetime
import jwt
from django.conf import settings
from typing import Dict, Any, Optional

JWT_SECRET_KEY = getattr(settings, 'SECRET_KEY', 'default-jwt-secret-key-change-in-prod')
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_TOKEN_LIFETIME = datetime.timedelta(hours=24)
JWT_REFRESH_TOKEN_LIFETIME = datetime.timedelta(days=7)


def generate_jwt_tokens(user_id: int, email: str, full_name: str, role: str) -> Dict[str, str]:
    """Generate JWT access and refresh tokens for authenticated admin."""
    now = datetime.datetime.now(datetime.timezone.utc)
    
    access_payload = {
        'user_id': user_id,
        'email': email,
        'full_name': full_name,
        'role': role,
        'token_type': 'access',
        'iat': now,
        'exp': now + JWT_ACCESS_TOKEN_LIFETIME,
    }
    
    refresh_payload = {
        'user_id': user_id,
        'email': email,
        'token_type': 'refresh',
        'iat': now,
        'exp': now + JWT_REFRESH_TOKEN_LIFETIME,
    }
    
    access_token = jwt.encode(access_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer',
        'expires_in': int(JWT_ACCESS_TOKEN_LIFETIME.total_seconds()),
    }


def verify_jwt_token(token: str, expected_type: str = 'access') -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT token. Returns payload dict or None if invalid."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get('token_type') != expected_type:
            return None
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
