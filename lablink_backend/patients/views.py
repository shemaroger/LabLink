from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Patient
from .serializers import (
    PatientSerializer,
    PatientCreateSerializer,
    PatientUpdateSerializer,
)
from users.permissions import IsAdmin, IsLabStaff, IsPatient, IsAdminOrLabStaff


class PatientProfileCreateView(generics.CreateAPIView):
    """Patient creates their own profile after registration."""
    serializer_class = PatientCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def perform_create(self, serializer):
        serializer.save()


class PatientProfileView(generics.RetrieveUpdateAPIView):
    """Patient views and updates their own profile."""
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientUpdateSerializer
        return PatientSerializer

    def get_object(self):
        try:
            return Patient.objects.get(user=self.request.user)
        except Patient.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Patient profile not found. Please create one.')


class PatientListView(generics.ListAPIView):
    """Admin and Lab Staff can view all patients."""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLabStaff]

    def get_queryset(self):
        queryset = Patient.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                user__first_name__icontains=search
            ) | queryset.filter(
                user__last_name__icontains=search
            ) | queryset.filter(
                user__email__icontains=search
            )
        return queryset


class PatientDetailView(generics.RetrieveAPIView):
    """Admin and Lab Staff can view a specific patient."""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLabStaff]
    queryset = Patient.objects.all()


class PatientDeleteView(generics.DestroyAPIView):
    """Admin can delete a patient profile."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Patient.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Patient profile deleted successfully.'},
            status=status.HTTP_200_OK
        )