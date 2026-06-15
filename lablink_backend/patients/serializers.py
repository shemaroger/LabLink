from rest_framework import serializers
from .models import Patient
from users.serializers import UserSerializer


class PatientSerializer(serializers.ModelSerializer):
    full_name    = serializers.ReadOnlyField()
    email        = serializers.ReadOnlyField()
    is_queued_today = serializers.ReadOnlyField()

    class Meta:
        model  = Patient
        fields = [
            'id', 'full_name', 'email',
            'date_of_birth', 'gender', 'phone',
            'address', 'blood_group', 'allergies',
            'emergency_contact_name', 'emergency_contact_phone',
            'queue_number', 'queue_status', 'queue_date',
            'is_queued_today',
            'created_at', 'updated_at',
        ]


class PatientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'date_of_birth', 'gender', 'phone',
            'address', 'blood_group', 'allergies',
            'emergency_contact_name', 'emergency_contact_phone',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        if Patient.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                'Patient profile already exists for this user.'
            )
        return Patient.objects.create(user=user, **validated_data)


class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Patient
        fields = [
            'date_of_birth', 'gender', 'phone',
            'address', 'blood_group', 'allergies',
            'emergency_contact_name', 'emergency_contact_phone',
        ]