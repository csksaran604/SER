"""
User Management and Audit Log API Routes
Exclusively restricted to ADMIN roles for system governance.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.role import Role
from backend.models.audit_log import AuditLog
from backend.middleware.auth_middleware import admin_required
from backend.services.audit_service import log_action

users_bp = Blueprint('users', __name__)


@users_bp.route('', methods=['GET'])
@jwt_required()
@admin_required()
def get_users():
    users = User.query.order_by(User.id.asc()).all()
    roles = Role.query.all()
    return jsonify({
        'users': [u.to_dict() for u in users],
        'roles': [r.to_dict() for r in roles]
    }), 200


@users_bp.route('/<int:id>/role', methods=['PUT'])
@jwt_required()
@admin_required()
def update_user_role(id):
    current_admin_id = get_jwt_identity()
    admin_user = db.session.get(User, int(current_admin_id)) if current_admin_id else None

    target_user = db.session.get(User, id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json() or {}
    role_name = data.get('role')

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({'error': f'Role {role_name} does not exist'}), 400

    old_role = target_user.role.name if target_user.role else 'Unknown'
    target_user.role_id = role.id
    
    if 'is_active' in data:
        target_user.is_active = bool(data['is_active'])

    db.session.commit()

    log_action(
        user_id=admin_user.id if admin_user else None,
        username=admin_user.username if admin_user else 'ADMIN',
        action='ROLE_CHANGE',
        entity='User',
        entity_id=target_user.id,
        details=f'Changed user {target_user.username} role from {old_role} to {role.name}'
    )

    return jsonify({
        'message': f'Updated role for {target_user.username}',
        'user': target_user.to_dict()
    }), 200


@users_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_user(id):
    current_admin_id = get_jwt_identity()
    admin_user = db.session.get(User, int(current_admin_id)) if current_admin_id else None

    if int(current_admin_id) == id:
        return jsonify({'error': 'Cannot delete your own active administrator account'}), 400

    target_user = db.session.get(User, id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    username = target_user.username

    db.session.delete(target_user)
    db.session.commit()

    log_action(
        user_id=admin_user.id if admin_user else None,
        username=admin_user.username if admin_user else 'ADMIN',
        action='DELETE_USER',
        entity='User',
        entity_id=id,
        details=f'Deleted user {username}'
    )

    return jsonify({'message': f'User {username} deleted successfully'}), 200


@users_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@admin_required()
def get_audit_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action = request.args.get('action')
    username = request.args.get('username')

    query = AuditLog.query
    if action:
        query = query.filter(AuditLog.action.ilike(f'%{action}%'))
    if username:
        query = query.filter(AuditLog.username.ilike(f'%{username}%'))

    query = query.order_by(AuditLog.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'audit_logs': [log.to_dict() for log in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200
