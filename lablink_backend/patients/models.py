import datetime
from django.db import models
from users.models import User


class Patient(models.Model):

    QUEUE_STATUS_CHOICES = [
        ('waiting',     'Waiting'),
        ('called',      'Called'),
        ('in_progress', 'In Progress'),
        ('done',        'Done'),
    ]

    user                    = models.OneToOneField(
        User, on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    date_of_birth           = models.DateField(null=True, blank=True)
    gender                  = models.CharField(max_length=10, blank=True)
    phone                   = models.CharField(max_length=20, blank=True)
    address                 = models.TextField(blank=True)
    blood_group             = models.CharField(max_length=5, blank=True)
    allergies               = models.TextField(blank=True)
    emergency_contact_name  = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    # Queue fields
    queue_number  = models.PositiveIntegerField(null=True, blank=True)
    queue_status  = models.CharField(
        max_length=20,
        choices=QUEUE_STATUS_CHOICES,
        default='waiting',
        null=True,
        blank=True,
    )
    queue_date    = models.DateField(null=True, blank=True)

    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'patients'
        verbose_name        = 'Patient'
        verbose_name_plural = 'Patients'
        ordering            = ['-created_at']

    def __str__(self):
        return f'{self.full_name}'

    @property
    def full_name(self):
        return f'{self.user.first_name} {self.user.last_name}'

    @property
    def email(self):
        return self.user.email

    @property
    def is_queued_today(self):
        return (
            self.queue_number is not None and
            self.queue_date == datetime.date.today()
        )