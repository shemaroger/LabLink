from django.db import models
from users.models import User


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('register', 'Register'),
        ('view_result', 'View Result'),
        ('download_result', 'Download Result'),
        ('upload_result', 'Upload Result'),
        ('update_result', 'Update Result'),
        ('delete_result', 'Delete Result'),
        ('create_patient', 'Create Patient'),
        ('update_patient', 'Update Patient'),
        ('delete_patient', 'Delete Patient'),
        ('send_notification', 'Send Notification'),
        ('change_password', 'Change Password'),
        ('update_profile', 'Update Profile'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    affected_entity = models.CharField(max_length=100, blank=True, null=True)
    entity_id = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.user} — {self.action} at {self.timestamp}'