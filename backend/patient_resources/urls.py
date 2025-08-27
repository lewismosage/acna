from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientResourceViewSet

router = DefaultRouter()
router.register(r'patient-resources', PatientResourceViewSet, basename='patient-resource')

urlpatterns = [
    path('', include(router.urls)),
]