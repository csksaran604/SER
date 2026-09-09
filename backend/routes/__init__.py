"""
Routes Package Initializer
"""

from backend.routes.auth import auth_bp
from backend.routes.dashboard import dashboard_bp
from backend.routes.ai import ai_bp
from backend.routes.accidents import accidents_bp
from backend.routes.emergency_units import units_bp
from backend.routes.assignments import assignments_bp
from backend.routes.notifications import notifications_bp
from backend.routes.reports import reports_bp
from backend.routes.users import users_bp
from backend.routes.health import health_bp

__all__ = [
    'auth_bp',
    'dashboard_bp',
    'ai_bp',
    'accidents_bp',
    'units_bp',
    'assignments_bp',
    'notifications_bp',
    'reports_bp',
    'users_bp',
    'health_bp'
]
