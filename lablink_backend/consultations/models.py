from django.db import models
from patients.models import Patient
from users.models import User


class Consultation(models.Model):

    DIAGNOSIS_CHOICES = [
        ('provisional', 'Provisional diagnosis'),
        ('confirmed',   'Confirmed diagnosis'),
        ('referred',    'Referred'),
        ('follow_up',   'Follow-up required'),
    ]

    patient         = models.ForeignKey(
        Patient, on_delete=models.CASCADE,
        related_name='consultations'
    )
    doctor          = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name='consultations'
    )
    chief_complaint  = models.TextField(
        help_text='Patient chief complaint as noted by doctor'
    )
    history_of_illness = models.TextField(
        blank=True, default='',
        help_text='History of present illness'
    )
    physical_examination = models.TextField(
        blank=True, default='',
        help_text='Physical examination findings'
    )
    diagnosis        = models.TextField(
        help_text='Doctor diagnosis or provisional diagnosis'
    )
    diagnosis_type   = models.CharField(
        max_length=20,
        choices=DIAGNOSIS_CHOICES,
        default='provisional'
    )
    treatment_plan   = models.TextField(
        blank=True, default='',
        help_text='Proposed treatment plan'
    )
    prescriptions    = models.TextField(
        blank=True, default='',
        help_text='Medications prescribed'
    )
    lab_tests_ordered = models.TextField(
        blank=True, default='',
        help_text='Lab tests ordered for this visit'
    )
    follow_up_date   = models.DateField(
        null=True, blank=True,
        help_text='Next follow-up date'
    )
    notes            = models.TextField(
        blank=True, default='',
        help_text='Additional notes'
    )
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'consultations'
        ordering  = ['-created_at']
        verbose_name        = 'Consultation'
        verbose_name_plural = 'Consultations'

    def __str__(self):
        return (
            f'Consultation — {self.patient.full_name} '
            f'by Dr. {self.doctor.last_name} '
            f'({self.created_at.strftime("%d %b %Y")})'
        )