from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResearchProjectViewSet, ResearchPaperViewSet

router = DefaultRouter()
router.register(r'research-projects', ResearchProjectViewSet, basename='research-project')
router.register(r'research-papers', ResearchPaperViewSet, basename='research-paper')

urlpatterns = [
    path('', include(router.urls)),
]