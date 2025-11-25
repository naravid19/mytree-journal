from rest_framework import serializers
from .models import Tree, Image, Strain, Batch, SEX_CHOICES

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'thumbnail', 'uploaded_at']

class StrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strain
        fields = ['id', 'name', 'description']

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'batch_code', 'description', 'started_date']

class TreeSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    strain = StrainSerializer(read_only=True)
    strain_id = serializers.PrimaryKeyRelatedField(
        queryset=Strain.objects.all(),
        source='strain',
        write_only=True,
        required=True,
        allow_null=False
    )
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(),
        source='batch',
        write_only=True,
        required=False,
        allow_null=True
    )
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    sex = serializers.ChoiceField(choices=SEX_CHOICES, default="unknown")
    parent_male_data = serializers.SerializerMethodField()
    parent_female_data = serializers.SerializerMethodField()

    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
    IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    DOCUMENT_TYPES = ["application/pdf", *IMAGE_TYPES]

    class Meta:
        model = Tree
        fields = [
            'id', 'nickname', 'strain', 'strain_id', 'variety', 'batch', 'batch_id', 'location', 'status',
            'created_at', 'updated_at', 'germination_date', 'plant_date', 'growth_stage',
            'harvest_date', 'sex', 'genotype', 'phenotype', 'parent_male', 'parent_female',
            'parent_male_data', 'parent_female_data',
            'clone_source', 'pollination_date', 'pollinated_by', 'yield_amount',
            'flower_quality', 'seed_count', 'seed_harvest_date', 'disease_notes',
            'document', 'images', 'notes', 'uploaded_images', 'generation'
        ]

    def get_parent_male_data(self, obj):
        if obj.parent_male:
            return {'id': obj.parent_male.id, 'nickname': obj.parent_male.nickname}
        return None

    def get_parent_female_data(self, obj):
        if obj.parent_female:
            return {'id': obj.parent_female.id, 'nickname': obj.parent_female.nickname}
        return None

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        tree = Tree.objects.create(**validated_data)
        for img_file in uploaded_images:
            img_obj = Image.objects.create(image=img_file, tree=tree)
            tree.images.add(img_obj)
        return tree

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        # อัปเดตข้อมูลต้นไม้
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # เพิ่มรูปภาพใหม่
        for img_file in uploaded_images:
            img_obj = Image.objects.create(image=img_file, tree=instance)
            instance.images.add(img_obj)
        
        return instance

    def validate_document(self, value):
        if value:
            if value.size > self.MAX_FILE_SIZE:
                raise serializers.ValidationError("ขนาดเอกสารต้องไม่เกิน 20MB")
            if value.content_type not in self.DOCUMENT_TYPES:
                raise serializers.ValidationError("รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP")
        return value

    def validate_uploaded_images(self, value):
        for img in value:
            if img.size > self.MAX_FILE_SIZE:
                raise serializers.ValidationError("ขนาดไฟล์ภาพต้องไม่เกิน 20MB")
            if img.content_type not in self.IMAGE_TYPES:
                raise serializers.ValidationError("รองรับเฉพาะไฟล์ภาพ JPG, PNG หรือ WEBP")
        return value
