"""
Emergency Unit Model
"""

from backend.extensions import db, utc_now, to_iso_utc


class EmergencyUnit(db.Model):
    __tablename__ = 'emergency_units'

    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.String(50), unique=True, nullable=False)
    vehicle_number = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'Ambulance', 'Police', 'Fire & Rescue'
    driver_name = db.Column(db.String(120), nullable=False)
    contact_number = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(30), default='Available')  # 'Available', 'Assigned', 'Dispatched', 'Busy', 'Offline'
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    last_updated = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)
    created_at = db.Column(db.DateTime, default=utc_now)

    # Relationships
    assignments = db.relationship('EmergencyAssignment', back_populates='unit', lazy=True)
    accidents = db.relationship('Accident', back_populates='assigned_unit', lazy=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'unit_id': self.unit_id,
            'vehicle_number': self.vehicle_number,
            'type': self.type,
            'driver_name': self.driver_name,
            'contact_number': self.contact_number,
            'status': self.status,
            'latitude': float(self.latitude),
            'longitude': float(self.longitude),
            'last_updated': to_iso_utc(self.last_updated),
            'created_at': to_iso_utc(self.created_at)
        }
