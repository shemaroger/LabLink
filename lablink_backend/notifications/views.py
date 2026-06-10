from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
)
from .utils import send_result_notification
from users.permissions import IsAdmin, IsLabStaff, IsPatient, IsAdminOrLabStaff


class NotificationListView(generics.ListAPIView):
    """Patient views their own notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        queryset = Notification.objects.filter(
            patient__user=self.request.user,
            delivery_method='in_app'
        ).order_by('-sent_at')

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class NotificationDetailView(generics.RetrieveAPIView):
    """Patient views a specific notification."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        return Notification.objects.filter(
            patient__user=self.request.user
        )


class MarkNotificationReadView(APIView):
    """Patient marks a notification as read."""
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def patch(self, request, pk):
        notification = get_object_or_404(
            Notification,
            pk=pk,
            patient__user=request.user
        )
        notification.status = 'read'
        notification.read_at = timezone.now()
        notification.save()
        return Response(
            {'message': 'Notification marked as read.'},
            status=status.HTTP_200_OK
        )


class MarkAllNotificationsReadView(APIView):
    """Patient marks all notifications as read."""
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def patch(self, request):
        Notification.objects.filter(
            patient__user=request.user,
            status__in=['sent', 'delivered']
        ).update(
            status='read',
            read_at=timezone.now()
        )
        return Response(
            {'message': 'All notifications marked as read.'},
            status=status.HTTP_200_OK
        )


class UnreadNotificationCountView(APIView):
    """Returns count of unread notifications for patient."""
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get(self, request):
        count = Notification.objects.filter(
            patient__user=request.user,
            delivery_method='in_app',
            status__in=['sent', 'delivered']
        ).count()
        return Response({'unread_count': count})


class AdminNotificationListView(generics.ListAPIView):
    """Admin views all notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = Notification.objects.all().order_by('-sent_at')
        patient_id = self.request.query_params.get('patient_id', None)
        status_filter = self.request.query_params.get('status', None)
        delivery = self.request.query_params.get('delivery_method', None)

        if patient_id:
            queryset = queryset.filter(patient__id=patient_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if delivery:
            queryset = queryset.filter(delivery_method=delivery)
        return queryset


class SendManualNotificationView(generics.CreateAPIView):
    """Admin or Lab Staff sends a manual notification."""
    serializer_class = NotificationCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLabStaff]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notification = serializer.save(status='sent')
        return Response(
            {
                'message': 'Notification sent successfully.',
                'id': notification.id,
            },
            status=status.HTTP_201_CREATED
        )