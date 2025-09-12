from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'content', ContentViewSet, basename='content')

urlpatterns = [
    path('', include(router.urls)),
]

# The router will automatically create these URL patterns:
# GET /api/content/ - List all content (with filtering)
# POST /api/content/ - Create new content
# GET /api/content/{id}/ - Retrieve specific content
# PUT /api/content/{id}/ - Update content (full)
# PATCH /api/content/{id}/ - Update content (partial)
# DELETE /api/content/{id}/ - Delete content
# PATCH /api/content/{id}/status/ - Update content status
# POST /api/content/{id}/increment_download/ - Track download
# POST /api/content/{id}/increment_view/ - Track view
# GET /api/content/analytics/ - Get analytics
# GET /api/content/categories/ - Get all categories