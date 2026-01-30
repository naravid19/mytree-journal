from django.db import models
from django.utils import timezone
from PIL import Image as PilImage, ImageOps
from io import BytesIO
from django.core.files.base import ContentFile
import os
import shutil
from django.conf import settings

SEX_CHOICES = [
    ("bisexual", "สมบูรณ์เพศ"),
    ("male", "ตัวผู้"),
    ("female", "ตัวเมีย"),
    ("monoecious", "แยกเพศในต้นเดียวกัน"),
    ("mixed", "ผสมหลายเพศ"),
    ("unknown", "ไม่ระบุ/ไม่แน่ใจ"),
]

LOG_ACTION_CHOICES = [
    ("water", "รดน้ำเปล่า"),
    ("feed", "รดน้ำใส่ปุ๋ย"),
    ("flush", "Flush (ล้างดิน)"),
    ("prune", "Pruning/Defoliation (ตัดแต่ง)"),
    ("train", "LST/HST (ดัดกิ่ง)"),
    ("flip", "Flip to Flower (ทำดอก)"),
    ("harvest", "Harvest (เก็บเกี่ยว)"),
    ("dry", "Start Drying (ตาก)"),
    ("cure", "Start Curing (บ่ม)"),
    ("note", "Note (บันทึกทั่วไป)"),
    ("photo", "Photo Update (อัปเดตรูป)"),
    ("issue", "Issue/Pest (พบปัญหา/แมลง)"),
    ("environment", "Environment (สภาพแวดล้อม)"),
    ("other", "อื่นๆ"),
]

class Strain(models.Model):
    """สายพันธุ์ของต้นไม้"""
    name = models.CharField(
        max_length=100, unique=True,
        help_text="ชื่อสายพันธุ์ของต้นไม้"
    )
    description = models.TextField(
        blank=True, null=True,
        help_text="รายละเอียดเพิ่มเติมของสายพันธุ์"
    )

    def __str__(self):
        return self.name

class Batch(models.Model):
    """ชุดหรือรอบการปลูก/เพาะพันธุ์"""
    batch_code = models.CharField(
        max_length=50, unique=True,
        help_text="รหัสประจำชุดการปลูก/เพาะพันธุ์"
    )
    description = models.TextField(
        blank=True, null=True,
        help_text="รายละเอียดเกี่ยวกับชุดการปลูก"
    )
    started_date = models.DateField(
        blank=True, null=True,
        help_text="วันที่เริ่มต้นชุดการปลูก"
    )

    def __str__(self):
        return self.batch_code

def tree_image_path(instance, filename):
    """Generate dynamic path for tree images based on nickname and ID"""
    if instance.tree:
        nickname = instance.tree.nickname
        # Sanitize nickname
        safe_nickname = "".join([c for c in nickname if c.isalnum() or c in (' ', '_', '-')]).strip()
        # Use ID to ensure uniqueness
        folder_name = f"{safe_nickname}_{instance.tree.id}"
        return f'tree_images/{folder_name}/{filename}'
    return f'tree_images/unassigned/{filename}'

def tree_thumbnail_path(instance, filename):
    """Generate dynamic path for tree thumbnails"""
    if instance.tree:
        nickname = instance.tree.nickname
        safe_nickname = "".join([c for c in nickname if c.isalnum() or c in (' ', '_', '-')]).strip()
        folder_name = f"{safe_nickname}_{instance.tree.id}"
        return f'tree_images/{folder_name}/thumbnails/{filename}'
    return f'tree_images/unassigned/thumbnails/{filename}'

class TreeLog(models.Model):
    """บันทึกเหตุการณ์รายวัน (Journal/Timeline)"""
    tree = models.ForeignKey(
        'Tree', on_delete=models.CASCADE, related_name='logs',
        help_text="ต้นไม้ที่บันทึก"
    )
    action_date = models.DateTimeField(
        default=timezone.now,
        help_text="วัน-เวลาที่เกิดเหตุการณ์"
    )
    action_type = models.CharField(
        max_length=50, choices=LOG_ACTION_CHOICES, default="note",
        help_text="ประเภทของกิจกรรม"
    )
    title = models.CharField(
        max_length=200, blank=True,
        help_text="หัวข้อสั้นๆ (ถ้ามี)"
    )
    notes = models.TextField(
        blank=True,
        help_text="รายละเอียด"
    )
    
    # Environment stats (Optional)
    ph = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="ค่า pH")
    ec = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="ค่า EC (uS/cm หรือ ppm)")
    temp = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="อุณหภูมิ (°C)")
    humidity = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="ความชื้น (%)")
    
    # Harvest stats (Optional)
    wet_weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="น้ำหนักสด (g)")
    dry_weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="น้ำหนักแห้ง (g)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-action_date']

    def __str__(self):
        return f"{self.tree.nickname} - {self.get_action_type_display()} ({self.action_date.strftime('%Y-%m-%d')})"

class Image(models.Model):
    tree = models.ForeignKey(
        'Tree', on_delete=models.CASCADE, related_name='images_set', null=True, blank=True,
        help_text="ต้นไม้ที่เป็นเจ้าของรูปภาพนี้"
    )
    log = models.ForeignKey(
        TreeLog, on_delete=models.SET_NULL, related_name='images', null=True, blank=True,
        help_text="ลิงก์กับบันทึกเหตุการณ์ (ถ้ามี)"
    )
    image = models.ImageField(
        upload_to=tree_image_path,
        help_text="ไฟล์รูปภาพของต้นไม้"
    )
    thumbnail = models.ImageField(
        upload_to=tree_thumbnail_path,
        null=True, blank=True, editable=False,
        help_text="รูปขนาดย่อ (สร้างอัตโนมัติหลังอัปโหลด)"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="วัน-เวลาที่อัปโหลดรูปภาพ"
    )
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image and not self.thumbnail:
            # Check if file exists before trying to open it
            if os.path.exists(self.image.path):
                try:
                    self.make_thumbnail()
                except Exception as e:
                    print(f"Warning: Failed to create thumbnail for image {self.id}: {e}")
            else:
                print(f"Warning: Image file not found at {self.image.path}, skipping thumbnail generation.")

    def make_thumbnail(self, size=(400, 300)):
        img = PilImage.open(self.image.path)
        img = ImageOps.exif_transpose(img)
        img.thumbnail(size, PilImage.LANCZOS)
        
        # Convert RGBA to RGB before saving as JPEG
        if img.mode == 'RGBA':
            # Create a white background
            rgb_img = PilImage.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = rgb_img
        elif img.mode not in ('RGB', 'L'):
            # Convert other modes to RGB
            img = img.convert('RGB')
        
        thumb_io = BytesIO()
        img.save(thumb_io, format='JPEG', quality=85)
        base, ext = os.path.splitext(os.path.basename(self.image.name))
        thumbnail_filename = f"{base}_thumb.jpg"
        self.thumbnail.save(thumbnail_filename, ContentFile(thumb_io.getvalue()), save=False)
        super().save(update_fields=['thumbnail'])

    def delete(self, *args, **kwargs):
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        if self.thumbnail and os.path.isfile(self.thumbnail.path):
            os.remove(self.thumbnail.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Image {self.id} - {self.image.name}"

class Tree(models.Model):
    # 1. กลุ่มข้อมูลพื้นฐาน
    nickname = models.CharField(
        max_length=100, blank=True,
        help_text="ชื่อเล่นหรือรหัสต้นไม้"
    )
    strain = models.ForeignKey(
        Strain, on_delete=models.PROTECT, null=False, blank=False,
        help_text="สายพันธุ์ของต้นไม้ (ต้องเลือกเสมอ)"
    )
    variety = models.CharField(
        max_length=100, blank=True,
        help_text="ชื่อพันธุ์ย่อย/ชื่อทางการค้า (ถ้ามี)"
    )
    generation = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="รุ่นของต้นไม้"
    )
    batch = models.ForeignKey(
        Batch, on_delete=models.PROTECT, null=True, blank=True,
        help_text="ชุดหรือรอบการปลูก/เพาะพันธุ์ (ต้องเลือกเสมอ)"
    )
    location = models.CharField(
        max_length=255, blank=True,
        help_text="สถานที่ปลูกต้นไม้ เช่น โรงเรือน, แปลงปลูก ฯลฯ"
    )
    status = models.CharField(
        max_length=50, blank=False,
        help_text="สถานะปัจจุบันของต้นไม้ เช่น ปลูกอยู่, เก็บเกี่ยวแล้ว ฯลฯ (ต้องกรอก)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="วัน-เวลาที่บันทึกข้อมูลต้นไม้"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="วัน-เวลาที่มีการแก้ไขข้อมูลล่าสุด"
    )

    # 2. กลุ่มข้อมูลการเพาะปลูก
    germination_date = models.DateField(
        blank=True, null=True,
        help_text="วันที่เมล็ดเริ่มงอก"
    )
    plant_date = models.DateField(
        blank=False, null=False,
        help_text="วันที่ย้ายปลูกลงแปลงหรือกระถาง (ต้องกรอก)"
    )
    growth_stage = models.CharField(
        max_length=50, blank=True,
        help_text="ระยะการเจริญเติบโต เช่น ต้นกล้า, โตเต็มวัย, ออกดอก"
    )
    harvest_date = models.DateField(
        blank=True, null=True,
        help_text="วันที่เก็บเกี่ยว"
    )

    # 3. กลุ่มข้อมูลพันธุกรรมและลักษณะ
    sex = models.CharField(
        max_length=20, choices=SEX_CHOICES, default="unknown", blank=False,
        help_text="เพศของต้นไม้ (ต้องเลือกเสมอ)"
    )
    genotype = models.CharField(
        max_length=100, blank=True,
        help_text="รหัสพันธุกรรม หรือข้อมูลทางพันธุกรรมของต้นไม้ (ถ้ามี)"
    )
    phenotype = models.TextField(
        blank=True,
        help_text="ลักษณะภายนอกหรือคุณสมบัติเด่นของต้นไม้"
    )

    # 4. กลุ่มความสัมพันธ์ระหว่างต้นไม้
    parent_male = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="fathered_trees",
        help_text="ต้นพ่อพันธุ์ (ใช้ในงานเพาะพันธุ์/ผสมเกสร)"
    )
    parent_female = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="mothered_trees",
        help_text="ต้นแม่พันธุ์ (ใช้ในงานเพาะพันธุ์/ผสมเกสร)"
    )
    clone_source = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="clones",
        help_text="ต้นแม่ที่ใช้ในการปักชำ (Clone Source)"
    )
    pollination_date = models.DateField(
        blank=True, null=True,
        help_text="วันที่ทำการผสมเกสร"
    )
    pollinated_by = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="pollinated_offspring",
        help_text="ต้นที่ใช้ผสมเกสรกับต้นนี้"
    )

    # 5. กลุ่มข้อมูลผลผลิต/คุณภาพ/สุขภาพ
    yield_amount = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="ปริมาณผลผลิตที่ได้ต่อรอบ (กรัม)"
    )
    flower_quality = models.TextField(
        blank=True,
        help_text="คุณภาพหรือคุณสมบัติของดอก เช่น สี กลิ่น ขนาด ฯลฯ"
    )
    seed_count = models.PositiveIntegerField(
        blank=True, null=True,
        help_text="จำนวนเมล็ดที่ได้จากการผสมพันธุ์"
    )
    seed_harvest_date = models.DateField(
        blank=True, null=True,
        help_text="วันที่เก็บเมล็ดพันธุ์จากต้นนี้"
    )
    disease_notes = models.TextField(
        blank=True,
        help_text="บันทึกโรคหรือปัญหาศัตรูพืชที่พบในต้นนี้"
    )

    # 6. กลุ่มข้อมูลไฟล์/เอกสาร/รูปภาพ
    document = models.FileField(
        upload_to='tree_documents/', blank=True, null=True,
        help_text="อัปโหลดไฟล์เอกสารที่เกี่ยวข้องกับต้นนี้"
    )
    images = models.ManyToManyField(
        Image, blank=True, related_name="trees",
        help_text="รูปภาพที่เกี่ยวข้องกับต้นไม้"
    )

    # 7. หมายเหตุอื่น ๆ
    notes = models.TextField(
        blank=True,
        help_text="บันทึกเพิ่มเติมเกี่ยวกับต้นไม้"
    )

    def __str__(self):
        strain_name = self.strain.name if self.strain else 'Unknown Strain'
        return f"{self.nickname or 'Tree'} ({strain_name})"

    def save(self, *args, **kwargs):
        # Check if this is an update (instance already exists)
        if self.pk:
            try:
                old_instance = Tree.objects.get(pk=self.pk)
                if old_instance.nickname != self.nickname:
                    # Nickname changed, rename folder
                    old_safe_nickname = "".join([c for c in old_instance.nickname if c.isalnum() or c in (' ', '_', '-')]).strip()
                    new_safe_nickname = "".join([c for c in self.nickname if c.isalnum() or c in (' ', '_', '-')]).strip()
                    
                    old_folder_name = f"{old_safe_nickname}_{self.id}"
                    new_folder_name = f"{new_safe_nickname}_{self.id}"
                    
                    old_path = os.path.join(settings.MEDIA_ROOT, 'tree_images', old_folder_name)
                    new_path = os.path.join(settings.MEDIA_ROOT, 'tree_images', new_folder_name)
                    
                    if os.path.exists(old_path):
                        # Rename directory
                        os.rename(old_path, new_path)
                        
                        # Update paths in Image objects
                        for img in self.images_set.all():
                            if img.image:
                                img.image.name = img.image.name.replace(f'tree_images/{old_folder_name}/', f'tree_images/{new_folder_name}/')
                            if img.thumbnail:
                                img.thumbnail.name = img.thumbnail.name.replace(f'tree_images/{old_folder_name}/', f'tree_images/{new_folder_name}/')
                            img.save()
            except Tree.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Get folder path before deleting
        safe_nickname = "".join([c for c in self.nickname if c.isalnum() or c in (' ', '_', '-')]).strip()
        folder_name = f"{safe_nickname}_{self.id}"
        folder_path = os.path.join(settings.MEDIA_ROOT, 'tree_images', folder_name)

        # Delete document file
        if self.document:
            if os.path.isfile(self.document.path):
                os.remove(self.document.path)
        
        # Delete all related images (this will delete files if Image.delete handles it, 
        # but we are deleting the whole folder so we might just want to delete objects)
        # Delete all related images (both M2M and FK)
        # Use a set to avoid duplicates if images are in both
        images_to_delete = set(self.images.all()) | set(self.images_set.all())
        for image in images_to_delete:
            image.delete()
            
        super().delete(*args, **kwargs)
        
        # Delete the tree's image folder
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)