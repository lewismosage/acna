from django.urls import path
from .views import SubscribeToNewsletter, UnsubscribeFromNewsletter, SendNewsletter, SubscriberListView

urlpatterns = [
    path('subscribe/', SubscribeToNewsletter.as_view(), name='subscribe'),
    path('unsubscribe/', UnsubscribeFromNewsletter.as_view(), name='unsubscribe'),
    path('send-newsletter/', SendNewsletter.as_view(), name='send-newsletter'),
    path('subscribers/', SubscriberListView.as_view(), name='subscriber-list'),
]