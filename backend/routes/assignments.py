"""
Emergency Assignment Routes
Coordinates unit dispatching, en-route tracking, arrival, and resolution timestamps.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.assignment import EmergencyAssignment
from backend.models.accident import Accident
from backend.models.emergency_unit import EmergencyUnit
from backend.models.user import User
from backend.middleware.auth_middleware import operator_or_admin_required
from backend.services.audit_service import log_action
from backend.services.notification_service import create_notification

assignments_bp = Blueprint('assignments', __name__)


@assignments_bp.route('', methods=['GET'])
@jwt_required()
def get_assignments():
    incident_id = request.args.get('incident_id', type=int)
    unit_id = request.args.get('unit_id', type=int)
    
    query = EmergencyAssignment.query
    if incident_id:
        query = query.filter_by(incident_id=incident_id)
    if unit_id:
        query = query.filter_by(unit_id=unit_id)

    assignments = query.order_by(EmergencyAssignment.assigned_at.desc()).all()
    return jsonify({'assignments': [a.to_dict() for a in assignments]}), 200


@assignments_bp.route('', methods=['POST'])
@jwt_required()
@operator_or_admin_required()
def create_assignment():
    data = request.get_json() or {}
    incident_id = data.get('incident_id')
    unit_id = data.get('unit_id')
    notes = data.get('notes', '').strip()

    if not incident_id or not unit_id:
        return jsonify({'error': 'incident_id and unit_id are required'}), 400

    accident = db.session.get(Accident, incident_id)
    if not accident:
        return jsonify({'error': 'Incident not found'}), 404
    unit = db.session.get(EmergencyUnit, unit_id)
    if not unit:
        return jsonify({'error': 'Emergency unit not found'}), 404

    # Enforce human verification before assigning/dispatching response units
    if accident.verification_status != 'Verified':
        return jsonify({
            'error': 'Incident Not Verified',
            'message': 'Cannot assign emergency response units to an unverified or pending incident. Verification required first.'
        }), 400

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id)) if user_id else None

    assignment = EmergencyAssignment(
        incident_id=accident.id,
        unit_id=unit.id,
        assigned_by_id=user.id if user else None,
        status='Assigned',
        notes=notes,
        assigned_at=datetime.now(timezone.utc)
    )

    accident.assigned_unit_id = unit.id
    accident.response_status = 'Unit Assigned'
    unit.status = 'Assigned'

    db.session.add(assignment)
    db.session.commit()

    log_action(
        user_id=user.id if user else None,
        username=user.username if user else 'SYSTEM',
        action='ASSIGN_UNIT',
        entity='EmergencyAssignment',
        entity_id=assignment.id,
        details=f'Assigned {unit.unit_id} ({unit.type}) to incident {accident.incident_id}'
    )

    create_notification(
        title=f"Unit Assigned: {unit.unit_id}",
        message=f"{unit.type} unit {unit.unit_id} allocated to {accident.incident_id}.",
        notification_type='assignment',
        severity='warning',
        incident_id=accident.id
    )

    return jsonify({
        'message': 'Unit assigned successfully',
        'assignment': assignment.to_dict()
    }), 201


@assignments_bp.route('/<int:id>/status', methods=['PUT'])
@jwt_required()
@operator_or_admin_required()
def update_assignment_status(id):
    assignment = db.session.get(EmergencyAssignment, id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    data = request.get_json() or {}
    new_status = data.get('status')

    valid_statuses = ['Assigned', 'Dispatched', 'En Route', 'On Scene', 'Resolved', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Allowed: {valid_statuses}'}), 400

    now = datetime.now(timezone.utc)
    assignment.status = new_status
    
    if new_status == 'Dispatched' and not assignment.dispatched_at:
        assignment.dispatched_at = now
    elif new_status == 'On Scene' and not assignment.arrived_at:
        assignment.arrived_at = now
    elif new_status in ['Resolved', 'Cancelled'] and not assignment.resolved_at:
        assignment.resolved_at = now

    # Synchronize incident and unit status
    accident = assignment.incident
    unit = assignment.unit

    if accident:
        accident.response_status = new_status
        accident.updated_at = now

    if unit:
        if new_status in ['Resolved', 'Cancelled']:
            unit.status = 'Available'
        elif new_status == 'Dispatched':
            unit.status = 'Dispatched'
        elif new_status in ['En Route', 'On Scene']:
            unit.status = 'Busy'

    db.session.commit()

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    log_action(
        user_id=user.id if user else None,
        username=user.username if user else 'SYSTEM',
        action='ASSIGNMENT_STATUS',
        entity='EmergencyAssignment',
        entity_id=assignment.id,
        details=f'Assignment {assignment.id} status progressed to {new_status}'
    )

    return jsonify({
        'message': f'Assignment status updated to {new_status}',
        'assignment': assignment.to_dict()
    }), 200
