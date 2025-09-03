from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EBookletViewSet

router = DefaultRouter()
router.register(r'ebooklets', EBookletViewSet, basename='ebooklet')

urlpatterns = [
    path('', include(router.urls)),
]