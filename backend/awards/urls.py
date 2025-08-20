from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AwardCategoryViewSet, AwardWinnerViewSet, NomineeViewSet, AwardNominationViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'categories', AwardCategoryViewSet, basename='awardcategory')
router.register(r'winners', AwardWinnerViewSet, basename='awardwinner')
router.register(r'nominees', NomineeViewSet, basename='nominee')
router.register(r'nominations', AwardNominationViewSet, basename='awardnomination')

urlpatterns = [
    path('', include(router.urls)),
]