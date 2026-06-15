from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, required=True,
                                      validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'role',
                  'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """Admin creates user — password is auto-generated."""
    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        import random
        import string
        # Generate random 10-char password
        password = ''.join(
            random.choices(
                string.ascii_letters + string.digits, k=10
            )
        )
        user = User.objects.create_user(
            **validated_data,
            password=password,
            must_change_password=True,
        )
        user._plain_password = password  # attach for email sending
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'is_active',
            'must_change_password', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    old_password  = serializers.CharField(required=True)
    new_password  = serializers.CharField(required=True,
                                          validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {'new_password': 'Passwords do not match.'}
            )
        return attrs