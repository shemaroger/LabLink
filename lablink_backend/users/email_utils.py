from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(user, plain_password):
    """Send welcome email with temporary password to new user."""
    role_label = {
        'lab_staff':    'Laboratory Staff',
        'nurse':        'Nurse',
        'doctor':       'Doctor',
        'receptionist': 'Receptionist',
        'patient':      'Patient',
        'admin':        'Admin',
    }.get(user.role, user.role.title())

    subject = 'Welcome to LabLink — Your Account has been Created'

    message = f"""Dear {user.first_name} {user.last_name},

Welcome to LabLink — Laboratory Results Management System.

Your account has been created successfully.

Here are your login details:

  Role:     {role_label}
  Email:    {user.email}
  Password: {plain_password}

IMPORTANT: You are required to change your password on your first login.

Login here: http://localhost:5173/login

If you have any questions, please contact your system administrator.

Best regards,
LabLink Team — TechQuest Ltd
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f'Welcome email failed for {user.email}: {e}')
        return False