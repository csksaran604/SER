# API Reference Documentation

Base URL: `http://localhost:5000/api` (or proxied in frontend via `/api`)

All protected routes require an `Authorization` header formatted as:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication
- `POST /api/auth/register`
  - Body: `{ "username": "...", "email": "...", "password": "...", "full_name": "...", "role": "EMERGENCY_OPERATOR" }`
  - Returns: `{ "token": "...", "user": { ... } }`
- `POST /api/auth/login`
  - Body: `{ "username": "admin", "password": "..." }`
  - Returns: `{ "token": "...", "user": { ... } }`
- `POST /api/auth/logout`
  - Requires JWT. Records logout audit entry.
- `GET /api/auth/me`
  - Requires JWT. Returns current profile.
- `PUT /api/auth/change-password`
  - Requires JWT. Body: `{ "current_password": "...", "new_password": "..." }`

---

## 2. System Diagnostics
- `GET /api/health`
  - Returns database connection state, AI engine state, and service version.

---

## 3. Dashboard Telemetry
- `GET /api/dashboard/summary`
  - Returns headline KPIs (total, today, active, verified, response time, available units) and recent 8 incidents.
- `GET /api/dashboard/analytics`
  - Returns data formatted for Recharts (by severity, by status, 7-day trend, monthly trend, top incident addresses).

---

## 4. AI Vision Inference
- `GET /api/ai/status`
  - Returns model load state, active weights path, and diagnostic info.
- `POST /api/ai/analyze-image`
  - Multipart Form: `file` (image)
  - Returns: `{ "detection": { ... }, "inference_details": { ... } }`
- `POST /api/ai/analyze-video`
  - Multipart Form: `file` (video)
  - Returns: `{ "detection": { ... }, "video_summary": { ... } }`
- `GET /api/ai/detections`
  - Paginated list of historical vision records.
- `GET /api/ai/detections/:id`
  - Detailed single detection record.

---

## 5. Accident Incidents
- `GET /api/accidents`
  - Query params: `severity`, `verification_status`, `response_status`, `search`, `page`, `per_page`.
- `GET /api/accidents/:id`
  - Full details including linked AI media and dispatch timeline.
- `POST /api/accidents`
  - Body: `{ "latitude": ..., "longitude": ..., "address": "...", "severity": "High", "description": "..." }`
- `PUT /api/accidents/:id`
  - Update editable fields (Operator/Admin).
- `DELETE /api/accidents/:id`
  - Remove incident record (Admin only).
- `PUT /api/accidents/:id/verify`
  - Body: `{ "verification_status": "Verified" | "Rejected", "severity": "..." }`
- `PUT /api/accidents/:id/status`
  - Body: `{ "response_status": "Dispatched" | "En Route" | "On Scene" | "Resolved" | "Cancelled" }`

---

## 6. Emergency Units
- `GET /api/emergency-units`
  - Query params: `type`, `status`.
- `GET /api/emergency-units/:id`
- `POST /api/emergency-units`
  - Register new vehicle/officer (Operator/Admin).
- `PUT /api/emergency-units/:id`
  - Modify parameters or status.
- `DELETE /api/emergency-units/:id`
  - Remove unit from active fleet (Admin).

---

## 7. Dispatch Assignments
- `GET /api/assignments`
  - Query params: `incident_id`, `unit_id`.
- `POST /api/assignments`
  - Body: `{ "incident_id": ..., "unit_id": ..., "notes": "..." }`
  - Enforces prior incident verification.
- `PUT /api/assignments/:id/status`
  - Advance status and sync timestamps (`dispatched_at`, `arrived_at`, `resolved_at`).

---

## 8. In-App Notifications
- `GET /api/notifications`
  - Query params: `unread=true`, `severity`, `limit`.
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

---

## 9. Reports & Exports
- `GET /api/reports/accidents`
- `GET /api/reports/severity`
- `GET /api/reports/response-time`
- `GET /api/reports/export-csv`
  - Generates real-time downloadable CSV attachment with query filters applied.

---

## 10. User Management & Auditing (Admin Only)
- `GET /api/users`
- `PUT /api/users/:id/role`
  - Body: `{ "role": "...", "is_active": true/false }`
- `DELETE /api/users/:id`
- `GET /api/users/audit-logs`
  - Query params: `action`, `username`, `page`.
