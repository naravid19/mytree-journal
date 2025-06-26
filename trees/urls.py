from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TreeViewSet, ImageViewSet

router = DefaultRouter()
router.register(r'trees', TreeViewSet)
router.register(r'images', ImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
