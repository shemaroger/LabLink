from django.urls import path
from .views import (
    TriageRecordCreateView,
    TriageRecordListView,
    TriageRecordDetailView,
    PatientTriageHistoryView,
)

urlpatterns = [
    path('create/',              TriageRecordCreateView.as_view(),   name='triage_create'),
    path('list/',                TriageRecordListView.as_view(),     name='triage_list'),
    path('<int:pk>/',            TriageRecordDetailView.as_view(),   name='triage_detail'),
    path('patient/<int:patient_id>/', PatientTriageHistoryView.as_view(), name='patient_triage_history'),
]