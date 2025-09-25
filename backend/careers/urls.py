# careers/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobOpportunityViewSet, JobApplicationViewSet, VolunteerSubmissionViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'job-opportunities', JobOpportunityViewSet, basename='job-opportunity')
router.register(r'job-applications', JobApplicationViewSet, basename='job-application')
router.register(r'volunteer-submissions', VolunteerSubmissionViewSet, basename='volunteer-submission')

urlpatterns = [
    path('', include(router.urls)), 
]