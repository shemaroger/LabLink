from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'admin'


class IsLabStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'lab_staff'


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'patient'


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'doctor'


class IsNurse(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'nurse'


class IsReceptionist(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'receptionist'


class IsAdminOrLabStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['admin', 'lab_staff']


class IsAdminOrDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['admin', 'doctor']


class IsAdminLabStaffOrDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['admin', 'lab_staff', 'doctor']


class IsAdminOrReceptionist(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['admin', 'receptionist']


class IsAdminOrNurse(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['admin', 'nurse']


class CanViewPatients(BasePermission):
    """Admin, Lab Staff, Doctor, Nurse and Receptionist can view patients."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in [
                   'admin', 'lab_staff', 'doctor',
                   'nurse', 'receptionist',
               ]


class CanViewTriage(BasePermission):
    """Nurse, Doctor and Admin can view triage records."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['nurse', 'doctor', 'admin']


class CanCreateTriage(BasePermission):
    """Only nurses can create triage records."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'nurse'