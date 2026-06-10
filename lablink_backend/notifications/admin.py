from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'title', 'delivery_method',
        'status', 'sent_at', 'read_at'
    ]
    list_filter = ['status', 'delivery_method']
    search_fields = [
        'patient__user__first_name',
        'patient__user__last_name',
        'title',
    ]
    ordering = ['-sent_at']
    readonly_fields = ['sent_at', 'updated_at']