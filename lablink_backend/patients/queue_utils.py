import datetime
from .models import Patient


def assign_queue_number(patient):
    """
    Assign a queue number to a patient for today.
    Queue numbers reset every day starting from 1.
    """
    today = datetime.date.today()

    # Count patients already queued today
    count = Patient.objects.filter(
        queue_date=today,
        queue_number__isnull=False,
    ).exclude(pk=patient.pk).count()

    queue_number         = count + 1
    patient.queue_number = queue_number
    patient.queue_status = 'waiting'
    patient.queue_date   = today
    patient.save()

    return queue_number


def reset_queue_for_patient(patient):
    """Clear queue assignment for a patient."""
    patient.queue_number = None
    patient.queue_status = None
    patient.queue_date   = None
    patient.save()


def get_today_queue():
    """Return all patients in today's queue ordered by number."""
    today = datetime.date.today()
    return Patient.objects.filter(
        queue_date=today,
        queue_number__isnull=False,
    ).order_by('queue_number')