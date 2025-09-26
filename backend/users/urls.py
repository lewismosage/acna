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
    ForgotPasswordView, AdminForgotPasswordView, ResetPasswordView,
    AdminUserListView, SendAdminInviteView, AdminInviteListView, 
    AdminSignUpWithInviteView, RemoveAdminView, AssignAdminRoleView, SendEmailToUserView,
    UpdateUserStatusView, TokenRefreshView, AdminTokenRefreshView
)
from .serializers import UserProfileSerializer, ChangePasswordSerializer

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('login/', LoginView.as_view(), name='user_login'),
    path('logout/', LogoutView.as_view(), name='user_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-about/', UpdateAboutView.as_view(), name='update-about'),
    path('members/', MemberListView.as_view(), name='member-list'),
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin/logout/', AdminLogoutView.as_view(), name='admin_logout'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/token/refresh/', AdminTokenRefreshView.as_view(), name='admin_token_refresh'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('admin/forgot-password/', AdminForgotPasswordView.as_view(), name='admin-forgot-password'),
    path('reset-password/<uuid:token>/', ResetPasswordView.as_view(), name='reset-password'),
    
    # Admin Management URLs
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/invite/', SendAdminInviteView.as_view(), name='send-admin-invite'),
    path('admin/invites/', AdminInviteListView.as_view(), name='admin-invites-list'),
    path('admin/signup/', AdminSignUpWithInviteView.as_view(), name='admin-signup-with-invite'),
    path('admin/users/<int:admin_id>/remove/', RemoveAdminView.as_view(), name='remove-admin'),
    path('admin/users/<int:user_id>/assign-admin/', AssignAdminRoleView.as_view(), name='assign-admin-role'),
    path('admin/send-email/', SendEmailToUserView.as_view(), name='send-email-to-user'),
    path('admin/update/<int:user_id>/', UpdateUserStatusView.as_view(), name='update-user-status'),
]
