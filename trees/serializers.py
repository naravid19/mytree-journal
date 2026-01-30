from rest_framework import serializers
from .models import Tree, Strain, Batch, Image, TreeLog

class StrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strain
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'tree', 'log', 'image', 'thumbnail', 'uploaded_at']
        read_only_fields = ['thumbnail', 'uploaded_at']

class TreeLogSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = TreeLog
        fields = [
            'id', 'tree', 'action_date', 'action_type', 'title', 'notes',
            'ph', 'ec', 'temp', 'humidity',
            'wet_weight', 'dry_weight',
            'created_at', 'images'
        ]

class TreeSerializer(serializers.ModelSerializer):
    strain = StrainSerializer(read_only=True)
    strain_id = serializers.PrimaryKeyRelatedField(
        queryset=Strain.objects.all(), source='strain', write_only=True
    )
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(), source='batch', write_only=True, required=False, allow_null=True
    )
    images = ImageSerializer(source='images_set', many=True, read_only=True)
    latest_log = serializers.SerializerMethodField()

    class Meta:
        model = Tree
        fields = '__all__'
        extra_kwargs = {
            'images': {'required': False}
        }

    def get_latest_log(self, obj):
        latest = obj.logs.first() # logs is related_name from TreeLog
        if latest:
            return TreeLogSerializer(latest).data
        return None
