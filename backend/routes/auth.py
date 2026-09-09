"""
Authentication API Routes
Handles registration, login, token generation, user profile, and password updates.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from backend.extensions import db
from backend.models.user import User
from backend.models.role import Role
from backend.services.audit_service import log_action

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    role_name = data.get('role', 'VIEWER').strip().upper()

    if not username or not email or not password or not full_name:
        return jsonify({'error': 'All fields (username, email, password, full_name) are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email address is already registered'}), 409

    # Resolve role
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        role = Role.query.filter_by(name='VIEWER').first()
        if not role:
            role = Role(name='VIEWER', description='Observer role')
            db.session.add(role)
            db.session.commit()

    user = User(
        username=username,
        email=email,
        full_name=full_name,
        role_id=role.id
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    log_action(user_id=user.id, username=user.username, action='REGISTER', entity='User', entity_id=user.id, details=f'User registered with role {role.name}')

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Registration successful',
        'token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username_or_email = data.get('username', '').strip()
    password = data.get('password', '')

    if not username_or_email or not password:
        return jsonify({'error': 'Username/email and password are required'}), 400

    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email.lower())
    ).first()

    if not user or not user.check_password(password):
        log_action(username=username_or_email, action='FAILED_LOGIN', entity='Auth', details='Invalid credentials provided')
        return jsonify({'error': 'Invalid username or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is inactive. Contact system administrator.'}), 403

    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    log_action(user_id=user.id, username=user.username, action='LOGIN', entity='User', entity_id=user.id, details='Successful user authentication')

    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if user:
        log_action(user_id=user.id, username=user.username, action='LOGOUT', entity='User', entity_id=user.id, details='User logged out')
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    user.set_password(new_password)
    db.session.commit()

    log_action(user_id=user.id, username=user.username, action='PASSWORD_CHANGE', entity='User', entity_id=user.id, details='Password successfully changed')
    return jsonify({'message': 'Password changed successfully'}), 200
