"""
User Model with bcrypt password hashing
"""

import bcrypt
from backend.extensions import db, utc_now, to_iso_utc


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    role = db.relationship('Role', back_populates='users')
    verified_accidents = db.relationship('Accident', back_populates='verified_by', lazy=True)
    assigned_emergency = db.relationship('EmergencyAssignment', back_populates='assigned_by', lazy=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def set_password(self, password: str):
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        """Verify password against stored bcrypt hash."""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role.name if self.role else None,
            'role_id': self.role_id,
            'is_active': self.is_active,
            'last_login': to_iso_utc(self.last_login),
            'created_at': to_iso_utc(self.created_at),
            'updated_at': to_iso_utc(self.updated_at)
        }
