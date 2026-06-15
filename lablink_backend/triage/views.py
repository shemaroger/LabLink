from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import TriageRecord
from .serializers import TriageRecordSerializer, TriageRecordCreateSerializer
from users.permissions import CanViewTriage, CanCreateTriage


class TriageRecordCreateView(generics.CreateAPIView):
    """Nurse creates a triage record for a patient."""
    serializer_class   = TriageRecordCreateSerializer
    permission_classes = [permissions.IsAuthenticated, CanCreateTriage]

    def perform_create(self, serializer):
        record = serializer.save(nurse=self.request.user)
        try:
            from audit_logs.utils import log_action
            log_action(
                user=self.request.user,
                action='create_triage',
                affected_entity='triage',
                entity_id=record.id,
                description=(
                    f'Triage created for patient '
                    f'{record.patient.full_name} '
                    f'— urgency: {record.urgency_level}'
                ),
                request=self.request,
            )
        except Exception:
            pass


class TriageRecordListView(generics.ListAPIView):
    """List all triage records — nurse, doctor, admin."""
    serializer_class   = TriageRecordSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewTriage]

    def get_queryset(self):
        queryset   = TriageRecord.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        urgency    = self.request.query_params.get('urgency', None)
        if patient_id:
            queryset = queryset.filter(patient__id=patient_id)
        if urgency:
            queryset = queryset.filter(urgency_level=urgency)
        return queryset


class TriageRecordDetailView(generics.RetrieveUpdateAPIView):
    """View or update a specific triage record."""
    serializer_class   = TriageRecordSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewTriage]
    queryset           = TriageRecord.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TriageRecordCreateSerializer
        return TriageRecordSerializer


class PatientTriageHistoryView(generics.ListAPIView):
    """All triage records for a specific patient."""
    serializer_class   = TriageRecordSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewTriage]

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return TriageRecord.objects.filter(
            patient__id=patient_id
        ).order_by('-created_at')