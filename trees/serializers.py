from rest_framework import serializers
from .models import Tree, Image

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'uploaded_at']

class TreeSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Tree
        fields = [
            'id', 'species', 'variety', 'nickname', 'plant_date',
            'location', 'main_characteristics', 'notes', 'harvest_date',
            'status', 'created_at', 'updated_at', 'images', 'image'
        ]

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        tree = Tree.objects.create(**validated_data)
        if image:
            Image.objects.create(tree=tree, image=image)
        return tree

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if images is not None:
            instance.images.set(images)
        instance.save()
        return instance
