import datetime
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .models import Patient
from .serializers import (
    PatientSerializer,
    PatientCreateSerializer,
    PatientUpdateSerializer,
)
from users.permissions import (
    IsAdmin,
    IsPatient,
    IsAdminOrLabStaff,
    IsAdminLabStaffOrDoctor,
    IsAdminOrReceptionist,
    CanViewPatients,
)
from .queue_utils import assign_queue_number, reset_queue_for_patient


class PatientProfileCreateView(generics.CreateAPIView):
    """Patient creates their own profile after registration."""
    serializer_class   = PatientCreateSerializer
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
            raise NotFound(
                'Patient profile not found. Please create one.'
            )


class PatientListView(generics.ListAPIView):
    """Admin, Lab Staff, Doctor, Nurse and Receptionist can view all patients."""
    serializer_class   = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewPatients]

    def get_queryset(self):
        queryset = Patient.objects.all().order_by('-created_at')
        search   = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                user__first_name__icontains=search
            ) | queryset.filter(
                user__last_name__icontains=search
            ) | queryset.filter(
                user__email__icontains=search
            )
        return queryset


class PatientDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin, Lab Staff, Doctor, Nurse and Receptionist can view a patient.
    Admin and Receptionist can also update patient profiles.
    """
    queryset = Patient.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanViewPatients]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientUpdateSerializer
        return PatientSerializer

    def update(self, request, *args, **kwargs):
        # Only admin and receptionist can edit patient profiles
        if request.user.role not in ['admin', 'receptionist']:
            raise PermissionDenied(
                'You do not have permission to edit patient profiles.'
            )
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class PatientDeleteView(generics.DestroyAPIView):
    """Admin can delete a patient profile."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset           = Patient.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Patient profile deleted successfully.'},
            status=status.HTTP_200_OK
        )


class AdminPatientCreateView(generics.CreateAPIView):
    """Admin or Receptionist creates a patient — auto password + welcome email."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReceptionist]

    def create(self, request, *args, **kwargs):
        import random
        import string
        from users.models import User

        # Auto-generate password
        plain_password = ''.join(
            random.choices(
                string.ascii_letters + string.digits, k=10
            )
        )

        # Create user account
        user_data = {
            'first_name': request.data.get('first_name'),
            'last_name':  request.data.get('last_name'),
            'email':      request.data.get('email'),
            'role':       'patient',
        }

        try:
            if User.objects.filter(
                email=user_data['email']
            ).exists():
                return Response(
                    {'email': ['A user with this email already exists.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.create_user(
                **user_data,
                password=plain_password,
                must_change_password=True,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create patient profile
        patient = Patient.objects.create(
            user=user,
            date_of_birth=request.data.get('date_of_birth'),
            gender=request.data.get('gender'),
            phone=request.data.get('phone'),
            address=request.data.get('address', ''),
            blood_group=request.data.get('blood_group', ''),
            allergies=request.data.get('allergies', ''),
            emergency_contact_name=request.data.get(
                'emergency_contact_name', ''
            ),
            emergency_contact_phone=request.data.get(
                'emergency_contact_phone', ''
            ),
        )

        # Send welcome email
        email_sent = False
        try:
            from users.email_utils import send_welcome_email
            email_sent = send_welcome_email(user, plain_password)
        except Exception as e:
            print(f'Patient welcome email failed: {e}')

        # Log action
        try:
            from audit_logs.utils import log_action
            log_action(
                user=request.user,
                action='create_patient',
                affected_entity='patient',
                entity_id=patient.id,
                description=(
                    f'Patient {user.first_name} {user.last_name} '
                    f'registered by {request.user.role}'
                ),
                request=request,
            )
        except Exception:
            pass

        return Response(
            {
                'message': (
                    f'Patient registered successfully. '
                    f'{"Welcome email sent." if email_sent else "Email failed — check SMTP settings."}'
                ),
                'patient_id': patient.id,
                'user_id':    user.id,
                'email_sent': email_sent,
            },
            status=status.HTTP_201_CREATED
        )


class AssignQueueView(APIView):
    """Receptionist or Admin assigns a queue number to a patient."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReceptionist]

    def post(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        queue_number = assign_queue_number(patient)

        # Send notification to patient
        try:
            from notifications.utils import send_queue_notification
            send_queue_notification(patient, queue_number)
        except Exception as e:
            print(f'Queue notification failed: {e}')

        # Log action
        try:
            from audit_logs.utils import log_action
            log_action(
                user=request.user,
                action='assign_queue',
                affected_entity='patient',
                entity_id=patient.id,
                description=(
                    f'Queue #{queue_number} assigned to '
                    f'{patient.full_name}'
                ),
                request=request,
            )
        except Exception:
            pass

        return Response({
            'message':      f'Queue #{queue_number} assigned.',
            'queue_number': queue_number,
            'queue_status': patient.queue_status,
            'queue_date':   str(patient.queue_date),
        })


class UpdateQueueStatusView(APIView):
    """Receptionist or Admin updates a patient's queue status."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReceptionist]

    def patch(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get('queue_status')
        valid      = ['waiting', 'called', 'in_progress', 'done']

        if new_status not in valid:
            return Response(
                {'error': f'Invalid status. Choose from: {valid}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        patient.queue_status = new_status
        patient.save()

        # Send notification based on status
        try:
            if new_status == 'called':
                from notifications.utils import send_queue_called_notification
                send_queue_called_notification(patient)
            elif new_status in ['in_progress', 'done']:
                from notifications.utils import send_queue_status_notification
                send_queue_status_notification(patient, new_status)
        except Exception as e:
            print(f'Queue notification failed: {e}')

        # Log action
        try:
            from audit_logs.utils import log_action
            log_action(
                user=request.user,
                action='update_queue_status',
                affected_entity='patient',
                entity_id=patient.id,
                description=(
                    f'Queue status for {patient.full_name} '
                    f'updated to {new_status}'
                ),
                request=request,
            )
        except Exception:
            pass

        return Response({
            'message':      'Queue status updated.',
            'queue_number': patient.queue_number,
            'queue_status': patient.queue_status,
        })


class ResetQueueView(APIView):
    """Admin resets a patient's queue assignment."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        reset_queue_for_patient(patient)

        return Response({
            'message': f'Queue reset for {patient.full_name}.',
        })


class TodayQueueView(generics.ListAPIView):
    """List all patients in today's queue ordered by number."""
    serializer_class   = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewPatients]

    def get_queryset(self):
        today = datetime.date.today()
        return Patient.objects.filter(
            queue_date=today,
            queue_number__isnull=False,
        ).order_by('queue_number')