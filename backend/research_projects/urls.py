from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResearchProjectViewSet

router = DefaultRouter()
router.register(r'research-projects', ResearchProjectViewSet, basename='research-project')

urlpatterns = [
    path('', include(router.urls)),
]