from django.urls import path
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from .views import (
    RegisterView, VerifyEmailView, ResendVerificationView,
    LoginView, UserProfileView, ChangePasswordView, UpdateAboutView,
    MemberListView, AdminLoginView, AdminLogoutView, AdminDashboardView, LogoutView,
    ForgotPasswordView, AdminForgotPasswordView, ResetPasswordView
)
from .serializers import UserProfileSerializer, ChangePasswordSerializer

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('login/', LoginView.as_view(), name='user_login'),
    path('logout/', LogoutView.as_view(), name='user_logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-about/', UpdateAboutView.as_view(), name='update-about'),
    path('members/', MemberListView.as_view(), name='member-list'),
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin/logout/', AdminLogoutView.as_view(), name='admin_logout'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('admin/forgot-password/', AdminForgotPasswordView.as_view(), name='admin-forgot-password'),
    path('reset-password/<uuid:token>/', ResetPasswordView.as_view(), name='reset-password'),
]
