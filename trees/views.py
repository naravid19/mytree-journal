from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tree, Image, Strain, Batch, TreeLog
from .serializers import TreeSerializer, ImageSerializer, StrainSerializer, BatchSerializer, TreeLogSerializer

class TreeViewSet(viewsets.ModelViewSet):
    queryset = Tree.objects.all().select_related(
        'strain', 'batch', 'parent_male', 'parent_female', 'clone_source', 'pollinated_by'
    ).prefetch_related('images', 'images_set').order_by('-created_at')
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
        except OSError as e:
            return Response({'error': f'เกิดข้อผิดพลาดในการลบไฟล์: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'เกิดข้อผิดพลาดที่ไม่คาดคิด: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post', 'delete'])
    def delete_all_images(self, request, pk=None):
        """ลบรูปภาพทั้งหมดของต้นไม้นี้"""
        try:
            tree = self.get_object()
            
            # Delete images linked via ForeignKey
            tree.images_set.all().delete()
            
            # Delete images linked via ManyToMany (if they are not already deleted)
            # We iterate and delete to ensure file cleanup
            for img in tree.images.all():
                img.delete()  
            
            return Response({'message': 'ลบรูปภาพทั้งหมดสำเร็จ'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'เกิดข้อผิดพลาด: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """ลบต้นไม้หลายรายการพร้อมกัน"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # ใช้ loop delete เพื่อให้ logic การลบไฟล์ (override delete method) ทำงาน
            trees = Tree.objects.filter(id__in=ids)
            count = trees.count()
            for tree in trees:
                tree.delete()
            
            return Response({'message': f'ลบข้อมูลสำเร็จ {count} รายการ'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'เกิดข้อผิดพลาด: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

class StrainViewSet(viewsets.ModelViewSet):
    queryset = Strain.objects.all().order_by('name')
    serializer_class = StrainSerializer

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().order_by('-started_date')
    serializer_class = BatchSerializer

class TreeLogViewSet(viewsets.ModelViewSet):
    """API for Journal/Timeline entries"""
    queryset = TreeLog.objects.all().order_by('-action_date', '-created_at')
    serializer_class = TreeLogSerializer
    filterset_fields = ['tree', 'action_type']
