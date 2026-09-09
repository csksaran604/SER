-- =============================================================================
-- AI-Based Smart Emergency Response & Accident Detection System
-- Database Schema (MySQL Compatible)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS smart_emergency_db;
USE smart_emergency_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Emergency Units Table
CREATE TABLE IF NOT EXISTS emergency_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL UNIQUE,
    vehicle_number VARCHAR(50) NOT NULL,
    type ENUM('Ambulance', 'Police', 'Fire & Rescue') NOT NULL,
    driver_name VARCHAR(120) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    status ENUM('Available', 'Assigned', 'Dispatched', 'Busy', 'Offline') DEFAULT 'Available',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Accident Detections (Raw AI Inference Records)
CREATE TABLE IF NOT EXISTS accident_detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detection_uuid VARCHAR(64) NOT NULL UNIQUE,
    media_type ENUM('image', 'video') NOT NULL,
    media_filename VARCHAR(255) NOT NULL,
    media_path VARCHAR(500) NOT NULL,
    result_media_path VARCHAR(500) NULL,
    is_accident_detected BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(5, 2) DEFAULT 0.00,
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low',
    detected_objects JSON NULL,
    model_version VARCHAR(100) DEFAULT 'v1.0.0',
    inference_time_ms INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Accidents (Managed Incidents)
CREATE TABLE IF NOT EXISTS accidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50) NOT NULL UNIQUE,
    detection_id INT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255) NOT NULL,
    description TEXT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    ai_confidence DECIMAL(5, 2) DEFAULT 0.00,
    verification_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    response_status ENUM('Pending', 'Unit Assigned', 'Dispatched', 'En Route', 'On Scene', 'Resolved', 'Cancelled') DEFAULT 'Pending',
    assigned_unit_id INT NULL,
    reporter VARCHAR(120) DEFAULT 'AI Vision System',
    verified_by_id INT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (detection_id) REFERENCES accident_detections(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_unit_id) REFERENCES emergency_units(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Emergency Assignments
CREATE TABLE IF NOT EXISTS emergency_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    unit_id INT NOT NULL,
    assigned_by_id INT NULL,
    status ENUM('Assigned', 'Dispatched', 'En Route', 'On Scene', 'Resolved', 'Cancelled') DEFAULT 'Assigned',
    notes TEXT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP NULL,
    arrived_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES accidents(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES emergency_units(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    incident_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES accidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    username VARCHAR(80) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100) NULL,
    details TEXT NULL,
    ip_address VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for optimal querying
CREATE INDEX idx_accidents_verification ON accidents(verification_status);
CREATE INDEX idx_accidents_response ON accidents(response_status);
CREATE INDEX idx_accidents_severity ON accidents(severity);
CREATE INDEX idx_accidents_datetime ON accidents(date_time);
CREATE INDEX idx_units_status ON emergency_units(status);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_notifications_read ON notifications(is_read);
