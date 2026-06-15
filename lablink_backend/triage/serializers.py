from rest_framework import serializers
from .models import TriageRecord
from users.models import User


class TriageRecordSerializer(serializers.ModelSerializer):
    patient_name   = serializers.CharField(
        source='patient.full_name', read_only=True
    )
    nurse_name     = serializers.CharField(
        source='nurse.full_name', read_only=True
    )
    bmi            = serializers.ReadOnlyField()
    urgency_display = serializers.CharField(
        source='get_urgency_level_display', read_only=True
    )

    class Meta:
        model  = TriageRecord
        fields = [
            'id',
            'patient', 'patient_name',
            'nurse',   'nurse_name',
            'temperature', 'blood_pressure',
            'pulse_rate',  'respiratory_rate',
            'weight',      'height', 'bmi',
            'chief_complaint', 'symptoms',
            'urgency_level',   'urgency_display',
            'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'nurse', 'created_at', 'updated_at']


class TriageRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TriageRecord
        fields = [
            'patient',
            'temperature', 'blood_pressure',
            'pulse_rate',  'respiratory_rate',
            'weight',      'height',
            'chief_complaint', 'symptoms',
            'urgency_level', 'notes',
        ]