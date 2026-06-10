from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'email', 'gender',
        'phone', 'blood_group', 'created_at'
    ]
    list_filter = ['gender', 'blood_group']
    search_fields = [
        'user__first_name', 'user__last_name',
        'user__email', 'phone'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']