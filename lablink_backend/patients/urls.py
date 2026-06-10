from django.urls import path
from .views import (
    PatientProfileCreateView,
    PatientProfileView,
    PatientListView,
    PatientDetailView,
    PatientDeleteView,
)

urlpatterns = [
    path('create/', PatientProfileCreateView.as_view(), name='patient_create'),
    path('profile/', PatientProfileView.as_view(), name='patient_profile'),
    path('list/', PatientListView.as_view(), name='patient_list'),
    path('<int:pk>/', PatientDetailView.as_view(), name='patient_detail'),
    path('<int:pk>/delete/', PatientDeleteView.as_view(), name='patient_delete'),
]