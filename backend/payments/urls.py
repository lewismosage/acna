from django.urls import path
from .views import (
    CreateCheckoutSession,
    PaymentWebhook,
    VerifyPayment,
    DownloadInvoice,
    MembershipSearchView
)
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    # Payment endpoints (require auth)
    path('create-checkout-session/', CreateCheckoutSession.as_view(), name='create-checkout-session'),
    path('verify-payment/', VerifyPayment.as_view()),
    path('download-invoice/', DownloadInvoice.as_view()),
    path('webhook/', PaymentWebhook.as_view(), name='payment-webhook'),
    
    # Public membership endpoint
    path('membership-search/', MembershipSearchView.as_view(), name='membership-search'),
    
    # Authentication
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]