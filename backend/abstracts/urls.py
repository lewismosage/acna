from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AbstractViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'abstracts', AbstractViewSet, basename='abstract')

urlpatterns = [
    path('', include(router.urls)),
]