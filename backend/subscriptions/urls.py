from django.urls import path
from .views import ( SubscribeToNewsletter, UnsubscribeFromNewsletter, 
     SendNewsletter, SubscriberListView, ContactMessageCreateView,
     ContactMessageListView, ContactMessageDetailView, MessageResponseView
)

urlpatterns = [
    path('subscribe/', SubscribeToNewsletter.as_view(), name='subscribe'),
    path('unsubscribe/', UnsubscribeFromNewsletter.as_view(), name='unsubscribe'),
    path('send-newsletter/', SendNewsletter.as_view(), name='send-newsletter'),
    path('subscribers/', SubscriberListView.as_view(), name='subscriber-list'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message-create'),
    path('messages/', ContactMessageListView.as_view(), name='message-list'),
    path('messages/<int:pk>/', ContactMessageDetailView.as_view(), name='message-detail'),
    path('messages/<int:message_id>/respond/', MessageResponseView.as_view(), name='message-respond'),
]