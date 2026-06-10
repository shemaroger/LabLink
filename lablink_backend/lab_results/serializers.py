from rest_framework import serializers
from .models import LabResult
from patients.serializers import PatientSerializer
from users.serializers import UserSerializer


class LabResultSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    uploaded_by = UserSerializer(read_only=True)
    test_type_display = serializers.CharField(
        source='get_test_type_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = LabResult
        fields = [
            'id', 'patient', 'uploaded_by',
            'test_type', 'test_type_display',
            'test_name', 'result_details',
            'result_file', 'status', 'status_display',
            'notes', 'test_date',
            'upload_date', 'updated_at',
        ]
        read_only_fields = ['id', 'upload_date', 'updated_at']


class LabResultCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = [
            'patient', 'test_type', 'test_name',
            'result_details', 'result_file',
            'status', 'notes', 'test_date',
        ]

    def create(self, validated_data):
        uploaded_by = self.context['request'].user
        return LabResult.objects.create(
            uploaded_by=uploaded_by,
            **validated_data
        )


class LabResultUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = [
            'test_type', 'test_name', 'result_details',
            'result_file', 'status', 'notes', 'test_date',
        ]


class LabResultStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = ['status']