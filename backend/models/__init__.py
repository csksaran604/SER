"""
Models Package Initializer
"""

from backend.models.role import Role
from backend.models.user import User
from backend.models.emergency_unit import EmergencyUnit
from backend.models.accident_detection import AccidentDetection
from backend.models.accident import Accident
from backend.models.assignment import EmergencyAssignment
from backend.models.notification import Notification
from backend.models.audit_log import AuditLog

__all__ = [
    'Role',
    'User',
    'EmergencyUnit',
    'AccidentDetection',
    'Accident',
    'EmergencyAssignment',
    'Notification',
    'AuditLog',
]
