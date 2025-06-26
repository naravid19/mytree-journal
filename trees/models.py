from django.db import models

# Create your models here.


class Image(models.Model):
    image = models.ImageField(upload_to='tree_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Tree(models.Model):
    species = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True)
    nickname = models.CharField(max_length=100, blank=True)
    plant_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    main_characteristics = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    harvest_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    images = models.ManyToManyField(Image, blank=True, related_name="trees")
