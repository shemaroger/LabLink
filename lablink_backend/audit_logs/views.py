from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AuditLog
from .serializers import AuditLogSerializer
from users.permissions import IsAdmin


class AuditLogListView(generics.ListAPIView):
    """Admin views all audit logs."""
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by('-timestamp')

        user_id = self.request.query_params.get('user_id', None)
        action = self.request.query_params.get('action', None)
        entity = self.request.query_params.get('affected_entity', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)

        if user_id:
            queryset = queryset.filter(user__id=user_id)
        if action:
            queryset = queryset.filter(action=action)
        if entity:
            queryset = queryset.filter(affected_entity__icontains=entity)
        if date_from:
            queryset = queryset.filter(timestamp__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__date__lte=date_to)

        return queryset


class AuditLogDetailView(generics.RetrieveAPIView):
    """Admin views a specific audit log."""
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = AuditLog.objects.all()


class MyAuditLogView(generics.ListAPIView):
    """Any user views their own activity logs."""
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(
            user=self.request.user
        ).order_by('-timestamp')


class AuditLogStatsView(APIView):
    """Admin views audit log statistics."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        last_7_days = today - timedelta(days=7)
        last_30_days = today - timedelta(days=30)

        total_logs = AuditLog.objects.count()
        logs_today = AuditLog.objects.filter(
            timestamp__date=today
        ).count()
        logs_last_7_days = AuditLog.objects.filter(
            timestamp__date__gte=last_7_days
        ).count()
        logs_last_30_days = AuditLog.objects.filter(
            timestamp__date__gte=last_30_days
        ).count()

        # Most common actions
        top_actions = AuditLog.objects.values('action').annotate(
            count=Count('action')
        ).order_by('-count')[:5]

        # Most active users
        top_users = AuditLog.objects.values(
            'user__email',
            'user__first_name',
            'user__last_name'
        ).annotate(
            count=Count('user')
        ).order_by('-count')[:5]

        return Response({
            'total_logs': total_logs,
            'logs_today': logs_today,
            'logs_last_7_days': logs_last_7_days,
            'logs_last_30_days': logs_last_30_days,
            'top_actions': list(top_actions),
            'top_users': list(top_users),
        })