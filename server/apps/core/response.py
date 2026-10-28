from typing import Any, Optional
from rest_framework.response import Response
from rest_framework import status


def api_success(data: Any = None, message: str = "Operation successful", status_code: int = status.HTTP_200_OK) -> Response:
    """Standardized success response envelope."""
    payload = {
        "status": "success",
        "message": message,
        "data": data,
    }
    return Response(payload, status=status_code)


def api_error(message: str, error: Optional[Any] = None, status_code: int = status.HTTP_400_BAD_REQUEST) -> Response:
    """Standardized error response envelope."""
    payload = {
        "status": "error",
        "message": message,
        "error": error or message,
    }
    return Response(payload, status=status_code)
