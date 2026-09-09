"""
Emergency Unit Management Routes
Allows listing, adding, modifying, and tracking emergency response vehicles and personnel.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.emergency_unit import EmergencyUnit
from backend.models.user import User
from backend.middleware.auth_middleware import operator_or_admin_required, admin_required
from backend.services.audit_service import log_action

units_bp = Blueprint('emergency_units', __name__)


@units_bp.route('', methods=['GET'])
@jwt_required()
def get_emergency_units():
    unit_type = request.args.get('type')
    status = request.args.get('status')
    
    query = EmergencyUnit.query
    if unit_type:
        query = query.filter_by(type=unit_type)
    if status:
        query = query.filter_by(status=status)
        
    units = query.order_by(EmergencyUnit.unit_id.asc()).all()
    return jsonify({'units': [u.to_dict() for u in units]}), 200


@units_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_unit_detail(id):
    unit = db.session.get(EmergencyUnit, id)
    if not unit:
        return jsonify({'error': 'Emergency unit not found'}), 404
    return jsonify({'unit': unit.to_dict()}), 200


@units_bp.route('', methods=['POST'])
@jwt_required()
@operator_or_admin_required()
def create_unit():
    data = request.get_json() or {}
    unit_id = data.get('unit_id', '').strip()
    vehicle_number = data.get('vehicle_number', '').strip()
    unit_type = data.get('type', 'Ambulance')
    driver_name = data.get('driver_name', '').strip()
    contact_number = data.get('contact_number', '').strip()
    latitude = float(data.get('latitude', 40.7128))
    longitude = float(data.get('longitude', -74.0060))

    if not unit_id or not vehicle_number or not driver_name or not contact_number:
        return jsonify({'error': 'unit_id, vehicle_number, driver_name, and contact_number are required'}), 400

    if EmergencyUnit.query.filter_by(unit_id=unit_id).first():
        return jsonify({'error': f'Emergency unit with ID "{unit_id}" already exists'}), 409

    unit = EmergencyUnit(
        unit_id=unit_id,
        vehicle_number=vehicle_number,
        type=unit_type,
        driver_name=driver_name,
        contact_number=contact_number,
        status='Available',
        latitude=latitude,
        longitude=longitude
    )

    db.session.add(unit)
    db.session.commit()

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id)) if user_id else None
    log_action(
        user_id=user.id if user else None,
        username=user.username if user else 'SYSTEM',
        action='CREATE_UNIT',
        entity='EmergencyUnit',
        entity_id=unit.unit_id,
        details=f'Created unit {unit.unit_id} ({unit_type})'
    )

    return jsonify({'message': 'Unit created successfully', 'unit': unit.to_dict()}), 201


@units_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@operator_or_admin_required()
def update_unit(id):
    unit = db.session.get(EmergencyUnit, id)
    if not unit:
        return jsonify({'error': 'Emergency unit not found'}), 404
    data = request.get_json() or {}

    if 'vehicle_number' in data:
        unit.vehicle_number = data['vehicle_number'].strip()
    if 'driver_name' in data:
        unit.driver_name = data['driver_name'].strip()
    if 'contact_number' in data:
        unit.contact_number = data['contact_number'].strip()
    if 'type' in data:
        unit.type = data['type']
    if 'status' in data:
        unit.status = data['status']
    if 'latitude' in data:
        unit.latitude = float(data['latitude'])
    if 'longitude' in data:
        unit.longitude = float(data['longitude'])

    unit.last_updated = datetime.now(timezone.utc)
    db.session.commit()

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id)) if user_id else None
    log_action(
        user_id=user.id if user else None,
        username=user.username if user else 'SYSTEM',
        action='UPDATE_UNIT',
        entity='EmergencyUnit',
        entity_id=unit.unit_id,
        details=f'Updated unit {unit.unit_id} status/details'
    )

    return jsonify({'message': 'Unit updated successfully', 'unit': unit.to_dict()}), 200


@units_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_unit(id):
    unit = db.session.get(EmergencyUnit, id)
    if not unit:
        return jsonify({'error': 'Emergency unit not found'}), 404
    unit_code = unit.unit_id

    db.session.delete(unit)
    db.session.commit()

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id)) if user_id else None
    log_action(
        user_id=user.id if user else None,
        username=user.username if user else 'ADMIN',
        action='DELETE_UNIT',
        entity='EmergencyUnit',
        entity_id=unit_code,
        details=f'Deleted emergency unit {unit_code}'
    )

    return jsonify({'message': f'Unit {unit_code} deleted successfully'}), 200
