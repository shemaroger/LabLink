from rest_framework import serializers
from .models import Notification
from patients.serializers import PatientSerializer


class NotificationSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    delivery_method_display = serializers.CharField(
        source='get_delivery_method_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    result_test_name = serializers.CharField(
        source='result.test_name', read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'patient', 'result', 'result_test_name',
            'title', 'message',
            'delivery_method', 'delivery_method_display',
            'status', 'status_display',
            'sent_at', 'read_at', 'updated_at',
        ]
        read_only_fields = ['id', 'sent_at', 'updated_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'patient', 'result', 'title',
            'message', 'delivery_method',
        ]


class NotificationReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['status', 'read_at']