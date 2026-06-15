from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from .serializers import (
    RegisterSerializer,
    AdminCreateUserSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)
from users.permissions import IsAdmin


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                user = User.objects.get(
                    email=request.data.get('email')
                )
                from audit_logs.utils import log_action
                log_action(
                    user=user,
                    action='login',
                    description='User logged in',
                    request=request,
                )
            except Exception:
                pass
        return response


class RegisterView(generics.CreateAPIView):
    """Public self-registration — kept for backward compatibility."""
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user    = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Account created successfully.',
            'user':    UserSerializer(user).data,
            'tokens':  {
                'refresh': str(refresh),
                'access':  str(refresh.access_token),
            },
        }, status=status.HTTP_201_CREATED)


class AdminCreateUserView(APIView):
    """
    Admin creates any staff user.
    Auto-generates password and sends welcome email.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send welcome email with temporary password
        plain_password = getattr(user, '_plain_password', None)
        email_sent = False
        if plain_password:
            from .email_utils import send_welcome_email
            email_sent = send_welcome_email(user, plain_password)

        # Log action
        try:
            from audit_logs.utils import log_action
            log_action(
                user=request.user,
                action='register',
                affected_entity='user',
                entity_id=user.id,
                description=(
                    f'Admin created {user.role} account '
                    f'for {user.email}'
                ),
                request=request,
            )
        except Exception:
            pass

        return Response({
            'message': (
                f'User created successfully. '
                f'{"Welcome email sent." if email_sent else "Email failed — check SMTP settings."}'
            ),
            'user':       UserSerializer(user).data,
            'email_sent': email_sent,
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(
            serializer.validated_data['old_password']
        ):
            return Response(
                {'old_password': 'Incorrect password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.must_change_password = False
        user.save()

        try:
            from audit_logs.utils import log_action
            log_action(
                user=user,
                action='change_password',
                description='User changed password',
                request=request,
            )
        except Exception:
            pass

        return Response({'message': 'Password changed successfully.'})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            try:
                from audit_logs.utils import log_action
                log_action(
                    user=request.user,
                    action='logout',
                    description='User logged out',
                    request=request,
                )
            except Exception:
                pass
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserListView(generics.ListAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        role     = self.request.query_params.get('role', None)
        queryset = User.objects.all().order_by('-created_at')
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset           = User.objects.all()