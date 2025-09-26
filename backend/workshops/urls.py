# workshops/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkshopViewSet, CollaborationViewSet, WorkshopRegistrationViewSet,
    WorkshopPaymentView, WorkshopPaymentWebhook, WorkshopPaymentVerify,
    WorkshopInvoiceDownload
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'workshops', WorkshopViewSet, basename='workshop')
router.register(r'collaborations', CollaborationViewSet, basename='collaboration')
router.register(r'workshop-registrations', WorkshopRegistrationViewSet, basename='workshop-registration')

urlpatterns = [
    path('', include(router.urls)),
    
    # Workshop Payment endpoints
    path('workshops/payment/create-checkout-session/', 
         WorkshopPaymentView.as_view(), 
         name='workshop-payment-checkout'),
    path('workshops/payment/webhook/', 
         WorkshopPaymentWebhook.as_view(), 
         name='workshop-payment-webhook'),
    path('workshops/payment/verify/', 
         WorkshopPaymentVerify.as_view(), 
         name='workshop-payment-verify'),
    path('workshops/payment/invoice/', 
         WorkshopInvoiceDownload.as_view(), 
         name='workshop-payment-invoice'),
]