from django.db import models
from PIL import Image as PilImage, ImageOps
from io import BytesIO
from django.core.files.base import ContentFile
import os

SEX_CHOICES = [
    ("bisexual", "สมบูรณ์เพศ"),
    ("male", "ตัวผู้"),
    ("female", "ตัวเมีย"),
    ("monoecious", "แยกเพศในต้นเดียวกัน"),
    ("mixed", "ผสมหลายเพศ"),
    ("unknown", "ไม่ระบุ/ไม่แน่ใจ"),
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

class Image(models.Model):
    image = models.ImageField(
        upload_to='tree_images/',
        help_text="ไฟล์รูปภาพของต้นไม้"
    )
    thumbnail = models.ImageField(
        upload_to='tree_images/thumbnails/',
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
            self.make_thumbnail()

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

    def delete(self, *args, **kwargs):
        # ลบไฟล์ document จริง
        if self.document:
            if os.path.isfile(self.document.path):
                os.remove(self.document.path)
        # ลบรูปภาพและไฟล์จริงทั้งหมด
        for image in self.images.all():
            image.delete()
        super().delete(*args, **kwargs)