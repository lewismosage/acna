from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EducationalResourceViewSet, CaseStudySubmissionViewSet

router = DefaultRouter()
router.register(r'resources', EducationalResourceViewSet, basename='resource')
router.register(r'case-study-submissions', CaseStudySubmissionViewSet, basename='casestudysubmission')

urlpatterns = [
    path('', include(router.urls)),
]