from rest_framework import serializers
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source='patient.full_name', read_only=True
    )
    doctor_name  = serializers.SerializerMethodField()
    diagnosis_type_display = serializers.CharField(
        source='get_diagnosis_type_display', read_only=True
    )

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f'Dr. {obj.doctor.first_name} {obj.doctor.last_name}'
        return '—'

    class Meta:
        model  = Consultation
        fields = [
            'id',
            'patient', 'patient_name',
            'doctor',  'doctor_name',
            'chief_complaint',
            'history_of_illness',
            'physical_examination',
            'diagnosis', 'diagnosis_type', 'diagnosis_type_display',
            'treatment_plan',
            'prescriptions',
            'lab_tests_ordered',
            'follow_up_date',
            'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'doctor', 'created_at', 'updated_at']


class ConsultationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Consultation
        fields = [
            'patient',
            'chief_complaint',
            'history_of_illness',
            'physical_examination',
            'diagnosis', 'diagnosis_type',
            'treatment_plan',
            'prescriptions',
            'lab_tests_ordered',
            'follow_up_date',
            'notes',
        ]