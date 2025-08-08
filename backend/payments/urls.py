from django.urls import path
from .views import CreatePaymentIntent, PaymentWebhook
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('create-intent/', CreatePaymentIntent.as_view(), name='create_payment_intent'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('webhook/', PaymentWebhook.as_view(), name='payment_webhook'),
]