from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Consultation
from .serializers import ConsultationSerializer, ConsultationCreateSerializer
from users.permissions import IsDoctor, CanViewTriage


class ConsultationCreateView(generics.CreateAPIView):
    """Doctor creates a consultation record."""
    serializer_class   = ConsultationCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save with doctor set to current user
        consultation = serializer.save(doctor=request.user)

        # Log action
        try:
            from audit_logs.utils import log_action
            log_action(
                user=request.user,
                action='create_consultation',
                affected_entity='consultation',
                entity_id=consultation.id,
                description=(
                    f'Consultation created for '
                    f'{consultation.patient.full_name}'
                ),
                request=request,
            )
        except Exception:
            pass

        # Return full serialized data so frontend gets the id
        output = ConsultationSerializer(
            consultation,
            context={'request': request}
        )
        return Response(output.data, status=status.HTTP_201_CREATED)


class ConsultationListView(generics.ListAPIView):
    """List all consultations — doctor and admin."""
    serializer_class   = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewTriage]

    def get_queryset(self):
        queryset   = Consultation.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient__id=patient_id)
        return queryset


class ConsultationDetailView(generics.RetrieveAPIView):
    """View a specific consultation."""
    serializer_class   = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewTriage]
    queryset           = Consultation.objects.all()