from django.urls import path
from .views import (
    PatientProfileCreateView,
    PatientProfileView,
    PatientListView,
    PatientDetailView,
    PatientDeleteView,
    AdminPatientCreateView,
    AssignQueueView,
    UpdateQueueStatusView,
    ResetQueueView,
    TodayQueueView,
)

urlpatterns = [
    # Patient self-service
    path('create/',  PatientProfileCreateView.as_view(), name='patient_create'),
    path('profile/', PatientProfileView.as_view(),       name='patient_profile'),

    # Admin / receptionist
    path('admin-create/', AdminPatientCreateView.as_view(), name='admin_patient_create'),
    path('list/',         PatientListView.as_view(),        name='patient_list'),

    # Queue
    path('queue/today/',             TodayQueueView.as_view(),       name='queue_today'),
    path('<int:pk>/queue/assign/',   AssignQueueView.as_view(),      name='queue_assign'),
    path('<int:pk>/queue/status/',   UpdateQueueStatusView.as_view(), name='queue_status'),
    path('<int:pk>/queue/reset/',    ResetQueueView.as_view(),       name='queue_reset'),

    # CRUD
    path('<int:pk>/',        PatientDetailView.as_view(), name='patient_detail'),
    path('<int:pk>/delete/', PatientDeleteView.as_view(), name='patient_delete'),
]