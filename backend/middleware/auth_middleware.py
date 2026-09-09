"""
Authentication & Role-Based Access Control (RBAC) Middleware
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from backend.extensions import db
from backend.models.user import User


def role_required(*allowed_roles):
    """Decorator to enforce that the authenticated user possesses one of the allowed roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.session.get(User, int(user_id)) if user_id else None
            if not user or not user.is_active:
                return jsonify({'error': 'Unauthorized user account or deactivated'}), 401
            
            user_role = user.role.name if user.role else 'VIEWER'
            if user_role not in allowed_roles:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'Access restricted. Requires one of roles: {list(allowed_roles)}. Your role is {user_role}.'
                }), 403
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required():
    return role_required('ADMIN')


def operator_or_admin_required():
    return role_required('ADMIN', 'EMERGENCY_OPERATOR')


def get_current_user():
    """Retrieve currently authenticated User object or None."""
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return db.session.get(User, int(user_id))
    except Exception:
        pass
    return None
