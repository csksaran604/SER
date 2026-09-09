"""
Main Application Entry Point
Initializes Flask, database, extensions, static media serving,
blueprints, and safe demo seeding.
"""

import os
from datetime import datetime, timedelta
from flask import Flask, send_from_directory, jsonify
from backend.config import Config
from backend.extensions import db, jwt, cors
from backend.routes import (
    auth_bp,
    dashboard_bp,
    ai_bp,
    accidents_bp,
    units_bp,
    assignments_bp,
    notifications_bp,
    reports_bp,
    users_bp,
    health_bp
)
from backend.models import Role, User, EmergencyUnit, Accident, AccidentDetection, EmergencyAssignment, Notification, AuditLog


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload directories exist
    Config.init_directories()

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {"origins": "*"},
        r"/uploads/*": {"origins": "*"}
    })

    # Serve uploaded media statically
    @app.route('/uploads/<path:subpath>')
    def serve_upload(subpath):
        return send_from_directory(app.config['UPLOAD_FOLDER'], subpath)

    # Register API blueprints
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(accidents_bp, url_prefix='/api/accidents')
    app.register_blueprint(units_bp, url_prefix='/api/emergency-units')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({'error': 'Missing or invalid Authorization header'}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({'error': 'Signature verification failed'}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    # Global Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    # Auto-initialize database tables and demo seed data if needed
    with app.app_context():
        try:
            db.create_all()
            _seed_demo_data_if_empty()
        except Exception as e:
            print(f"[DATABASE INIT ERROR] {str(e)}")

    return app


def _seed_demo_data_if_empty():
    """Seeds initial roles, demo users, emergency units, and incidents if database is fresh."""
    if Role.query.count() == 0:
        print("[DATABASE SEED] Populating initial roles...")
        roles = [
            Role(id=1, name='ADMIN', description='Full administrative authority over users, system configs, detections, and response units'),
            Role(id=2, name='EMERGENCY_OPERATOR', description='Operational control: incident verification, unit dispatch, and response management'),
            Role(id=3, name='VIEWER', description='Read-only observer access for dashboard, verified incidents, map, and reports')
        ]
        db.session.bulk_save_objects(roles)
        db.session.commit()

    if User.query.count() == 0:
        print("[DATABASE SEED] Populating demo users (Admin, Operator, Viewer)...")
        # Admin user
        admin = User(
            id=1,
            username='admin',
            email='admin@emergency.system',
            full_name='DEMO System Administrator',
            role_id=1,
            is_active=True
        )
        admin.set_password('Admin@123')

        # Operator user
        operator = User(
            id=2,
            username='operator',
            email='operator@emergency.system',
            full_name='DEMO Emergency Dispatcher',
            role_id=2,
            is_active=True
        )
        operator.set_password('Operator@123')

        # Viewer user
        viewer = User(
            id=3,
            username='viewer',
            email='viewer@emergency.system',
            full_name='DEMO Public Safety Observer',
            role_id=3,
            is_active=True
        )
        viewer.set_password('Viewer@123')

        db.session.add_all([admin, operator, viewer])
        db.session.commit()

    if EmergencyUnit.query.count() == 0:
        print("[DATABASE SEED] Populating demo emergency units...")
        units = [
            EmergencyUnit(
                id=1,
                unit_id='AMB-101',
                vehicle_number='EMG-NY-7701',
                type='Ambulance',
                driver_name='DEMO Officer James Carter',
                contact_number='+1-555-0101',
                status='Available',
                latitude=40.7128,
                longitude=-74.0060
            ),
            EmergencyUnit(
                id=2,
                unit_id='AMB-102',
                vehicle_number='EMG-NY-7702',
                type='Ambulance',
                driver_name='DEMO Paramedic Sarah Jenkins',
                contact_number='+1-555-0102',
                status='Dispatched',
                latitude=40.7306,
                longitude=-73.9352
            ),
            EmergencyUnit(
                id=3,
                unit_id='POL-201',
                vehicle_number='POL-NY-3301',
                type='Police',
                driver_name='DEMO Sergeant Marcus Vance',
                contact_number='+1-555-0201',
                status='Available',
                latitude=40.7589,
                longitude=-73.9851
            ),
            EmergencyUnit(
                id=4,
                unit_id='POL-202',
                vehicle_number='POL-NY-3302',
                type='Police',
                driver_name='DEMO Officer Elena Rostova',
                contact_number='+1-555-0202',
                status='En Route',
                latitude=40.7484,
                longitude=-73.9857
            ),
            EmergencyUnit(
                id=5,
                unit_id='FIR-301',
                vehicle_number='FIR-NY-9901',
                type='Fire & Rescue',
                driver_name='DEMO Captain Robert Hall',
                contact_number='+1-555-0301',
                status='Available',
                latitude=40.7112,
                longitude=-74.0123
            )
        ]
        db.session.add_all(units)
        db.session.commit()

    if Accident.query.count() == 0:
        print("[DATABASE SEED] Populating initial demo accident incidents...")
        now = datetime.utcnow()
        inc1 = Accident(
            id=1,
            incident_id='INC-2026-001',
            date_time=now - timedelta(minutes=25),
            latitude=40.7282,
            longitude=-73.9942,
            address='DEMO: Broadway & 8th St Intersection, NY',
            description='Multi-vehicle impact detected at high-traffic crossing. Human operator verified vehicle damage.',
            severity='High',
            ai_confidence=89.5,
            verification_status='Verified',
            response_status='Dispatched',
            assigned_unit_id=2,
            reporter='CCTV Feed #12A',
            verified_by_id=2,
            verified_at=now - timedelta(minutes=20)
        )
        inc2 = Accident(
            id=2,
            incident_id='INC-2026-002',
            date_time=now - timedelta(minutes=12),
            latitude=40.7484,
            longitude=-73.9857,
            address='DEMO: Midtown Expressway Mile Marker 4, NY',
            description='Overturned vehicle on highway lane 2. Severe obstruction with potential medical distress.',
            severity='Critical',
            ai_confidence=94.2,
            verification_status='Verified',
            response_status='En Route',
            assigned_unit_id=4,
            reporter='Traffic Bot Camera #44',
            verified_by_id=2,
            verified_at=now - timedelta(minutes=10)
        )
        inc3 = Accident(
            id=3,
            incident_id='INC-2026-003',
            date_time=now - timedelta(minutes=4),
            latitude=40.7180,
            longitude=-73.9990,
            address='DEMO: Canal St & Bowery, NY',
            description='Minor rear-end bumper impact. No flames or structural collapse detected.',
            severity='Medium',
            ai_confidence=72.0,
            verification_status='Pending',
            response_status='Pending',
            reporter='Smart Camera Hub #07'
        )
        db.session.add_all([inc1, inc2, inc3])
        db.session.commit()

        # Assignments
        assign1 = EmergencyAssignment(
            incident_id=1,
            unit_id=2,
            assigned_by_id=2,
            status='Dispatched',
            notes='Paramedic unit dispatched to secure injured passengers and clear traffic obstruction.',
            assigned_at=now - timedelta(minutes=20),
            dispatched_at=now - timedelta(minutes=18)
        )
        assign2 = EmergencyAssignment(
            incident_id=2,
            unit_id=4,
            assigned_by_id=2,
            status='En Route',
            notes='Police cruiser en route to manage highway perimeter.',
            assigned_at=now - timedelta(minutes=10),
            dispatched_at=now - timedelta(minutes=8)
        )
        db.session.add_all([assign1, assign2])

        # Notifications
        n1 = Notification(
            title='CRITICAL ACCIDENT CONFIRMED',
            message='Incident INC-2026-002 on Midtown Expressway verified as Critical severity. Unit POL-202 en route.',
            type='severity',
            severity='critical',
            incident_id=2
        )
        n2 = Notification(
            title='Emergency Unit Dispatched',
            message='Ambulance AMB-102 dispatched to Broadway & 8th St (INC-2026-001).',
            type='assignment',
            severity='warning',
            incident_id=1
        )
        n3 = Notification(
            title='New AI Detection Pending',
            message='Potential accident detected at Canal St & Bowery (INC-2026-003). Awaiting operator verification.',
            type='detection',
            severity='info',
            incident_id=3
        )
        db.session.add_all([n1, n2, n3])

        # Audit logs
        a1 = AuditLog(
            user_id=1,
            username='admin',
            action='SYSTEM_BOOT',
            entity='SYSTEM',
            entity_id='CORE',
            details='Emergency response server initialized with secure database configuration',
            ip_address='127.0.0.1'
        )
        db.session.add(a1)
        db.session.commit()
        print("[DATABASE SEED] Seed completed successfully.")


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"[SERVER] Starting Smart Emergency Response backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
