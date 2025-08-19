# webinars/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WebinarViewSet, RegistrationViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'webinars', WebinarViewSet, basename='webinar')
router.register(r'registrations', RegistrationViewSet, basename='registration')

# Custom URL patterns for specific endpoints
urlpatterns = [
    # Include router URLs (this gives us /api/webinars/ and /api/registrations/)
    path('', include(router.urls)),
    
    # Additional custom endpoints if needed can be added here
    # For example:
    # path('webinars/<int:webinar_id>/custom-action/', views.custom_action, name='custom-action'),
]

# The router will automatically create these URLs:
# GET    /api/webinars/                           - List all webinars
# POST   /api/webinars/                           - Create webinar
# GET    /api/webinars/{id}/                      - Get webinar by ID
# PUT    /api/webinars/{id}/                      - Update webinar (full)
# PATCH  /api/webinars/{id}/                      - Update webinar (partial)
# DELETE /api/webinars/{id}/                      - Delete webinar

# GET    /api/webinars/featured/                  - Get featured webinars (custom action)
# GET    /api/webinars/upcoming/                  - Get upcoming webinars (custom action)
# GET    /api/webinars/analytics/                 - Get analytics (custom action)
# POST   /api/webinars/upload_image/              - Upload image (custom action)
# POST   /api/webinars/upload_speaker_image/      - Upload speaker image (custom action)
# POST   /api/webinars/{id}/toggle_featured/      - Toggle featured status (custom action)
# PATCH  /api/webinars/{id}/update_status/        - Update status (custom action)
# GET    /api/webinars/{id}/registrations/        - Get webinar registrations (custom action)
# POST   /api/webinars/{id}/email_registrants/    - Email registrants (custom action)
# POST   /api/webinars/{id}/upload_recording/     - Upload recording (custom action)
# POST   /api/webinars/{id}/upload_slides/        - Upload slides (custom action)

# GET    /api/registrations/                      - List all registrations
# POST   /api/registrations/                      - Create registration
# GET    /api/registrations/{id}/                 - Get registration by ID
# PUT    /api/registrations/{id}/                 - Update registration (full)
# PATCH  /api/registrations/{id}/                 - Update registration (partial)
# DELETE /api/registrations/{id}/                 - Delete registration
# POST   /api/registrations/{id}/send_confirmation/ - Send confirmation (custom action)
# PATCH  /api/registrations/{id}/update_payment_status/ - Update payment status (custom action)