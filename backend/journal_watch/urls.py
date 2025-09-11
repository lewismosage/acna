from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JournalArticleViewSet

router = DefaultRouter()
router.register(r'journal-articles', JournalArticleViewSet, basename='journalarticle')

urlpatterns = [
    path('', include(router.urls)),
]