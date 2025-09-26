from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConferenceViewSet, 
    ConferencePaymentView, 
    ConferencePaymentWebhook, 
    ConferencePaymentVerify
)

router = DefaultRouter()
router.register(r'conferences', ConferenceViewSet, basename='conference')

urlpatterns = [
    path('', include(router.urls)),

    # Additional endpoints
    path('conferences/<int:pk>/update_status/', 
         ConferenceViewSet.as_view({'patch': 'update_status'}), 
         name='conference-update-status'),
    path('conferences/analytics/', 
         ConferenceViewSet.as_view({'get': 'analytics'}), 
         name='conference-analytics'),
    path('conferences/<int:pk>/add_registration/', 
         ConferenceViewSet.as_view({'post': 'add_registration'}), 
         name='conference-add-registration'),
    path('conferences/<int:pk>/upload_image/', 
         ConferenceViewSet.as_view({'post': 'upload_image'}), 
         name='conference-upload-image'),
    
    # Conference Payment endpoints
    path('conferences/payment/create-checkout-session/', 
         ConferencePaymentView.as_view(), 
         name='conference-payment-checkout'),
    path('conferences/payment/webhook/', 
         ConferencePaymentWebhook.as_view(), 
         name='conference-payment-webhook'),
    path('conferences/payment/verify/', 
         ConferencePaymentVerify.as_view(), 
         name='conference-payment-verify'),
]