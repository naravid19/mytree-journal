from rest_framework import serializers
from .models import Tree, Image

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'uploaded_at']

class TreeSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Tree
        fields = [
            'id', 'species', 'variety', 'nickname', 'plant_date',
            'location', 'main_characteristics', 'notes', 'harvest_date',
            'status', 'created_at', 'updated_at', 'images', 'uploaded_images'
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        tree = Tree.objects.create(**validated_data)
        for img_file in uploaded_images:
            img_obj = Image.objects.create(image=img_file)
            tree.images.add(img_obj)
        return tree