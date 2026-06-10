from django.contrib import admin
from .models import LabResult


@admin.register(LabResult)
class LabResultAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'test_name', 'test_type',
        'status', 'test_date', 'uploaded_by', 'upload_date'
    ]
    list_filter = ['status', 'test_type', 'test_date']
    search_fields = [
        'patient__user__first_name',
        'patient__user__last_name',
        'test_name',
    ]
    ordering = ['-upload_date']
    readonly_fields = ['upload_date', 'updated_at']