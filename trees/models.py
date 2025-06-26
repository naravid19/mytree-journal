from django.db import models

# Create your models here.


class Tree(models.Model):
    species = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True)
    nickname = models.CharField(max_length=100, blank=True)
    plant_date = models.DateField()
    location = models.CharField(max_length=255)
    main_characteristics = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    harvest_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='มีชีวิต')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Image(models.Model):
    tree = models.ForeignKey(Tree, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='tree_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)