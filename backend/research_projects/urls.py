from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResearchProjectViewSet, ResearchPaperViewSet

router = DefaultRouter()
router.register(r'research-projects', ResearchProjectViewSet, basename='research-project')
router.register(r'research-papers', ResearchPaperViewSet, basename='research-paper')

# Custom URL patterns for explicit routing of analytics endpoints
urlpatterns = [
    # Explicit analytics endpoints that should come before the router
    path('research-projects/analytics/', 
         ResearchProjectViewSet.as_view({'get': 'analytics'}), 
         name='research-project-analytics'),
    path('research-papers/analytics/', 
         ResearchPaperViewSet.as_view({'get': 'analytics'}), 
         name='research-paper-analytics'),
    
    # Other explicit endpoints that might conflict
    path('research-projects/active/', 
         ResearchProjectViewSet.as_view({'get': 'active'}), 
         name='research-project-active'),
    path('research-projects/by_status/', 
         ResearchProjectViewSet.as_view({'get': 'by_status'}), 
         name='research-project-by-status'),
    path('research-projects/upload_image/', 
         ResearchProjectViewSet.as_view({'post': 'upload_image'}), 
         name='research-project-upload-image'),
    path('research-projects/investigators/', 
         ResearchProjectViewSet.as_view({'get': 'investigators'}), 
         name='research-project-investigators'),
    path('research-projects/institutions/', 
         ResearchProjectViewSet.as_view({'get': 'institutions'}), 
         name='research-project-institutions'),
    path('research-projects/types/', 
         ResearchProjectViewSet.as_view({'get': 'types'}), 
         name='research-project-types'),
    path('research-projects/statuses/', 
         ResearchProjectViewSet.as_view({'get': 'statuses'}), 
         name='research-project-statuses'),
         
    # Research paper endpoints
    path('research-papers/categories/', 
         ResearchPaperViewSet.as_view({'get': 'categories'}), 
         name='research-paper-categories'),
    path('research-papers/research_types/', 
         ResearchPaperViewSet.as_view({'get': 'research_types'}), 
         name='research-paper-research-types'),
    path('research-papers/study_designs/', 
         ResearchPaperViewSet.as_view({'get': 'study_designs'}), 
         name='research-paper-study-designs'),
    
    # Include all other router URLs
    path('', include(router.urls)),
]