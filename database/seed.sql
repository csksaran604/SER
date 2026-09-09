-- =============================================================================
-- AI-Based Smart Emergency Response & Accident Detection System
-- Safe Demo Seed Data
-- =============================================================================

USE smart_emergency_db;

-- 1. Seed System Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Full administrative authority over users, system configs, detections, and response units'),
(2, 'EMERGENCY_OPERATOR', 'Operational control: incident verification, unit dispatch, and response management'),
(3, 'VIEWER', 'Read-only observer access for dashboard, verified incidents, map, and reports')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Demo Users (Passwords all bcrypt hashed with cost 12)
-- admin: Admin@123
-- operator: Operator@123
-- viewer: Viewer@123
INSERT INTO users (id, username, email, password_hash, full_name, role_id, is_active) VALUES
(1, 'admin', 'admin@emergency.system', '$2b$12$1TdVyxr14mupExEFhpBAmer4f.ADeXwENzQ92.pjHqoxMYYoC0nzq', 'DEMO System Administrator', 1, TRUE),
(2, 'operator', 'operator@emergency.system', '$2b$12$CLe7JQhdA6e22HXGhxvG4..CXTUsPy5Mj2GVhkevHvDjlZS9YuObW', 'DEMO Emergency Dispatcher', 2, TRUE),
(3, 'viewer', 'viewer@emergency.system', '$2b$12$40z9vf2.LoP5tRQEv17Y5eDElQUi7tOM8C.wM2fioc1U7jQZxl/dW', 'DEMO Public Safety Observer', 3, TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. Seed Demo Emergency Units
INSERT INTO emergency_units (id, unit_id, vehicle_number, type, driver_name, contact_number, status, latitude, longitude) VALUES
(1, 'AMB-101', 'EMG-NY-7701', 'Ambulance', 'DEMO Officer James Carter', '+1-555-0101', 'Available', 40.7128, -74.0060),
(2, 'AMB-102', 'EMG-NY-7702', 'Ambulance', 'DEMO Paramedic Sarah Jenkins', '+1-555-0102', 'Dispatched', 40.7306, -73.9352),
(3, 'POL-201', 'POL-NY-3301', 'Police', 'DEMO Sergeant Marcus Vance', '+1-555-0201', 'Available', 40.7589, -73.9851),
(4, 'POL-202', 'POL-NY-3302', 'Police', 'DEMO Officer Elena Rostova', '+1-555-0202', 'En Route', 40.7484, -73.9857),
(5, 'FIR-301', 'FIR-NY-9901', 'Fire & Rescue', 'DEMO Captain Robert Hall', '+1-555-0301', 'Available', 40.7112, -74.0123)
ON DUPLICATE KEY UPDATE unit_id=VALUES(unit_id);

-- 4. Seed Demo Detections
INSERT INTO accident_detections (id, detection_uuid, media_type, media_filename, media_path, result_media_path, is_accident_detected, confidence_score, severity, detected_objects, model_version, inference_time_ms) VALUES
(1, 'det-uuid-demo-001', 'image', 'demo_intersection_crash.jpg', 'uploads/images/demo_intersection_crash.jpg', 'uploads/results/demo_intersection_crash_annotated.jpg', TRUE, 89.50, 'High', '["Vehicle Impact", "Sedan", "Motorcycle"]', 'YOLO-Accident-v1.0-DEMO', 142),
(2, 'det-uuid-demo-002', 'image', 'demo_highway_rollover.jpg', 'uploads/images/demo_highway_rollover.jpg', 'uploads/results/demo_highway_rollover_annotated.jpg', TRUE, 94.20, 'Critical', '["Overturned SUV", "Debris Field", "Guardrail Damage"]', 'YOLO-Accident-v1.0-DEMO', 188),
(3, 'det-uuid-demo-003', 'image', 'demo_minor_fender_bender.jpg', 'uploads/images/demo_minor_fender_bender.jpg', 'uploads/results/demo_minor_fender_bender_annotated.jpg', TRUE, 72.00, 'Medium', '["Rear-end Collision", "Sedan", "Pickup Truck"]', 'YOLO-Accident-v1.0-DEMO', 125)
ON DUPLICATE KEY UPDATE detection_uuid=VALUES(detection_uuid);

-- 5. Seed Demo Accidents
INSERT INTO accidents (id, incident_id, detection_id, date_time, latitude, longitude, address, description, severity, ai_confidence, verification_status, response_status, assigned_unit_id, reporter, verified_by_id, verified_at) VALUES
(1, 'INC-2026-001', 1, DATE_SUB(NOW(), INTERVAL 25 MINUTE), 40.7282, -73.9942, 'DEMO: Broadway & 8th St Intersection, NY', 'Multi-vehicle impact detected at high-traffic crossing. Human operator verified structural vehicle damage.', 'High', 89.50, 'Verified', 'Dispatched', 2, 'CCTV Feed #12A', 2, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, 'INC-2026-002', 2, DATE_SUB(NOW(), INTERVAL 12 MINUTE), 40.7484, -73.9857, 'DEMO: Midtown Expressway Mile Marker 4, NY', 'Overturned vehicle on highway lane 2. Severe obstruction with potential medical distress.', 'Critical', 94.20, 'Verified', 'En Route', 4, 'Traffic Bot Camera #44', 2, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(3, 'INC-2026-003', 3, DATE_SUB(NOW(), INTERVAL 4 MINUTE), 40.7180, -73.9990, 'DEMO: Canal St & Bowery, NY', 'Minor rear-end bumper impact. No flames or structural collapse detected.', 'Medium', 72.00, 'Pending', 'Pending', NULL, 'Smart Camera Hub #07', NULL, NULL)
ON DUPLICATE KEY UPDATE incident_id=VALUES(incident_id);

-- 6. Seed Demo Assignments
INSERT INTO emergency_assignments (id, incident_id, unit_id, assigned_by_id, status, notes, assigned_at, dispatched_at) VALUES
(1, 1, 2, 2, 'Dispatched', 'Paramedic unit dispatched to secure injured passengers and clear traffic obstruction.', DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE)),
(2, 2, 4, 2, 'En Route', 'Police cruiser en route to manage highway perimeter and coordinate with incoming medical team.', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 8 MINUTE))
ON DUPLICATE KEY UPDATE incident_id=VALUES(incident_id);

-- 7. Seed Demo Notifications
INSERT INTO notifications (id, title, message, type, severity, is_read, incident_id) VALUES
(1, 'CRITICAL ACCIDENT CONFIRMED', 'Incident INC-2026-002 on Midtown Expressway verified as Critical severity. Unit POL-202 en route.', 'severity', 'critical', FALSE, 2),
(2, 'Emergency Unit Dispatched', 'Ambulance AMB-102 dispatched to Broadway & 8th St (INC-2026-001).', 'assignment', 'warning', FALSE, 1),
(3, 'New AI Detection Pending', 'Potential accident detected at Canal St & Bowery (INC-2026-003). Awaiting operator verification.', 'detection', 'info', FALSE, 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. Seed Demo Audit Logs
INSERT INTO audit_logs (id, user_id, username, action, entity, entity_id, details, ip_address) VALUES
(1, 1, 'admin', 'SYSTEM_INIT', 'SYSTEM', 'CORE', 'System initialized with demo schema and seed configurations', '127.0.0.1'),
(2, 2, 'operator', 'VERIFY_INCIDENT', 'Accident', 'INC-2026-001', 'Operator confirmed high-severity multi-vehicle collision', '127.0.0.1'),
(3, 2, 'operator', 'DISPATCH_UNIT', 'EmergencyUnit', 'AMB-102', 'Assigned and dispatched Ambulance AMB-102 to INC-2026-001', '127.0.0.1'),
(4, 2, 'operator', 'VERIFY_INCIDENT', 'Accident', 'INC-2026-002', 'Operator confirmed critical highway rollover incident', '127.0.0.1');
