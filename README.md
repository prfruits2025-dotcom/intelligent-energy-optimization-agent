# ⚡ Intelligent Energy Optimization Agent (IEOA)
### Final Year Engineering Project — Department of EEE / ECE / CSE

> A full-stack AI + IoT energy management platform that **simulates industrial sensors**, detects wastage, and autonomously optimizes power consumption in real-time — **no hardware required**.

---

## 🖼️ Screenshots

| Landing Page | Dashboard | Device Control |
|---|---|---|
| Futuristic hero + stats | Live KPIs + charts | ON/OFF + auto mode |

| AI Optimizer | Analytics | Automation |
|---|---|---|
| Recommendations engine | Recharts visualizations | Rule-based engine |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Tailwind CSS + Framer Motion |
| **Charts** | Recharts (Area, Bar, Line, Pie, RadialBar) |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite (via better-sqlite3) |
| **Simulation** | JavaScript interval-based IoT faker |
| **Fonts** | Orbitron + Rajdhani (Google Fonts) |

---

## 📁 Folder Structure

```
intelligent-energy-agent/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── cards/
│   │   │   │   ├── MetricCard.jsx
│   │   │   │   ├── DeviceCard.jsx
│   │   │   │   └── GlassCard.jsx
│   │   │   └── charts/
│   │   │       ├── ConsumptionChart.jsx
│   │   │       ├── PieDistribution.jsx
│   │   │       └── WeeklyTrend.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DeviceControl.jsx
│   │   │   ├── AIOptimizer.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Automation.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   ├── useInterval.js
│   │   │   ├── useAnimatedCounter.js
│   │   │   └── useSensorSimulator.js
│   │   ├── utils/
│   │   │   ├── dataGenerators.js
│   │   │   └── constants.js
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── routes/
│   │   ├── devices.js
│   │   ├── sensors.js
│   │   ├── analytics.js
│   │   ├── automation.js
│   │   └── reports.js
│   ├── db/
│   │   ├── schema.sql
│   │   ├── seed.js
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── logger.js
│   ├── simulator/
│   │   └── iotSimulator.js     # Fake IoT data engine
│   └── index.js
│
├── EnergyApp.jsx               # ← Single-file React prototype (this file)
└── README.md
```

---

## 🔌 API Routes

### Devices
```
GET    /api/devices              → List all devices
GET    /api/devices/:id          → Get device by ID
PUT    /api/devices/:id/toggle   → Toggle device ON/OFF
PUT    /api/devices/:id/auto     → Toggle automation mode
POST   /api/devices              → Add new device
DELETE /api/devices/:id          → Remove device
```

### Sensors (IoT Simulation)
```
GET    /api/sensors/live         → Current voltage, current, power, temp, freq, pf
GET    /api/sensors/history      → Last 24h sensor readings
GET    /api/sensors/hourly       → Hourly aggregated data
```

### Analytics
```
GET    /api/analytics/daily      → Daily consumption breakdown
GET    /api/analytics/weekly     → 7-day trend
GET    /api/analytics/monthly    → Monthly summary
GET    /api/analytics/devices    → Per-device usage stats
GET    /api/analytics/cost       → Cost analysis with tariff slabs
```

### AI Optimizer
```
GET    /api/ai/recommendations   → Active optimization suggestions
POST   /api/ai/apply/:id         → Apply a recommendation
GET    /api/ai/score             → Current efficiency score
GET    /api/ai/forecast          → 48-hour demand forecast
```

### Automation
```
GET    /api/automation/rules     → List all automation rules
POST   /api/automation/rules     → Create new rule
PUT    /api/automation/rules/:id → Update rule
DELETE /api/automation/rules/:id → Delete rule
GET    /api/automation/log       → Execution history
```

### Reports
```
POST   /api/reports/generate     → Generate report (type in body)
GET    /api/reports/list         → List generated reports
GET    /api/reports/download/:id → Download report file
```

---

## 🗃️ Database Schema

```sql
-- Devices table
CREATE TABLE devices (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,           -- ac, lights, fan, machine, plug
  location    TEXT,
  power_watts INTEGER DEFAULT 0,
  status      INTEGER DEFAULT 0,       -- 0=OFF, 1=ON
  auto_mode   INTEGER DEFAULT 0,
  efficiency  INTEGER DEFAULT 90,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sensor readings table
CREATE TABLE sensor_readings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   INTEGER REFERENCES devices(id),
  voltage     REAL,
  current_a   REAL,
  power_kw    REAL,
  temperature REAL,
  frequency   REAL,
  power_factor REAL,
  timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Energy consumption table
CREATE TABLE energy_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        DATE NOT NULL,
  hour        INTEGER,                 -- 0–23
  kwh         REAL,
  cost_inr    REAL,
  peak        INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Automation rules table
CREATE TABLE automation_rules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  trigger_def TEXT,                    -- JSON trigger definition
  action_def  TEXT,                    -- JSON action definition
  active      INTEGER DEFAULT 1,
  savings_day REAL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT,
  description TEXT,
  severity    TEXT,                    -- high, medium, low
  savings_day REAL,
  confidence  INTEGER,
  applied     INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Automation execution log
CREATE TABLE automation_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_id     INTEGER REFERENCES automation_rules(id),
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  result      TEXT
);
```

---

## 🌱 Sample Seed Data

```javascript
// Seed devices
const devices = [
  { name: "Central AC Unit",      type: "ac",      power: 3200, location: "Main Hall",   efficiency: 87 },
  { name: "Industrial Lighting",  type: "lights",  power: 850,  location: "Floor 1",     efficiency: 92 },
  { name: "Server Room Cooling",  type: "ac",      power: 2100, location: "Server Room", efficiency: 78 },
  { name: "CNC Machine #1",       type: "machine", power: 5500, location: "Workshop A",  efficiency: 95 },
  { name: "Smart LED Grid",       type: "lights",  power: 420,  location: "Office",      efficiency: 96 },
  { name: "Conveyor Motor",       type: "machine", power: 7800, location: "Production",  efficiency: 82 },
  { name: "Exhaust Fans (x4)",    type: "fan",     power: 1200, location: "Factory",     efficiency: 89 },
  { name: "Smart Plug Cluster",   type: "plug",    power: 680,  location: "Break Room",  efficiency: 94 },
];
```

---

## 🚀 How to Run

### Option 1: Open EnergyApp.jsx in Claude Artifacts
The `EnergyApp.jsx` file is a **self-contained React prototype** that runs directly in Claude's artifact renderer. No setup needed.

### Option 2: Full Stack Setup

```bash
# Clone and install
git clone https://github.com/your-repo/intelligent-energy-agent
cd intelligent-energy-agent

# Backend
cd server
npm install
node db/seed.js    # Seed the database
node index.js      # Start at http://localhost:5000

# Frontend
cd ../client
npm install
npm run dev        # Start at http://localhost:5173
```

### Demo Credentials
```
Email:    admin@energyops.in
Password: demo1234
```

---

## ✨ Features Checklist

- [x] Futuristic dark landing page with animated stats
- [x] Secure login page with demo access
- [x] Live dashboard with animated KPI counters
- [x] Real-time sensor simulation (2s updates)
- [x] Device ON/OFF toggle + smart auto mode
- [x] AI recommendation engine with confidence scores
- [x] Interactive Recharts (Area, Bar, Line, Pie)
- [x] Automation rules engine with execution log
- [x] Report generation with download simulation
- [x] Admin settings with threshold sliders
- [x] Toast notification system
- [x] Sidebar navigation with collapse
- [x] Fully responsive mobile layout
- [x] SQLite database schema + seed data
- [x] REST API route definitions

---

## 👨‍💻 Project Info

| Field | Details |
|-------|---------|
| **Project Title** | Intelligent Energy Optimization Agent |
| **Department** | Electrical & Electronics Engineering |
| **Academic Year** | 2024–25 |
| **Platform** | Software-only IoT Prototype |
| **Simulation** | JavaScript-based fake IoT sensor engine |
| **Hardware** | Not required (software simulation) |

---

*Built as a final year engineering project demonstrating AI + IoT integration for industrial energy management.*
