from django.urls import path
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from .views import (
    RegisterView, VerifyEmailView, ResendVerificationView,
    LoginView, UserProfileView, ChangePasswordView, UpdateAboutView,
    MemberListView, AdminLoginView, AdminDashboardView
)
from .serializers import UserProfileSerializer, ChangePasswordSerializer

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('login/', LoginView.as_view(), name='user_login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-about/', UpdateAboutView.as_view(), name='update-about'),
    path('members/', MemberListView.as_view(), name='member-list'),
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
]
