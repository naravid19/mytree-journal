from django.contrib import admin
from .models import Tree, Image
# Register your models here.


class ImageInline(admin.TabularInline):
    model = Image
    extra = 1

class TreeAdmin(admin.ModelAdmin):
    inlines = [ImageInline]
    list_display = ('species', 'variety', 'nickname', 'plant_date', 'status')

admin.site.register(Tree, TreeAdmin)
admin.site.register(Image)
