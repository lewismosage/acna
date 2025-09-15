from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingProgramViewSet, RegistrationViewSet

router = DefaultRouter()
router.register(r'training-programs', TrainingProgramViewSet, basename='trainingprogram')
router.register(r'training-program-registrations', RegistrationViewSet, basename='training-program-registration')

urlpatterns = [
    path('', include(router.urls)),
    path('training-programs/<int:program_id>/registrations/', 
         RegistrationViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='training-program-registrations'),
]