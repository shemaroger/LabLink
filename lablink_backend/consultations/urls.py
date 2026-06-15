from django.urls import path
from .views import (
    ConsultationCreateView,
    ConsultationListView,
    ConsultationDetailView,
)

urlpatterns = [
    path('create/',                        ConsultationCreateView.as_view(), name='consultation_create'),
    path('list/',                          ConsultationListView.as_view(),   name='consultation_list'),
    path('<int:pk>/',                      ConsultationDetailView.as_view(), name='consultation_detail'),
    path('patient/<int:patient_id>/',      ConsultationListView.as_view(),   name='patient_consultations'),
]