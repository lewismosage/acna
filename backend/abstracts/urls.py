from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AbstractViewSet, ImportantDatesViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'abstracts', AbstractViewSet, basename='abstract')
router.register(r'important-dates', ImportantDatesViewSet, basename='important-dates')

urlpatterns = [
    path('', include(router.urls)),
]