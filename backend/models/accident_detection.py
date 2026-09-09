"""
Accident Detection Model
Stores raw AI vision inference results, bounding box details, and media paths.
"""

import json
from backend.extensions import db, utc_now, to_iso_utc


class AccidentDetection(db.Model):
    __tablename__ = 'accident_detections'

    id = db.Column(db.Integer, primary_key=True)
    detection_uuid = db.Column(db.String(64), unique=True, nullable=False)
    media_type = db.Column(db.String(20), nullable=False)  # 'image' or 'video'
    media_filename = db.Column(db.String(255), nullable=False)
    media_path = db.Column(db.String(500), nullable=False)
    result_media_path = db.Column(db.String(500), nullable=True)
    is_accident_detected = db.Column(db.Boolean, default=False)
    confidence_score = db.Column(db.Float, default=0.0)
    severity = db.Column(db.String(20), default='Low')  # 'Low', 'Medium', 'High', 'Critical'
    detected_objects_raw = db.Column(db.Text, nullable=True)  # JSON-encoded array or objects
    model_version = db.Column(db.String(100), default='v1.0.0')
    inference_time_ms = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utc_now)

    # Relationships
    accident = db.relationship('Accident', back_populates='detection', uselist=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    @property
    def detected_objects(self):
        if not self.detected_objects_raw:
            return []
        try:
            return json.loads(self.detected_objects_raw)
        except Exception:
            return []

    @detected_objects.setter
    def detected_objects(self, value):
        self.detected_objects_raw = json.dumps(value) if value is not None else None

    def to_dict(self):
        return {
            'id': self.id,
            'detection_uuid': self.detection_uuid,
            'media_type': self.media_type,
            'media_filename': self.media_filename,
            'media_path': self.media_path,
            'result_media_path': self.result_media_path,
            'is_accident_detected': self.is_accident_detected,
            'confidence_score': float(self.confidence_score) if self.confidence_score else 0.0,
            'severity': self.severity,
            'detected_objects': self.detected_objects,
            'model_version': self.model_version,
            'inference_time_ms': self.inference_time_ms,
            'created_at': to_iso_utc(self.created_at)
        }
