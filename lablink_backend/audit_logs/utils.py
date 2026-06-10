from .models import AuditLog


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def log_action(
    user,
    action,
    affected_entity=None,
    entity_id=None,
    description=None,
    request=None,
):
    """
    Create an audit log entry.
    Call this from any view where you want to track user activity.
    """
    ip_address = None
    user_agent = None

    if request:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

    AuditLog.objects.create(
        user=user,
        action=action,
        affected_entity=affected_entity,
        entity_id=str(entity_id) if entity_id else None,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent,
    )