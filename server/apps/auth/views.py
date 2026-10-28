from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from .serializers import LoginSerializer



@api_view(["POST"])
def login_view(request):
    """
    POST: Authenticate a user.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data.get("email")
    password = serializer.validated_data.get("password")
   

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_authenticate_user(%s, %s);",
                [email, password],
            )
            row = cursor.fetchone()
            user_id = row[0] if row else None

        return Response(
            {
                "status": "success",
                "message": "User authenticated successfully",
                "data": {
                    "user_id": user_id,
                },
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    