from django.urls import path
from .views import (
    LabResultCreateView,
    LabResultListView,
    PatientResultListView,
    LabResultDetailView,
    LabResultUpdateView,
    LabResultStatusUpdateView,
    LabResultDeleteView,
    LabResultDownloadView,
)

urlpatterns = [
    path('create/', LabResultCreateView.as_view(), name='result_create'),
    path('list/', LabResultListView.as_view(), name='result_list'),
    path('my-results/', PatientResultListView.as_view(), name='my_results'),
    path('<int:pk>/', LabResultDetailView.as_view(), name='result_detail'),
    path('<int:pk>/update/', LabResultUpdateView.as_view(), name='result_update'),
    path('<int:pk>/status/', LabResultStatusUpdateView.as_view(), name='result_status'),
    path('<int:pk>/delete/', LabResultDeleteView.as_view(), name='result_delete'),
    path('<int:pk>/download/', LabResultDownloadView.as_view(), name='result_download'),
]