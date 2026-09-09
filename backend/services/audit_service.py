"""
Audit Service
Centralized logging for actions, security events, and record modifications.
"""

from flask import request
from backend.extensions import db
from backend.models.audit_log import AuditLog


def log_action(user_id=None, username="SYSTEM", action="UNKNOWN", entity="SYSTEM", entity_id=None, details=None):
    """Safely records an audit log entry."""
    try:
        ip_address = None
        if request:
            ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
            if ip_address and ',' in ip_address:
                ip_address = ip_address.split(',')[0].strip()
        
        entry = AuditLog(
            user_id=user_id,
            username=username,
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id is not None else None,
            details=details,
            ip_address=ip_address
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[AUDIT LOG ERROR] Failed to record audit log: {str(e)}")
