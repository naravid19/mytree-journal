from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Tree, Image
from .serializers import TreeSerializer, ImageSerializer

class TreeViewSet(viewsets.ModelViewSet):
    queryset = Tree.objects.all().order_by('-created_at')
    serializer_class = TreeSerializer

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
