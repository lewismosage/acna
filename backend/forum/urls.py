from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ForumCategoryViewSet, ForumThreadViewSet, ForumPostViewSet,
    ForumAnalyticsViewSet, ForumSearchViewSet
)

router = DefaultRouter()
router.register(r'categories', ForumCategoryViewSet, basename='forum-category')
router.register(r'threads', ForumThreadViewSet, basename='forum-thread')
router.register(r'posts', ForumPostViewSet, basename='forum-post')
router.register(r'analytics', ForumAnalyticsViewSet, basename='forum-analytics')
router.register(r'search', ForumSearchViewSet, basename='forum-search')

app_name = 'forum'

urlpatterns = [
    path('', include(router.urls)),
    # Custom API endpoints can be added here if needed
]