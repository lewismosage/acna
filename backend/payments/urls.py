from django.urls import path
from .views import CreateCheckoutSession, PaymentWebhook
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSession.as_view(), name='create-checkout-session'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('webhook/', PaymentWebhook.as_view(), name='payment_webhook'),
]