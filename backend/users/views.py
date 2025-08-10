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