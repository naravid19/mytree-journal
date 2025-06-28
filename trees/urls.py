from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TreeViewSet, ImageViewSet, StrainViewSet, BatchViewSet

router = DefaultRouter()
router.register(r'trees', TreeViewSet)
router.register(r'images', ImageViewSet)
router.register(r'strains', StrainViewSet)
router.register(r'batches', BatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
