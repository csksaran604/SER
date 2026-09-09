"""
Notification Model
Stores alert notifications for detections, high-severity events, and dispatches.
"""

from backend.extensions import db, utc_now, to_iso_utc


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='system')  # detection, severity, assignment, status, system
    severity = db.Column(db.String(20), default='info')  # info, warning, critical
    is_read = db.Column(db.Boolean, default=False)
    incident_id = db.Column(db.Integer, db.ForeignKey('accidents.id', ondelete='CASCADE'), nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)

    # Relationships
    incident = db.relationship('Accident', back_populates='notifications')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'severity': self.severity,
            'is_read': self.is_read,
            'incident_id': self.incident_id,
            'incident_code': self.incident.incident_id if self.incident else None,
            'created_at': to_iso_utc(self.created_at)
        }
