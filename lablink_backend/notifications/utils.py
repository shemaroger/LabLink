from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


def send_result_notification(result):
    """
    Called when a lab result status is set to available.
    Creates an in-app notification and sends an email.
    """
    from .models import Notification

    patient = result.patient
    title = f'Your {result.test_name} result is ready'
    message = (
        f'Dear {patient.full_name},\n\n'
        f'Your laboratory test result for {result.test_name} '
        f'(Test type: {result.get_test_type_display()}) '
        f'is now available. Please log in to LabLink to view '
        f'and download your result.\n\n'
        f'Test date: {result.test_date}\n\n'
        f'If you have any questions, please contact your healthcare provider.\n\n'
        f'LabLink Team'
    )

    # Create in-app notification
    notification = Notification.objects.create(
        patient=patient,
        result=result,
        title=title,
        message=message,
        delivery_method='in_app',
        status='sent',
    )

    # Send email notification
    try:
        send_mail(
            subject=title,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient.email],
            fail_silently=False,
        )
        # Create email notification record
        Notification.objects.create(
            patient=patient,
            result=result,
            title=title,
            message=message,
            delivery_method='email',
            status='sent',
        )
    except Exception as e:
        # Create failed email notification record
        Notification.objects.create(
            patient=patient,
            result=result,
            title=title,
            message=message,
            delivery_method='email',
            status='failed',
        )
        print(f'Email notification failed: {e}')

    return notification