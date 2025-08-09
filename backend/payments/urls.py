from django.urls import path
from .views import (
    CreateCheckoutSession,
    PaymentWebhook,
    VerifyPayment,
    DownloadInvoice
)
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSession.as_view(), name='create-checkout-session'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('webhook/', PaymentWebhook.as_view(), name='payment_webhook'),
    path('verify-payment/', VerifyPayment.as_view()),
    path('download-invoice/', DownloadInvoice.as_view()),
]