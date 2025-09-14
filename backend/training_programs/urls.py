from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingProgramViewSet, RegistrationViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'training-programs', TrainingProgramViewSet, basename='trainingprogram')
router.register(r'registrations', RegistrationViewSet, basename='registration')

urlpatterns = [
    path('', include(router.urls)),
]
