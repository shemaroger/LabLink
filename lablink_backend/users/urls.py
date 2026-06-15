from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    AdminCreateUserView,
    ProfileView,
    ChangePasswordView,
    LogoutView,
    UserListView,
    UserDetailView,
)

urlpatterns = [
    path('register/',        RegisterView.as_view(),            name='register'),
    path('admin-create/',    AdminCreateUserView.as_view(),      name='admin_create_user'),
    path('login/',           CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/',          LogoutView.as_view(),               name='logout'),
    path('token/refresh/',   TokenRefreshView.as_view(),         name='token_refresh'),
    path('profile/',         ProfileView.as_view(),              name='profile'),
    path('change-password/', ChangePasswordView.as_view(),       name='change_password'),
    path('list/',            UserListView.as_view(),             name='user_list'),
    path('<int:pk>/',        UserDetailView.as_view(),           name='user_detail'),
]