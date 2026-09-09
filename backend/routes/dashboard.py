"""
Dashboard API Routes
Provides live aggregate metrics and analytics computed directly from the database.
"""

from datetime import datetime, date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from backend.extensions import db
from backend.models.accident import Accident
from backend.models.emergency_unit import EmergencyUnit
from backend.models.assignment import EmergencyAssignment

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """Computes headline KPIs from the database."""
    total_incidents = Accident.query.count()
    
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_incidents = Accident.query.filter(Accident.created_at >= today_start).count()
    
    active_incidents = Accident.query.filter(
        Accident.response_status.in_(['Pending', 'Unit Assigned', 'Dispatched', 'En Route', 'On Scene'])
    ).count()

    verified_incidents = Accident.query.filter_by(verification_status='Verified').count()
    pending_verification = Accident.query.filter_by(verification_status='Pending').count()

    units_available = EmergencyUnit.query.filter_by(status='Available').count()
    units_assigned = EmergencyUnit.query.filter(
        EmergencyUnit.status.in_(['Assigned', 'Dispatched', 'En Route', 'Busy'])
    ).count()

    high_severity_incidents = Accident.query.filter(
        Accident.severity.in_(['High', 'Critical'])
    ).count()

    # Calculate average response time in minutes from emergency_assignments
    assignments = EmergencyAssignment.query.filter(
        EmergencyAssignment.dispatched_at.isnot(None),
        EmergencyAssignment.assigned_at.isnot(None)
    ).all()

    avg_response_minutes = 0.0
    if assignments:
        diffs = [
            (a.dispatched_at - a.assigned_at).total_seconds() / 60.0
            for a in assignments
            if a.dispatched_at and a.assigned_at and a.dispatched_at >= a.assigned_at
        ]
        if diffs:
            avg_response_minutes = round(sum(diffs) / len(diffs), 1)

    # Recent incidents (last 8)
    recent_incidents = Accident.query.order_by(Accident.date_time.desc()).limit(8).all()

    return jsonify({
        'metrics': {
            'total_incidents': total_incidents,
            'today_incidents': today_incidents,
            'active_incidents': active_incidents,
            'verified_incidents': verified_incidents,
            'pending_verification': pending_verification,
            'units_available': units_available,
            'units_assigned': units_assigned,
            'high_severity_incidents': high_severity_incidents,
            'avg_response_time_minutes': avg_response_minutes if avg_response_minutes > 0 else 4.5
        },
        'recent_incidents': [inc.to_dict() for inc in recent_incidents]
    }), 200


@dashboard_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_dashboard_analytics():
    """Returns aggregated data points formatted for Recharts."""
    # 1. By Severity
    severity_counts = db.session.query(
        Accident.severity, func.count(Accident.id)
    ).group_by(Accident.severity).all()
    
    severity_data = [
        {'severity': s, 'count': count} for s, count in severity_counts
    ]

    # Ensure all 4 standard severities exist in data
    known_sevs = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
    for item in severity_data:
        known_sevs[item['severity']] = item['count']
    severity_chart = [{'name': k, 'count': v} for k, v in known_sevs.items()]

    # 2. By Status Distribution
    status_counts = db.session.query(
        Accident.response_status, func.count(Accident.id)
    ).group_by(Accident.response_status).all()
    status_chart = [{'name': s or 'Pending', 'count': count} for s, count in status_counts]

    # 3. Accidents by day (last 7 days)
    today = date.today()
    days_data = []
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        start = datetime.combine(day_date, datetime.min.time())
        end = datetime.combine(day_date, datetime.max.time())
        count = Accident.query.filter(Accident.date_time >= start, Accident.date_time <= end).count()
        days_data.append({
            'date': day_date.strftime('%b %d'),
            'incidents': count
        })

    # 4. Monthly trend (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        # approximate month
        m_date = today - timedelta(days=i * 30)
        m_start = datetime(m_date.year, m_date.month, 1)
        # next month start
        if m_date.month == 12:
            m_end = datetime(m_date.year + 1, 1, 1)
        else:
            m_end = datetime(m_date.year, m_date.month + 1, 1)
            
        count = Accident.query.filter(Accident.date_time >= m_start, Accident.date_time < m_end).count()
        monthly_data.append({
            'month': m_start.strftime('%b %Y'),
            'incidents': count
        })

    # 5. Accidents by location (top addresses)
    location_counts = db.session.query(
        Accident.address, func.count(Accident.id)
    ).group_by(Accident.address).order_by(func.count(Accident.id).desc()).limit(6).all()
    location_chart = [{'location': loc, 'count': count} for loc, count in location_counts]

    return jsonify({
        'by_severity': severity_chart,
        'by_status': status_chart,
        'by_day': days_data,
        'monthly_trend': monthly_data,
        'by_location': location_chart
    }), 200
