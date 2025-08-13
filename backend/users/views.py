from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import VerificationCode
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserRegistrationSerializer,
    VerificationSerializer,
    ResendVerificationSerializer
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
            return Response({'detail': 'Email and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # If you store username == email (frontend sets username=email when registering), this works:
        user = authenticate(username=email, password=password)

        # Otherwise, fall back to email lookup:
        if user is None:
            # Try authenticate by finding user by email and checking password manually
            from .models import User
            try:
                u = User.objects.get(email__iexact=email)
                if u.check_password(password):
                    user = u
            except User.DoesNotExist:
                user = None

        if user is None:
            # Wrong credentials
            return Response({'detail': 'Invalid email or password.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Membership active check
        today = timezone.now().date()
        if not user.is_active_member or not user.membership_valid_until or user.membership_valid_until < today:
            return Response({
                'detail': 'Your membership is inactive. Please make a payment to continue to access membership benefits or contact support.'
            }, status=status.HTTP_403_FORBIDDEN)

        # OK -> issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
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
                'membership_valid_until': user.membership_valid_until,
                'institution': user.institution,
                'member_since': user.date_joined.strftime('%B %Y'),
                'specialization': user.specialization,
                'profile_photo': request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None,
            }
        }, status=status.HTTP_200_OK)

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
            return Response({'detail': 'Email and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=email, password=password)
        if user is None:
            try:
                u = User.objects.get(email__iexact=email)
                if u.check_password(password):
                    user = u
            except User.DoesNotExist:
                user = None
        
        if user is None:
            return Response({'detail': 'Invalid email or password.'},
                            status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_admin:
            return Response({
                'detail': 'You do not have admin privileges.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'admin': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin
            }
        }, status=status.HTTP_200_OK)

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
    permission_classes = [IsAdminUser]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            status_action = request.data.get('status')
            
            if status_action == 'Active':
                user.is_active_member = True
            elif status_action in ['Suspended', 'Banned']:
                user.is_active_member = False
                
            user.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)