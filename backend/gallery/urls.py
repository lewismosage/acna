from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'gallery-items', views.GalleryItemViewSet, basename='galleryitem')
router.register(r'stories', views.StoryViewSet, basename='story')
router.register(r'stats', views.GalleryStatsViewSet, basename='gallerystats')

app_name = 'gallery'

urlpatterns = [
    # API routes
    path('api/', include(router.urls)),
    
    # Additional custom endpoints can be added here if needed
    # path('api/gallery-items/export/', views.export_gallery_items, name='export-gallery-items'),
    # path('api/stories/export/', views.export_stories, name='export-stories'),
]

# The router automatically creates the following URLs:
# 
# Gallery Items:
# GET    /api/gallery-items/                    - List all gallery items
# POST   /api/gallery-items/                    - Create new gallery item
# GET    /api/gallery-items/{id}/               - Retrieve specific gallery item
# PUT    /api/gallery-items/{id}/               - Update gallery item
# PATCH  /api/gallery-items/{id}/               - Partial update gallery item
# DELETE /api/gallery-items/{id}/               - Delete gallery item
# 
# Custom Gallery Item Actions:
# GET    /api/gallery-items/featured/           - Get featured gallery items
# GET    /api/gallery-items/by_category/        - Get items grouped by category
# GET    /api/gallery-items/stats/              - Get gallery items statistics
# PATCH  /api/gallery-items/{id}/update_status/ - Update status of gallery item
# PATCH  /api/gallery-items/{id}/toggle_featured/ - Toggle featured status
# POST   /api/gallery-items/bulk_action/        - Perform bulk actions
# 
# Stories:
# GET    /api/stories/                          - List all stories
# POST   /api/stories/                          - Create new story
# GET    /api/stories/{id}/                     - Retrieve specific story
# PUT    /api/stories/{id}/                     - Update story
# PATCH  /api/stories/{id}/                     - Partial update story
# DELETE /api/stories/{id}/                     - Delete story
# 
# Custom Story Actions:
# GET    /api/stories/featured/                 - Get featured stories
# GET    /api/stories/by_condition/             - Get stories grouped by condition
# GET    /api/stories/stats/                    - Get stories statistics
# PATCH  /api/stories/{id}/update_status/       - Update status of story
# PATCH  /api/stories/{id}/toggle_featured/     - Toggle featured status
# POST   /api/stories/bulk_action/              - Perform bulk actions on stories
# 
# Statistics:
# GET    /api/stats/                            - List gallery statistics
# POST   /api/stats/refresh/                    - Refresh statistics