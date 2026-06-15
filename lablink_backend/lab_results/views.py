from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import LabResult
from .serializers import (
    LabResultSerializer,
    LabResultCreateSerializer,
    LabResultUpdateSerializer,
    LabResultStatusSerializer,
)
from users.permissions import (
    IsAdmin, IsLabStaff, IsPatient,
    IsAdminOrLabStaff, IsAdminOrDoctor,
    IsAdminLabStaffOrDoctor,
)
from notifications.utils import send_result_notification


class LabResultCreateView(generics.CreateAPIView):
    """Lab staff uploads a new result."""
    serializer_class   = LabResultCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLabStaff]
    parser_classes     = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        result = serializer.save()
        if result.status == 'available':
            send_result_notification(result)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Lab result uploaded successfully.'},
            status=status.HTTP_201_CREATED
        )


class LabResultListView(generics.ListAPIView):
    """
    Admin, Lab Staff, Doctor, Nurse and Receptionist
    can view all results. Patient sees only their own.
    """
    serializer_class   = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user     = self.request.user
        queryset = LabResult.objects.all().order_by('-upload_date')

        # Patient sees only their own results
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)

        # All staff roles that can see results
        elif user.role in [
            'admin', 'lab_staff', 'doctor',
            'nurse', 'receptionist',
        ]:
            pass  # full queryset

        # Any other role gets nothing
        else:
            return LabResult.objects.none()

        # Apply filters
        status_filter = self.request.query_params.get('status', None)
        test_type     = self.request.query_params.get('test_type', None)
        patient_id    = self.request.query_params.get('patient_id', None)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if test_type:
            queryset = queryset.filter(test_type=test_type)
        if patient_id:
            queryset = queryset.filter(patient__id=patient_id)

        return queryset


class PatientResultListView(generics.ListAPIView):
    """Patient views their own results."""
    serializer_class   = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        return LabResult.objects.filter(
            patient__user=self.request.user
        ).order_by('-upload_date')


class LabResultDetailView(generics.RetrieveAPIView):
    """View a specific result."""
    serializer_class   = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return LabResult.objects.filter(patient__user=user)
        if user.role in [
            'admin', 'lab_staff', 'doctor',
            'nurse', 'receptionist',
        ]:
            return LabResult.objects.all()
        return LabResult.objects.none()


class LabResultUpdateView(generics.UpdateAPIView):
    """Lab staff updates a result."""
    serializer_class   = LabResultUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLabStaff]
    parser_classes     = [MultiPartParser, FormParser]
    queryset           = LabResult.objects.all()

    def perform_update(self, serializer):
        result = serializer.save()
        if result.status == 'available':
            send_result_notification(result)


class LabResultStatusUpdateView(generics.UpdateAPIView):
    """Doctor or lab staff can update result status."""
    serializer_class   = LabResultStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminLabStaffOrDoctor]
    queryset           = LabResult.objects.all()

    def perform_update(self, serializer):
        result = serializer.save()
        if result.status == 'available':
            send_result_notification(result)

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(
            {'message': 'Result status updated successfully.'}
        )


class LabResultDeleteView(generics.DestroyAPIView):
    """Admin deletes a result."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset           = LabResult.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Lab result deleted successfully.'},
            status=status.HTTP_200_OK
        )


class LabResultDownloadView(APIView):
    """Patient or staff downloads a result file."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        if user.role == 'patient':
            result = get_object_or_404(
                LabResult, pk=pk, patient__user=user
            )
        elif user.role in [
            'admin', 'lab_staff', 'doctor',
            'nurse', 'receptionist',
        ]:
            result = get_object_or_404(LabResult, pk=pk)
        else:
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not result.result_file:
            return Response(
                {'error': 'No file attached to this result.'},
                status=status.HTTP_404_NOT_FOUND
            )

        from django.http import FileResponse
        return FileResponse(
            result.result_file.open(),
            as_attachment=True,
            filename=result.result_file.name.split('/')[-1]
        )