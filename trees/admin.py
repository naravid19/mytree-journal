from django.contrib import admin
from .models import Tree, Image
# Register your models here.


class TreeAdmin(admin.ModelAdmin):
    list_display = ('species', 'variety', 'nickname', 'plant_date', 'status', 'sex')

admin.site.register(Tree, TreeAdmin)
admin.site.register(Image)