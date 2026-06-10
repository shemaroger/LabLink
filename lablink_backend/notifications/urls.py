from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    UnreadNotificationCountView,
    AdminNotificationListView,
    SendManualNotificationView,
)

urlpatterns = [
    # Patient endpoints
    path('my/', NotificationListView.as_view(), name='my_notifications'),
    path('my/<int:pk>/', NotificationDetailView.as_view(), name='notification_detail'),
    path('my/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('my/read-all/', MarkAllNotificationsReadView.as_view(), name='mark_all_read'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='unread_count'),

    # Admin endpoints
    path('all/', AdminNotificationListView.as_view(), name='admin_notifications'),
    path('send/', SendManualNotificationView.as_view(), name='send_notification'),
]