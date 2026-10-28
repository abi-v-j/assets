from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True)


class AdminUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
