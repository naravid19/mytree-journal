from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tree, Image, Strain, Batch
from .serializers import TreeSerializer, ImageSerializer, StrainSerializer, BatchSerializer

class TreeViewSet(viewsets.ModelViewSet):
    queryset = Tree.objects.all().select_related(
        'strain', 'batch', 'parent_male', 'parent_female', 'clone_source', 'pollinated_by'
    ).prefetch_related('images').order_by('-created_at')
    serializer_class = TreeSerializer

    @action(detail=True, methods=['delete'])
    def delete_document(self, request, pk=None):
        """ลบเอกสารของต้นไม้"""
        try:
            tree = self.get_object()
            if tree.document:
                # ลบไฟล์เอกสาร
                if tree.document.storage.exists(tree.document.name):
                    tree.document.storage.delete(tree.document.name)
                # ล้างฟิลด์ document
                tree.document = None
                tree.save()
                return Response({'message': 'ลบเอกสารสำเร็จ'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'ไม่มีเอกสารให้ลบ'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

class StrainViewSet(viewsets.ModelViewSet):
    queryset = Strain.objects.all().order_by('name')
    serializer_class = StrainSerializer

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().order_by('-started_date')
    serializer_class = BatchSerializer
