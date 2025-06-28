from django.contrib import admin
from .models import Tree, Image, Strain, Batch

class StrainAdmin(admin.ModelAdmin):
    search_fields = ['name', 'description']

class BatchAdmin(admin.ModelAdmin):
    search_fields = ['batch_code', 'description']

class TreeAdmin(admin.ModelAdmin):
    list_display = (
        'nickname', 'strain', 'batch', 'status', 'sex', 'plant_date', 'harvest_date', 'created_at'
    )
    list_filter = (
        'strain', 'batch', 'status', 'sex', 'plant_date', 'harvest_date', 'created_at'
    )
    search_fields = ('nickname', 'variety', 'phenotype', 'notes')
    autocomplete_fields = ('strain', 'batch', 'parent_male', 'parent_female', 'clone_source', 'pollinated_by')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

admin.site.register(Tree, TreeAdmin)
admin.site.register(Image)
admin.site.register(Strain, StrainAdmin)
admin.site.register(Batch, BatchAdmin)
