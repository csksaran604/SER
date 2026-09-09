"""
Emergency Assignment Model
Tracks dispatch timeline and unit allocation.
"""

from backend.extensions import db, utc_now, to_iso_utc


class EmergencyAssignment(db.Model):
    __tablename__ = 'emergency_assignments'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('accidents.id', ondelete='CASCADE'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('emergency_units.id'), nullable=False)
    assigned_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(30), default='Assigned')  # Assigned, Dispatched, En Route, On Scene, Resolved, Cancelled
    notes = db.Column(db.Text, nullable=True)
    assigned_at = db.Column(db.DateTime, default=utc_now)
    dispatched_at = db.Column(db.DateTime, nullable=True)
    arrived_at = db.Column(db.DateTime, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    incident = db.relationship('Accident', back_populates='assignments')
    unit = db.relationship('EmergencyUnit', back_populates='assignments')
    assigned_by = db.relationship('User', back_populates='assigned_emergency')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'incident_code': self.incident.incident_id if self.incident else None,
            'unit_id': self.unit_id,
            'unit': self.unit.to_dict() if self.unit else None,
            'assigned_by_id': self.assigned_by_id,
            'assigned_by_name': self.assigned_by.full_name if self.assigned_by else None,
            'status': self.status,
            'notes': self.notes,
            'assigned_at': to_iso_utc(self.assigned_at),
            'dispatched_at': to_iso_utc(self.dispatched_at),
            'arrived_at': to_iso_utc(self.arrived_at),
            'resolved_at': to_iso_utc(self.resolved_at),
            'created_at': to_iso_utc(self.created_at)
        }
