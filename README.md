# AI-Based Smart Emergency Response & Accident Detection System

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%20Flask-blue.svg)](#)
[![React](https://img.shields.io/badge/React-18%2B%20%7C%20Vite-cyan.svg)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%20v3-38bdf8.svg)](#)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20SQLite%20Fallback-amber.svg)](#)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet%20%7C%20OSM-green.svg)](#)

---

## 1. Project Overview

The **AI-Based Smart Emergency Response & Accident Detection System (SER System)** is a mission-critical public safety platform that integrates deep-learning computer vision with emergency operations management.

Surveillance camera feeds or uploaded road traffic imagery and video clips are preprocessed and analyzed by a modular computer vision pipeline to identify vehicular impacts, rollovers, debris fields, and collisions. Results are assigned confidence ratings and severity grades (`Low`, `Medium`, `High`, `Critical`).

To maintain real-world public safety integrity, the platform strictly enforces a **Human-in-the-Loop** verification policy: an emergency operator must confirm or reject the AI detection result before dispatching emergency response units (Ambulances, Police cruisers, or Fire & Rescue teams).

---

## 2. Key Features

- **AI-Powered Vision Pipeline**: Upload and inspect images and videos with configurable frame extraction intervals, bounding box rendering, and vehicle impact tagging.
- **Scientific Integrity Assurance**: If custom trained collision weights are absent, the system transparently indicates a **Diagnostic / Unconfigured Mode** rather than falsely claiming a generic object detector detects accidents.
- **Human-in-the-Loop Verification**: Incident tickets start in `Pending` verification status. Verification is required before units can be dispatched.
- **Tactical Dispatch Lifecycle**: Full state progression: `AI Detection` &rarr; `Pending Verification` &rarr; `Verified Incident` &rarr; `Unit Assigned` &rarr; `Dispatched` &rarr; `En Route` &rarr; `On Scene` &rarr; `Resolved`.
- **Geospatial Tactical Map**: Leaflet and OpenStreetMap integration showing color-coded incident hotspots and emergency unit positions.
- **Fleet Management**: Monitor and allocate Ambulances, Police units, and Fire & Rescue teams with status tracking (`Available`, `Assigned`, `Dispatched`, `Busy`, `Offline`).
- **Real-Time Analytics & Reporting**: Live KPI cards, Recharts visualizations, date/severity/verification filtering, and CSV export.
- **Role-Based Access Control (RBAC)**: Secure multi-tier permissions (`ADMIN`, `EMERGENCY_OPERATOR`, `VIEWER`) backed by bcrypt hashing and JWT tokens.
- **Audit Logging**: Immutable system logging of all logins, role modifications, incident verifications, and dispatches.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark Ops Emergency Cockpit Theme)
- **Navigation**: React Router DOM v6
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Mapping**: Leaflet & React-Leaflet (CartoDB Dark Tiles & OpenStreetMap)
- **HTTP Client**: Axios with JWT Interceptors

### Backend
- **Core**: Python Flask REST API
- **ORM & Database**: Flask-SQLAlchemy, PyMySQL (with automatic zero-config SQLite local fallback)
- **Security**: Flask-JWT-Extended, bcrypt (cost factor 12)
- **Environment**: python-dotenv, Flask-CORS

### Computer Vision Core
- **Engine**: OpenCV (cv2), Pillow, NumPy
- **Deep Learning**: Ultralytics YOLO & PyTorch architecture support

---

## 4. Project Directory Structure

```
smart-emergency-response/
│
├── frontend/                     # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/           # Reusable UI (Sidebar, Navbar, Badges, Modals)
│   │   ├── context/              # Authentication Context & RBAC hooks
│   │   ├── layouts/              # Dashboard shell layout
│   │   ├── pages/                # 14 complete operational views
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AccidentDetectionPage.jsx
│   │   │   ├── IncidentsPage.jsx
│   │   │   ├── IncidentDetailPage.jsx
│   │   │   ├── LiveMapPage.jsx
│   │   │   ├── EmergencyUnitsPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   ├── AuditLogsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/             # Axios API client (api.js)
│   │   ├── App.jsx               # Route definitions & guards
│   │   ├── main.jsx
│   │   └── index.css             # Glassmorphism, pulses, Leaflet theme
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      # Python Flask REST API
│   ├── app.py                    # Server entrypoint & auto-seeder
│   ├── config.py                 # MySQL & fallback configuration
│   ├── extensions.py             # SQLAlchemy, JWT, CORS instances
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   ├── models/                   # SQLAlchemy relational models
│   │   ├── role.py
│   │   ├── user.py
│   │   ├── emergency_unit.py
│   │   ├── accident_detection.py
│   │   ├── accident.py
│   │   ├── assignment.py
│   │   ├── notification.py
│   │   └── audit_log.py
│   ├── routes/                   # REST API Blueprints
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── ai.py
│   │   ├── accidents.py
│   │   ├── emergency_units.py
│   │   ├── assignments.py
│   │   ├── notifications.py
│   │   ├── reports.py
│   │   ├── users.py
│   │   └── health.py
│   ├── services/                 # Business logic & AI adapter
│   │   ├── ai_service.py
│   │   ├── audit_service.py
│   │   └── notification_service.py
│   ├── middleware/               # RBAC role guards
│   ├── tests/                    # Pytest test suite
│   │   └── test_backend.py
│   └── uploads/                  # Ingested & annotated media
│       ├── images/
│       ├── videos/
│       └── results/
│
├── ai/                           # AI Computer Vision Engine
│   ├── accident_detection.py     # Inference loader & diagnostic engine
│   ├── image_processing.py       # Validation, BBox rendering & banners
│   ├── video_processing.py       # Frame sampling & timeline aggregator
│   ├── requirements.txt
│   └── models/                   # Location for accident_model.pt
│
├── database/                     # SQL DDL & DML scripts
│   ├── schema.sql                # Full MySQL schema
│   └── seed.sql                  # Safe demo seed data
│
├── docs/                         # Technical documentation
│   ├── architecture.md
│   └── api_documentation.md
│
└── README.md
```

---

## 5. Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MySQL Server (optional; if not running, backend seamlessly initializes SQLite fallback)

### Step 1: Database Setup (MySQL)
If using MySQL, create the database and run the schema:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 2: Backend Configuration
Navigate to the `backend/` folder and create your `.env`:
```bash
cp backend/.env.example backend/.env
```
Configure your credentials in `backend/.env`:
```ini
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=smart_emergency_db
MYSQL_USER=root
MYSQL_PASSWORD=your_password
JWT_SECRET_KEY=super-secret-emergency-jwt-key-2026-production
```
*Note: If `MYSQL_HOST`, `MYSQL_USER`, or `MYSQL_PASSWORD` are not specified, the system will automatically utilize localized SQLite (`smart_emergency.db`) with full tables and seed data.*

Install Python dependencies:
```bash
pip install -r backend/requirements.txt
```

### Step 3: Frontend Setup
Navigate to `frontend/` and install npm dependencies:
```bash
cd frontend
npm install
```

---

## 6. How to Run

### Run Backend (Port 5000)
```bash
python -m backend.app
```
The backend API server will start on `http://localhost:5000`.

### Run Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. Pre-Configured Demo Credentials

For immediate testing, quick-fill buttons are embedded on the Login page:

| Role | Username | Password | Access Clearance |
|------|----------|----------|-------------------|
| **ADMIN** | `admin` | `Admin@123` | Full control: Users, Auditing, Verification, Fleet, Telemetry |
| **EMERGENCY OPERATOR** | `operator` | `Operator@123` | Operational: AI Analysis, Human Verification, Unit Dispatch, Lifecycle Management |
| **VIEWER** | `viewer` | `Viewer@123` | Read-only: Dashboard telemetry, Verified Incidents, Live Map, Reports |

---

## 8. AI Model Integration & Integrity

### Adding Trained Weights
1. Train or download an accident detection model (e.g., custom YOLO trained on road collision datasets).
2. Save the weights file to:
   ```
   ai/models/accident_model.pt
   ```
3. Or set the custom path in your `.env`:
   ```ini
   ACCIDENT_MODEL_PATH=/path/to/custom_weights.pt
   ```
4. Restart the backend server. The AI Engine diagnostic chip will automatically display **"Trained Accident Weights Active"**.

### Diagnostic Mode (Safe Fallback)
If custom weights are not installed, the platform operates in **Diagnostic Mode**. Sample test road camera images with simulated collisions are pre-seeded in `backend/uploads/images/` for instant end-to-end evaluation.

---

## 9. Automated Testing

Run the automated backend test suite:
```bash
python -m pytest backend/tests/test_backend.py -v
```

Tests verify:
- Health check and database engine diagnostics
- Authentication and JWT token issuance
- Role-based access control (Admin, Operator, Viewer)
- Incident verification workflow
- Emergency unit fleet listing and assignment

---

## 10. Scientific Limitations & Ethical Guidelines

1. **Probabilistic Nature**: AI models provide statistical inference based on image features. No automated computer vision system can guarantee 100% detection accuracy under adverse lighting, extreme weather, or camera occlusion.
2. **Human Verification Requirement**: Automated dispatch is strictly blocked until a human dispatcher visually reviews the evidence.
3. **Privacy by Design**: No real personal identifiable information is collected or stored in demo datasets.

---

## 11. Future Roadmap

- Real-time video RTSP streaming integration for municipal CCTV cameras.
- WebRTC video call integration for incoming 911 citizen video callers.
- External webhook adapters for Twilio SMS / AWS SNS emergency paging.
- Automated drone reconnaissance dispatch module.
