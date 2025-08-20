from django.contrib import admin
from django.utils.html import format_html
from .models import AwardCategory, AwardWinner, Nominee, AwardNomination

@admin.register(AwardCategory)
class AwardCategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'active', 'order']
    list_editable = ['active', 'order']
    list_filter = ['active']
    search_fields = ['title', 'description']

@admin.register(AwardWinner)
class AwardWinnerAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'category', 'year', 'status', 'image_preview']
    list_filter = ['status', 'year', 'category']
    search_fields = ['name', 'title', 'location']
    list_editable = ['status']
    
    def image_preview(self, obj):
        if obj.image_url_display:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover;" />',
                obj.image_url_display
            )
        return "No Image"
    image_preview.short_description = "Image"

@admin.register(Nominee)
class NomineeAdmin(admin.ModelAdmin):
    list_display = ['name', 'institution', 'category', 'status', 'suggested_by', 'suggested_date']
    list_filter = ['status', 'category', 'suggested_date']
    search_fields = ['name', 'institution', 'specialty']
    list_editable = ['status']

@admin.register(AwardNomination)
class AwardNominationAdmin(admin.ModelAdmin):
    list_display = ['nominee_name', 'award_category', 'nominator_name', 'status', 'submission_date']
    list_filter = ['status', 'award_category', 'submission_date']
    search_fields = ['nominee_name', 'nominator_name', 'nominator_email']
    list_editable = ['status']
    readonly_fields = ['submission_date']