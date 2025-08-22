# workshops/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkshopViewSet, CollaborationViewSet, WorkshopRegistrationViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'workshops', WorkshopViewSet, basename='workshop')
router.register(r'collaborations', CollaborationViewSet, basename='collaboration')
router.register(r'workshop-registrations', WorkshopRegistrationViewSet, basename='workshop-registration')

urlpatterns = [
    path('', include(router.urls)), 
]