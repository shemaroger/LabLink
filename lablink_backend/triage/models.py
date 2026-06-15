from django.db import models
from users.models import User
from patients.models import Patient


class TriageRecord(models.Model):

    URGENCY_CHOICES = [
        ('low',      'Low — routine'),
        ('medium',   'Medium — needs attention'),
        ('high',     'High — urgent'),
        ('critical', 'Critical — immediate'),
    ]

    patient          = models.ForeignKey(
        Patient, on_delete=models.CASCADE,
        related_name='triage_records'
    )
    nurse            = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name='triage_records'
    )

    # Vital signs
    temperature      = models.DecimalField(
        max_digits=4, decimal_places=1,
        help_text='Temperature in °C'
    )
    blood_pressure   = models.CharField(
        max_length=20,
        help_text='e.g. 120/80 mmHg'
    )
    pulse_rate       = models.PositiveIntegerField(
        help_text='Beats per minute'
    )
    respiratory_rate = models.PositiveIntegerField(
        help_text='Breaths per minute'
    )
    weight           = models.DecimalField(
        max_digits=5, decimal_places=1,
        help_text='Weight in kg'
    )
    height           = models.DecimalField(
        max_digits=5, decimal_places=1,
        help_text='Height in cm'
    )

    # Assessment
    chief_complaint  = models.TextField(
        help_text='Main reason for visit'
    )
    symptoms         = models.TextField(
        blank=True, default='',
        help_text='Additional symptoms'
    )
    urgency_level    = models.CharField(
        max_length=20,
        choices=URGENCY_CHOICES,
        default='low'
    )
    notes            = models.TextField(
        blank=True, default='',
        help_text='Additional nurse notes'
    )

    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'triage_records'
        ordering  = ['-created_at']
        verbose_name        = 'Triage Record'
        verbose_name_plural = 'Triage Records'

    def __str__(self):
        return (
            f'Triage for {self.patient.full_name} '
            f'— {self.urgency_level} '
            f'({self.created_at.strftime("%d %b %Y")})'
        )

    @property
    def bmi(self):
        """Calculate BMI from weight and height."""
        try:
            h = float(self.height) / 100  # cm to m
            return round(float(self.weight) / (h * h), 1)
        except Exception:
            return None