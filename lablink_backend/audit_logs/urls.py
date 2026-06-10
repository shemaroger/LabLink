from django.urls import path
from .views import (
    AuditLogListView,
    AuditLogDetailView,
    MyAuditLogView,
    AuditLogStatsView,
)

urlpatterns = [
    path('all/', AuditLogListView.as_view(), name='audit_log_list'),
    path('all/<int:pk>/', AuditLogDetailView.as_view(), name='audit_log_detail'),
    path('my/', MyAuditLogView.as_view(), name='my_audit_logs'),
    path('stats/', AuditLogStatsView.as_view(), name='audit_log_stats'),
]