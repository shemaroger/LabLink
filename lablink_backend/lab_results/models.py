from django.db import models
from patients.models import Patient
from users.models import User


class LabResult(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('available', 'Available'),
        ('reviewed', 'Reviewed'),
    ]

    TEST_CHOICES = [
        ('blood_test', 'Blood Test'),
        ('urine_test', 'Urine Test'),
        ('stool_test', 'Stool Test'),
        ('xray', 'X-Ray'),
        ('ultrasound', 'Ultrasound'),
        ('malaria', 'Malaria Test'),
        ('hiv', 'HIV Test'),
        ('glucose', 'Glucose Test'),
        ('cholesterol', 'Cholesterol Test'),
        ('liver_function', 'Liver Function Test'),
        ('kidney_function', 'Kidney Function Test'),
        ('full_blood_count', 'Full Blood Count'),
        ('other', 'Other'),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='lab_results'
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_results'
    )
    test_type = models.CharField(max_length=50, choices=TEST_CHOICES)
    test_name = models.CharField(max_length=200)
    result_details = models.TextField()
    result_file = models.FileField(
        upload_to='lab_results/%Y/%m/%d/',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    notes = models.TextField(blank=True, null=True)
    test_date = models.DateField()
    upload_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lab_results'
        verbose_name = 'Lab Result'
        verbose_name_plural = 'Lab Results'
        ordering = ['-upload_date']

    def __str__(self):
        return f'{self.patient.full_name} — {self.test_name} ({self.status})'