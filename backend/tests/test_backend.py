"""
Backend Automated Test Suite
Tests authentication, role-based access control, incident verification,
and emergency unit assignment.
"""

import pytest
import json
from backend.app import create_app
from backend.extensions import db
from backend.models import User, Accident, EmergencyUnit


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert 'database' in data
    assert 'ai_engine' in data


def test_admin_login(client):
    res = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Admin@123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'token' in data
    assert data['user']['role'] == 'ADMIN'


def test_operator_login(client):
    res = client.post('/api/auth/login', json={
        'username': 'operator',
        'password': 'Operator@123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'token' in data
    assert data['user']['role'] == 'EMERGENCY_OPERATOR'


def test_dashboard_summary_requires_auth(client):
    res = client.get('/api/dashboard/summary')
    assert res.status_code == 401


def test_dashboard_summary_with_token(client):
    login_res = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Admin@123'
    })
    token = login_res.get_json()['token']
    res = client.get('/api/dashboard/summary', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'metrics' in data
    assert data['metrics']['total_incidents'] >= 3


def test_viewer_restricted_from_admin_routes(client):
    login_res = client.post('/api/auth/login', json={
        'username': 'viewer',
        'password': 'Viewer@123'
    })
    token = login_res.get_json()['token']
    # Viewer tries to access users list
    res = client.get('/api/users', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 403


def test_accident_verification_workflow(client):
    # Operator logs in
    login_res = client.post('/api/auth/login', json={
        'username': 'operator',
        'password': 'Operator@123'
    })
    token = login_res.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Verify incident 3 (which starts as Pending)
    res = client.put('/api/accidents/3/verify', headers=headers, json={
        'verification_status': 'Verified',
        'severity': 'Medium'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['accident']['verification_status'] == 'Verified'

    # Now assign unit 1 (Ambulance AMB-101)
    assign_res = client.post('/api/assignments', headers=headers, json={
        'incident_id': 3,
        'unit_id': 1,
        'notes': 'Dispatching ambulance to Canal St'
    })
    assert assign_res.status_code == 201
    assign_data = assign_res.get_json()
    assert assign_data['assignment']['status'] == 'Assigned'


def test_emergency_units_listing(client):
    login_res = client.post('/api/auth/login', json={
        'username': 'operator',
        'password': 'Operator@123'
    })
    token = login_res.get_json()['token']
    res = client.get('/api/emergency-units', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 200
    units = res.get_json()['units']
    assert len(units) >= 5
