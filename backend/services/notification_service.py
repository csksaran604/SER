"""
Notification Service
Handles in-app alert generation and provides an extensible abstraction
layer for external SMS/Email/Webhook dispatchers.
"""

from backend.extensions import db
from backend.models.notification import Notification


class ExternalNotificationChannel:
    """Base interface for future external notification gateways (e.g. Twilio, AWS SNS, SendGrid)."""
    def send(self, title: str, message: str, recipient: str) -> bool:
        # Intentionally no-op per security & scientific guidelines:
        # Do not send real emergency calls/messages automatically.
        return True


def create_notification(title: str, message: str, notification_type: str = 'system', severity: str = 'info', incident_id: int = None):
    """
    Creates an in-app notification entry.
    notification_type: 'detection', 'severity', 'assignment', 'status', 'system'
    severity: 'info', 'warning', 'critical'
    """
    try:
        note = Notification(
            title=title,
            message=message,
            type=notification_type,
            severity=severity,
            incident_id=incident_id
        )
        db.session.add(note)
        db.session.commit()
        return note
    except Exception as e:
        db.session.rollback()
        print(f"[NOTIFICATION ERROR] Failed to create notification: {str(e)}")
        return None
