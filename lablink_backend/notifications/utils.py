from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


def send_result_notification(result):
    """Notify patient that their lab result is ready."""
    from .models import Notification
    try:
        # Get patient profile from user
        patient = result.patient
        Notification.objects.create(
            patient=patient,
            result=result,
            title='Your lab result is ready',
            message=(
                f'Your {result.test_name} result is now available. '
                f'Log in to LabLink to view your results.'
            ),
            delivery_method='in_app',
            status='sent',
        )
    except Exception as e:
        print(f'Result notification failed: {e}')


def send_queue_notification(patient, queue_number):
    """Notify patient of their assigned queue number."""
    from .models import Notification
    try:
        Notification.objects.create(
            patient=patient,
            result=None,
            title=f'Queue number assigned — #{queue_number}',
            message=(
                f'You have been assigned queue number #{queue_number}. '
                f'Please wait in the waiting area and you will be '
                f'called when it is your turn.'
            ),
            delivery_method='in_app',
            status='sent',
        )
    except Exception as e:
        print(f'Queue notification failed: {e}')


def send_queue_called_notification(patient):
    """Notify patient that they are being called."""
    from .models import Notification
    try:
        Notification.objects.create(
            patient=patient,
            result=None,
            title=f'You are being called — Queue #{patient.queue_number}',
            message=(
                f'Queue #{patient.queue_number} — '
                f'Please proceed to the consultation room now.'
            ),
            delivery_method='in_app',
            status='sent',
        )
    except Exception as e:
        print(f'Queue called notification failed: {e}')


def send_queue_status_notification(patient, new_status):
    """Notify patient of queue status change."""
    from .models import Notification

    status_messages = {
        'in_progress': (
            f'Queue #{patient.queue_number} — '
            f'Your consultation is now in progress.'
        ),
        'done': (
            f'Queue #{patient.queue_number} — '
            f'Your visit is complete. Thank you for visiting.'
        ),
    }

    message = status_messages.get(new_status)
    if not message:
        return

    try:
        Notification.objects.create(
            patient=patient,
            result=None,
            title=f'Queue update — #{patient.queue_number}',
            message=message,
            delivery_method='in_app',
            status='sent',
        )
    except Exception as e:
        print(f'Queue status notification failed: {e}')