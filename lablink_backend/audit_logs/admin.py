from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'action', 'affected_entity',
        'entity_id', 'ip_address', 'timestamp'
    ]
    list_filter = ['action', 'affected_entity', 'timestamp']
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'action',
        'description',
    ]
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False