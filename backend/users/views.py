from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import VerificationCode, AdminInvite
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserRegistrationSerializer,
    VerificationSerializer,
    ResendVerificationSerializer,
    AdminUserSerializer,
    AdminInviteSerializer,
    SendAdminInviteSerializer,
    AdminSignUpSerializer
)
from .utils import send_verification_email
import logging
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import UpdateAPIView
from .serializers import UserProfileSerializer
from .serializers import UserProfileSerializer, ChangePasswordSerializer
from rest_framework import generics
from .models import User
from .serializers import MemberSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import PasswordResetToken


logger = logging.getLogger(__name__)
User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate and send verification code
            code = VerificationCode.generate_code()
            VerificationCode.objects.create(user=user, code=code)

            try:
                send_verification_email(user.email, code)
                return Response({
                    'success': True,
                    'message': 'User registered successfully. Please check your email for verification code.',
                    'email': user.email
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Failed to send verification email: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'User registered but failed to send verification email.'
                }, status=status.HTTP_201_CREATED)

        # Errors more clearly
        errors = {}
        for field, error_list in serializer.errors.items():
            if isinstance(error_list, list):
                errors[field] = error_list[0] if error_list else "Invalid value"
            else:
                errors[field] = str(error_list)

        return Response({
            'success': False,
            'errors': errors,
            'message': 'Registration failed. Please correct the errors below.'
        }, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            
            try:
                user = User.objects.get(email=email)
                verification_code = VerificationCode.objects.filter(
                    user=user,
                    code=code,
                    is_used=False
                ).latest('created_at')
                
                if verification_code:
                    user.is_verified = True
                    user.save()
                    verification_code.is_used = True
                    verification_code.save()
                    
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'success': True,
                        'token': str(refresh.access_token),
                        'refresh': str(refresh),
                        'user_id': user.id,  # ADD THIS LINE
                        'message': 'Email verified successfully.'
                    }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User with this email does not exist.'
                }, status=status.HTTP_404_NOT_FOUND)
            except VerificationCode.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Invalid verification code.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                if user.is_verified:
                    return Response({
                        'success': False,
                        'message': 'Email is already verified.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Generate and send new verification code
                code = VerificationCode.generate_code()
                VerificationCode.objects.create(user=user, code=code)
                
                try:
                    send_verification_email(user.email, code)
                    return Response({
                        'success': True,
                        'message': 'New verification code sent successfully.'
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    logger.error(f"Failed to resend verification email: {str(e)}")
                    return Response({
                        'success': False,
                        'message': 'Failed to resend verification email.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User with this email does not exist.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'detail': 'Email and password are required.',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)

        # If you store username == email (frontend sets username=email when registering), this works:
        user = authenticate(username=email, password=password)

        # Otherwise, fall back to email lookup:
        if user is None:
            # Try authenticate by finding user by email and checking password manually
            try:
                u = User.objects.get(email__iexact=email)
                if u.check_password(password):
                    user = u
                else:
                    # Password is wrong
                    return Response({
                        'detail': 'Invalid email or password.',
                        'success': False,
                        'error_code': 'invalid_credentials'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                # Email doesn't exist
                return Response({
                    'detail': 'Invalid email or password.',
                    'success': False,
                    'error_code': 'invalid_credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

        if user is None:
            # Wrong credentials (fallback)
            return Response({
                'detail': 'Invalid email or password.',
                'success': False,
                'error_code': 'invalid_credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check if user account is active
        if not user.is_active:
            return Response({
                'detail': 'Your account has been deactivated. Please contact support.',
                'success': False,
                'error_code': 'account_deactivated'
            }, status=status.HTTP_403_FORBIDDEN)

        # Membership active check
        today = timezone.now().date()
        if not user.is_active_member or not user.membership_valid_until or user.membership_valid_until < today:
            return Response({
                'detail': 'Your membership is inactive. Please make a payment to continue to access membership benefits, or contact support.',
                'success': False,
                'error_code': 'membership_inactive'
            }, status=status.HTTP_403_FORBIDDEN)

        # OK -> issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.get_full_name(),
                'is_active_member': user.is_active_member,
                'membership_id': user.membership_id,
                'membership_class': user.membership_class,
                'membership_valid_until': user.membership_valid_until,
                'institution': user.institution,
                'member_since': user.date_joined.strftime('%B %Y'),
                'specialization': user.specialization,
                'profile_photo': request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None,
            }
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                {"detail": "Successfully logged out."}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        profile_photo = self.request.FILES.get('profile_photo')
        
        if profile_photo:
            # Delete old profile photo if exists
            if self.request.user.profile_photo:
                self.request.user.profile_photo.delete(save=False)
            serializer.save(profile_photo=profile_photo)
        else:
            serializer.save()

    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        user = request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get(self, request, *args, **kwargs):
        user = request.user
        profile_photo_url = None

        if user.profile_photo:
            profile_photo_url = request.build_absolute_uri(user.profile_photo.url)

        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
            'institution': user.institution,
            'profile_photo': user.profile_photo.url if user.profile_photo else None,
            'membership_id': user.membership_id,
            'membership_class': user.membership_class,
            'membership_status': 'Active' if user.is_membership_active else 'Inactive',
            'member_since': user.date_joined.strftime('%B %Y'),
            'specialization': user.specialization,
            'profile_photo': profile_photo_url,
        }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['current_password']):
                return Response(
                    {"current_password": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateAboutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        about_text = request.data.get('about_text', '')
        return Response({
            "message": "About text updated successfully",
            "about_text": about_text
        }, status=status.HTTP_200_OK)

class MemberListView(generics.ListAPIView):
    serializer_class = MemberSerializer
    queryset = User.objects.filter(is_active=True)
    
    def get_queryset(self):
        return super().get_queryset()

class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'success': False,
                'detail': 'Email and password are required.',
                'error_code': 'missing_fields'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=email, password=password)
        if user is None:
            try:
                u = User.objects.get(email__iexact=email)
                if u.check_password(password):
                    user = u
            except User.DoesNotExist:
                pass
        
        if user is None:
            return Response({
                'success': False,
                'detail': 'Invalid email or password.',
                'error_code': 'invalid_credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_admin:
            return Response({
                'success': False,
                'detail': 'You do not have admin privileges.',
                'error_code': 'insufficient_privileges'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user account is active
        if not user.is_active:
            return Response({
                'success': False,
                'detail': 'Your admin account has been deactivated. Please contact support.',
                'error_code': 'account_deactivated'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # SUCCESS - Generate JWT tokens and return admin data
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'admin': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin,
                'full_name': user.get_full_name(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            }
        }, status=status.HTTP_200_OK)

class AdminLogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)

class AdminDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Implement your dashboard data here
        data = {
            "message": "Welcome to the Admin Dashboard",
            "stats": {
                "total_members": User.objects.count(),
                "active_members": User.objects.filter(is_active_member=True).count(),
                "pending_approvals": 8,
                "recent_activity": []
            }
        }
        return Response(data, status=status.HTTP_200_OK)

class AdminTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            return Response({'access': access_token}, status=200)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=401)

class UpdateUserRolesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            roles = request.data.get('roles', [])
            user.roles = roles
            user.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UpdateUserStatusView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Update user fields based on request data
            if 'is_active' in request.data:
                user.is_active = request.data['is_active']
            if 'is_active_member' in request.data:
                user.is_active_member = request.data['is_active_member']
            if 'roles' in request.data:
                user.roles = request.data['roles']
                
            user.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


def send_password_reset_email(user, reset_token, is_admin=False):
    """Send password reset email to user"""
    subject = f"Reset Your {'Admin' if is_admin else 'ACNA'} Password"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [user.email]
    
    # Create reset URL
    frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
    reset_url = f"{frontend_url}/{'admin/' if is_admin else ''}reset-password/{reset_token.token}"
    
    try:
        context = {
            'user': user,
            'reset_url': reset_url,
            'company_name': getattr(settings, 'COMPANY_NAME', 'ACNA'),
            'is_admin': is_admin,
            'expires_in': '1 hour'
        }
        
        html_content = render_to_string("users/emails/password_reset_email.html", context)
        text_content = f"""
Hello {user.get_full_name() or user.email},

You requested a password reset for your {'admin' if is_admin else 'ACNA'} account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
{context['company_name']} Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return True
    except Exception as e:
        logger.error(f"Error sending password reset email to {user.email}: {str(e)}")
        return False

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'success': False,
                'message': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email__iexact=email)
            
            # Invalidate any existing tokens for this user
            PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
            
            # Create new reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # Send reset email
            email_sent = send_password_reset_email(user, reset_token)
            
            if email_sent:
                return Response({
                    'success': True,
                    'message': 'Password reset instructions have been sent to your email.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send reset email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'success': True,
                'message': 'If an account with that email exists, password reset instructions have been sent.'
            }, status=status.HTTP_200_OK)

class AdminForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'success': False,
                'message': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email__iexact=email, is_admin=True)
            
            # Invalidate any existing tokens for this user
            PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
            
            # Create new reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # Send reset email
            email_sent = send_password_reset_email(user, reset_token, is_admin=True)
            
            if email_sent:
                return Response({
                    'success': True,
                    'message': 'Admin password reset instructions have been sent to your email.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send reset email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            # Don't reveal if admin email exists or not for security
            return Response({
                'success': True,
                'message': 'If an admin account with that email exists, password reset instructions have been sent.'
            }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, token):
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not new_password or not confirm_password:
            return Response({
                'success': False,
                'message': 'Both password fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                'success': False,
                'message': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({
                'success': False,
                'message': 'Password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if not reset_token.is_valid:
                return Response({
                    'success': False,
                    'message': 'This password reset link has expired or been used. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            return Response({
                'success': True,
                'message': 'Password has been reset successfully. You can now log in with your new password.'
            }, status=status.HTTP_200_OK)
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid password reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

# Admin Management Views
class AdminUserListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get all admin users"""
        admin_users = User.objects.filter(is_admin=True).order_by('-date_joined')
        serializer = AdminUserSerializer(admin_users, many=True)
        return Response({
            'success': True,
            'admins': serializer.data
        }, status=status.HTTP_200_OK)

class SendAdminInviteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Send admin invitation email"""
        serializer = SendAdminInviteSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Create admin invite
            invite = AdminInvite.objects.create(
                email=email,
                invited_by=request.user
            )
            
            # Send invitation email
            try:
                send_admin_invite_email(invite)
                return Response({
                    'success': True,
                    'message': f'Admin invitation sent to {email}'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Failed to send admin invite email: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'Failed to send invitation email. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AdminInviteListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get all admin invitations"""
        invites = AdminInvite.objects.all().order_by('-created_at')
        serializer = AdminInviteSerializer(invites, many=True)
        return Response({
            'success': True,
            'invites': serializer.data
        }, status=status.HTTP_200_OK)

class AdminSignUpWithInviteView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Admin signup with invitation token"""
        serializer = AdminSignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Admin account created successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'admin': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_admin': user.is_admin,
                    'full_name': user.get_full_name(),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class RemoveAdminView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, admin_id):
        """Remove admin privileges from a user"""
        try:
            admin_user = User.objects.get(id=admin_id, is_admin=True)
            
            # Prevent removing yourself
            if admin_user.id == request.user.id:
                return Response({
                    'success': False,
                    'message': 'You cannot remove your own admin privileges'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Remove admin privileges
            admin_user.is_admin = False
            admin_user.save()
            
            return Response({
                'success': True,
                'message': f'Admin privileges removed from {admin_user.get_full_name()}'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Admin user not found'
            }, status=status.HTTP_404_NOT_FOUND)

class AssignAdminRoleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        """Assign admin role to an existing user"""
        try:
            user = User.objects.get(id=user_id)
            
            # Check if user is already an admin
            if user.is_admin:
                return Response({
                    'success': False,
                    'message': 'User is already an admin'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Assign admin privileges
            user.is_admin = True
            user.save()
            
            return Response({
                'success': True,
                'message': f'Admin privileges granted to {user.get_full_name()}',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_admin': user.is_admin,
                    'full_name': user.get_full_name(),
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class SendEmailToUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Send email to a user"""
        user_id = request.data.get('user_id')
        subject = request.data.get('subject')
        message = request.data.get('message')
        
        if not all([user_id, subject, message]):
            return Response({
                'success': False,
                'message': 'User ID, subject, and message are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            
            # Send email
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [user.email]
            
            try:
                context = {
                    'user': user,
                    'message': message,
                    'company_name': getattr(settings, 'COMPANY_NAME', 'ACNA'),
                    'admin_name': request.user.get_full_name()
                }
                
                html_content = render_to_string("users/emails/admin_message_email.html", context)
                text_content = f"""
Hello {user.get_full_name() or user.email},

{message}

Best regards,
{context['admin_name']}
{context['company_name']} Team
                """
                
                msg = EmailMultiAlternatives(subject, text_content, from_email, to)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                
                return Response({
                    'success': True,
                    'message': f'Email sent successfully to {user.email}'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Error sending email to {user.email}: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'Failed to send email. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

def send_admin_invite_email(invite):
    """Send admin invitation email"""
    subject = "Admin Invitation - ACNA"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [invite.email]
    
    # Create signup URL
    frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
    signup_url = f"{frontend_url}/admin/signup?token={invite.token}"
    
    try:
        context = {
            'invite': invite,
            'signup_url': signup_url,
            'company_name': getattr(settings, 'COMPANY_NAME', 'ACNA'),
            'invited_by': invite.invited_by.get_full_name(),
            'expires_in': '7 days'
        }
        
        html_content = render_to_string("users/emails/admin_invite_email.html", context)
        text_content = f"""
Hello,

You have been invited to become an administrator for {context['company_name']} by {context['invited_by']}.

Click the link below to create your admin account:
{signup_url}

This invitation will expire in 7 days.

If you didn't expect this invitation, please ignore this email.

Best regards,
{context['company_name']} Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return True
    except Exception as e:
        logger.error(f"Error sending admin invite email to {invite.email}: {str(e)}")
        return False