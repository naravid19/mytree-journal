from django.db import models

# Create your models here.

SEX_CHOICES = [
    ("bisexual", "สมบูรณ์เพศ"),
    ("male", "ตัวผู้"),
    ("female", "ตัวเมีย"),
    ("monoecious", "แยกเพศในต้นเดียวกัน"),
    ("mixed", "ผสมหลายเพศ"),
    ("unknown", "ไม่ระบุ/ไม่แน่ใจ"),
]

class Image(models.Model):
    image = models.ImageField(upload_to='tree_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Tree(models.Model):
    species = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True)
    nickname = models.CharField(max_length=100, blank=True)
    plant_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    phenotype = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    harvest_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    images = models.ManyToManyField(Image, blank=True, related_name="trees")
    sex = models.CharField(max_length=20, choices=SEX_CHOICES, default="unknown", blank=True)
