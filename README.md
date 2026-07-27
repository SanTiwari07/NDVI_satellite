# MindstriX Satellite Farm Analysis

> **Real-time satellite remote sensing and agronomy intelligence for precision agriculture.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-API-4285F4?logo=google&logoColor=white)](https://earthengine.google.com/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture Overview](#-architecture-overview)
- [Documentation](#-documentation)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Overview](#-api-overview)
- [Satellite Analysis](#-satellite-analysis)
- [Contributing](#-contributing)
- [Authors](#-authors)

---

## 🌍 Overview

### Purpose

MindstriX is a full-stack satellite agronomy intelligence platform that delivers high-resolution multi-spectral and radar satellite imagery analysis directly to farm-level workflows. The platform transforms raw Sentinel-2 optical and Sentinel-1 SAR radar bands into actionable vegetation health heatmaps, soil moisture assessments, and AI-grounded agronomic recommendations.

### Problem Statement

Small and medium-scale farmers lack access to affordable, real-time satellite crop health monitoring. Traditional field scouting is slow, expensive, and incomplete. Cloud-based satellite processing platforms are complex and not optimized for the agronomist or farmer workflow.

### High-Level Overview

MindstriX bridges the gap by providing:

- A **React/Vite** interactive mapping frontend where farmers draw their farm boundaries on a Leaflet map.
- A **Flask REST API backend** that processes GeoJSON farm polygon submissions through the **Google Earth Engine Python API**, producing Sentinel-2 median composites, vegetation index heatmaps, and farm-wide statistical summaries.
- An independent **Sentinel-1 SAR radar pipeline** for cloud-penetrating soil moisture and vegetation structure analysis.
- A **Krishi Mitra AI chatbot** (LangChain + Ollama) grounded with live farm analysis statistics for natural language agronomic Q&A.
- A **9-step farmer onboarding flow** backed by PostgreSQL + PostGIS for persistent farmer and farm data.
- **Firebase Phone OTP authentication** for secure, mobile-first user login.

### Key Objectives

- Deliver cloud-free vegetation index analysis (NDVI, EVI, SAVI, NDMI, NDWI, GNDVI, CVI) at 10 m resolution.
- Provide radar-derived soil moisture (SMI) and radar vegetation index (RVI) from Sentinel-1 independent of weather conditions.
- Enable per-cell hover-sampled pixel values for interactive precision inspection.
- Ground an AI agronomy assistant on live satellite-derived farm metrics.

---

## ✅ Features

All features listed below are implemented in the current codebase.

| Feature | Location |
|---|---|
| Interactive Leaflet map with polygon drawing | `frontend/src/MapView.jsx`, `HeatmapLayer.jsx` |
| Farm boundary delineation and rendering | `frontend/src/MapView.jsx` |
| Sentinel-2 cloud-free median composite (90-day lookback) | `backend/services/gee_service.py` |
| SCL-based per-pixel cloud/shadow masking | `backend/services/gee_service.py` |
| Vegetation index computation (NDVI, EVI, SAVI, NDMI, NDWI, GNDVI, CVI) | `backend/services/index_service.py` |
| Sentinel-1 SAR radar pipeline (speckle filter, VV/VH composite) | `backend/services/sar_service.py` |
| Radar index computation (SMI, RVI, VV/VH Ratio) | `backend/services/radar_index_service.py` |
| 10m heatmap grid generation with Gaussian smoothing | `backend/services/grid_service.py`, `radar_grid_service.py` |
| GEE bicubic-smoothed tile URL generation | `backend/services/gee_service.py` |
| Single-date Sentinel-2 analysis | `backend/app.py` (`/api/analyze-day`) |
| Available acquisition dates listing (S2 and S1) | `backend/app.py` (`/api/analyze-dates`, `/api/analyze-radar-dates`) |
| Single-pixel hover sampling API | `backend/app.py` (`/api/sample`) |
| Optical vs. Radar layer mode toggle | `frontend/src/LayerToggle.jsx` |
| Farm statistics sidebar | `frontend/src/FarmSummary.jsx`, `Legend.jsx` |
| Timeline bar for date navigation | `frontend/src/TimelineBar.jsx` |
| Krishi Mitra AI chatbot (LangChain + Ollama, session memory) | `backend/chatbot/` |
| Firebase Phone OTP authentication | `backend/blueprints/auth.py`, `backend/services/sms_service.py` |
| Firebase JWT verification | `backend/services/auth_service.py` |
| 8-step farmer onboarding flow | `frontend/src/pages/steps/`, `backend/blueprints/` |
| PostgreSQL + PostGIS data persistence | `backend/db/`, `backend/repositories/`, `schema.sql` |
| Firestore ephemeral session synchronisation | `backend/firestore/` |
| Protected routes & JWT-based session | `frontend/src/App.jsx` |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| React Router DOM | 7 | Client-side routing |
| Leaflet / react-leaflet | 1.9 / 5.0 | Interactive map rendering |
| leaflet-draw | 1.0 | Polygon drawing tools |
| Recharts | 3 | Data visualization charts |
| Axios | 1 | HTTP API client |
| Turf.js | 7 | GeoJSON geometry operations |
| Tailwind CSS | 3 | Utility-first styling |
| lucide-react | 1 | Icon library |
| Firebase SDK | 12 | Firebase Auth client |

### Backend

| Technology | Version | Role |
|---|---|---|
| Flask | 3.0+ | REST API framework |
| Flask-CORS | 4.0+ | Cross-origin request handling |
| Flask-JWT-Extended | 4.6+ | JWT token management |
| Marshmallow | 3.21+ | Input validation/schema |
| python-dotenv | 1.0+ | Environment variable loading |
| requests | 2.31+ | Outbound HTTP (SMS API) |

### GIS & Remote Sensing

| Technology | Role |
|---|---|
| Google Earth Engine Python API (`earthengine-api >= 0.1.390`) | Sentinel-2 and Sentinel-1 collection filtering, compositing, index computation, and tile generation |
| Sentinel-2 SR L2A (`COPERNICUS/S2_SR_HARMONIZED`) | Optical multispectral imagery at 10m/20m resolution |
| Sentinel-1 GRD (`COPERNICUS/S1_GRD`) | C-band SAR radar imagery (VV/VH polarisation, DESCENDING pass) |

### Database

| Technology | Role |
|---|---|
| PostgreSQL 16 | Primary relational database for farmer, farm, crop, irrigation, and soil data |
| PostGIS 3.x | Spatial extension for farm polygon storage (`GEOMETRY(POLYGON, 4326)`) |
| psycopg2-binary | Python PostgreSQL driver |

### Authentication

| Technology | Role |
|---|---|
| Firebase Auth (Phone) | Phone number OTP-based authentication |
| Firebase Admin SDK | Server-side Firebase JWT token verification |
| Flask-JWT-Extended | Session JWT issuance after verified OTP |
| National Bulk SMS gateway | OTP SMS delivery |

### AI

| Technology | Role |
|---|---|
| Ollama (`llama3.2`) | Local LLM runtime for Krishi Mitra chatbot |
| LangChain (`>= 0.3.0`) | Prompt chaining and conversation memory |
| langchain-ollama | LangChain Ollama integration |
| langchain-core | Message types, prompt templates, output parsers |

### Dev Tools

| Technology | Role |
|---|---|
| ESLint 9 | JavaScript/JSX linting |
| PostCSS / Autoprefixer | CSS processing |
| Firebase Hosting | Frontend hosting configuration (`firebase.json`) |

---

## 📁 Project Structure

```
NDVI_satellite-1/
│
├── frontend/                        # React + Vite web application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Welcome.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Analysis.jsx         # Main satellite analysis page
│   │   │   └── steps/               # 8-step onboarding (Step1–Step8)
│   │   ├── components/
│   │   │   ├── DataPanel.jsx
│   │   │   ├── FarmCard.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── PrimaryButton.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── SelectField.jsx
│   │   │   └── VIReportBadge.jsx
│   │   ├── context/
│   │   │   └── OnboardingContext.jsx
│   │   ├── api/                     # API client modules
│   │   ├── utils/                   # Frontend utilities
│   │   ├── styles/
│   │   ├── MapView.jsx              # Leaflet map with polygon drawing
│   │   ├── HeatmapLayer.jsx         # GeoJSON heatmap cell renderer
│   │   ├── KrishiMitraPanel.jsx     # AI chatbot sidebar
│   │   ├── FarmSummary.jsx          # Statistics sidebar
│   │   ├── Legend.jsx               # Colour scale legend
│   │   ├── TimelineBar.jsx          # Date selection timeline
│   │   ├── LayerToggle.jsx          # Optical / Radar toggle
│   │   ├── Sidebar.jsx
│   │   ├── LoadingOverlay.jsx
│   │   ├── firebase.js              # Firebase client initialisation
│   │   ├── api.js                   # Axios API client
│   │   ├── colorUtils.js
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                         # Flask REST API
│   ├── app.py                       # Main Flask app + core routes
│   ├── config.py                    # Centralised configuration
│   ├── requirements.txt
│   ├── .env.example
│   ├── blueprints/                  # Modular route blueprints
│   │   ├── auth.py
│   │   ├── farmer.py
│   │   ├── farm.py
│   │   ├── crop.py
│   │   ├── irrigation.py
│   │   ├── soil.py
│   │   ├── consent.py
│   │   └── dashboard.py
│   ├── services/                    # Business logic layer
│   │   ├── gee_service.py           # GEE — Sentinel-2
│   │   ├── sar_service.py           # GEE — Sentinel-1
│   │   ├── index_service.py         # Vegetation index computation
│   │   ├── radar_index_service.py   # Radar index computation
│   │   ├── grid_service.py          # Optical heatmap grid
│   │   ├── radar_grid_service.py    # Radar heatmap grid
│   │   ├── stats_service.py         # Farm-level statistics
│   │   ├── auth_service.py          # Firebase JWT verification
│   │   └── sms_service.py           # OTP SMS gateway
│   ├── chatbot/                     # Krishi Mitra AI chatbot
│   │   ├── routes.py                # Blueprint (/chatbot/*)
│   │   ├── chain.py                 # LangChain + Ollama chain
│   │   ├── memory.py                # Session conversation memory
│   │   ├── config.py
│   │   └── prompts/
│   ├── db/
│   │   └── pool.py                  # PostgreSQL connection pool
│   ├── repositories/                # Data access layer
│   │   ├── farmer.py
│   │   ├── farm.py
│   │   ├── crop.py
│   │   ├── irrigation.py
│   │   ├── soil.py
│   │   ├── consent.py
│   │   └── vi_report.py
│   ├── firestore/                   # Firestore session sync
│   │   ├── client.py
│   │   └── session.py
│   ├── middlewares/
│   └── utils/
│       └── geo_utils.py             # GeoJSON ↔ EE geometry
│
├── docs/                            # Technical documentation
│   ├── architecture/                # 03–17 architecture docs
│   ├── dashboard/                   # 18–22 UI docs
│   ├── evaluation/                  # 23–25 evaluation docs
│   └── future/                      # 26–27 roadmap docs
│
├── public/
├── schema.sql                       # PostgreSQL schema
├── mindstrix_setup.sql
├── migrate_add_password.sql
├── firebase.json
├── .firebaserc
└── .gitignore
```

---

## 🏗 Architecture Overview

```
User (Browser)
      │
      ▼
React + Vite Frontend  (port 5173)
  • Leaflet map — draws farm boundary polygon
  • Submits GeoJSON geometry to backend REST API
  • Renders heatmap grid + tile overlay
  • Displays statistics sidebar + chatbot panel
      │
      ▼
Flask REST API Backend  (port 5000)
  • Validates GeoJSON polygon
  • Converts to ee.Geometry
  • Routes to optical or radar pipeline
      │
      ├─────────────────────────────────────────────┐
      ▼                                             ▼
Sentinel-2 Optical Pipeline              Sentinel-1 Radar Pipeline
  gee_service.py                           sar_service.py
  • Filters S2 collection (90 days)        • Filters S1 GRD collection
  • SCL cloud/shadow masking               • Speckle filter (focal median)
  • Scales DN → reflectance [0,1]          • Median composite
  • Median composite                              │
        │                                         ▼
        ▼                                  radar_index_service.py
  index_service.py                         • SMI, RVI, VV/VH Ratio
  • NDVI, EVI, SAVI, NDMI,
    NDWI, GNDVI, CVI
        │
        ▼
  grid_service.py / radar_grid_service.py
  • 10m grid cell generation
  • Per-cell band value reduction
  • Gaussian smoothing
        │
        ▼
  GeoJSON FeatureCollection + tile URLs + farm statistics
      │
      ▼
React Frontend
  • HeatmapLayer.jsx  — renders per-cell GeoJSON polygons
  • GEE tile overlay (bicubic-smoothed)
  • FarmSummary.jsx   — displays index statistics
      │
      ▼
KrishiMitraPanel.jsx → POST /chatbot/chat
  • Sends farm stats + user question
  • LangChain builds grounded system prompt
  • Ollama (llama3.2) generates agronomic answer
```

---

## 📚 Documentation

Detailed technical documentation lives in the [`/docs`](./docs/) directory.

### Core Documents

| Document | Description |
|---|---|
| [01_INTRODUCTION.md](./docs/01_INTRODUCTION.md) | Platform vision and core capabilities |
| [02_SYSTEM_OVERVIEW.md](./docs/02_SYSTEM_OVERVIEW.md) | End-to-end execution sequence |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | High-level system architecture |
| [CURRENT_STATE.md](./docs/CURRENT_STATE.md) | Subsystem implementation status matrix |
| [HOW_TO_RUN.md](./docs/HOW_TO_RUN.md) | Detailed setup and run instructions |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Contribution guidelines and architectural rules |
| [VALIDATION.md](./docs/VALIDATION.md) | Validation methodology |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history |
| [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) | Project background and context |

### Architecture Reference (`docs/architecture/`)

| Document | Description |
|---|---|
| [03_GOOGLE_EARTH_ENGINE.md](./docs/architecture/03_GOOGLE_EARTH_ENGINE.md) | GEE API integration |
| [04_SENTINEL2_PIPELINE.md](./docs/architecture/04_SENTINEL2_PIPELINE.md) | Sentinel-2 processing pipeline |
| [05_SENTINEL1_PIPELINE.md](./docs/architecture/05_SENTINEL1_PIPELINE.md) | Sentinel-1 SAR radar pipeline |
| [06_VEGETATION_INDICES.md](./docs/architecture/06_VEGETATION_INDICES.md) | Vegetation index formulas and CVI design |
| [07_API_ARCHITECTURE.md](./docs/architecture/07_API_ARCHITECTURE.md) | REST API routes and contracts |
| [08_BACKEND_ARCHITECTURE.md](./docs/architecture/08_BACKEND_ARCHITECTURE.md) | Backend service layer design |
| [09_FRONTEND_ARCHITECTURE.md](./docs/architecture/09_FRONTEND_ARCHITECTURE.md) | Frontend component architecture |
| [10_FIREBASE_AUTH.md](./docs/architecture/10_FIREBASE_AUTH.md) | Firebase Phone OTP authentication flow |
| [11_DATABASE.md](./docs/architecture/11_DATABASE.md) | PostgreSQL schema and PostGIS usage |
| [12_CHATBOT.md](./docs/architecture/12_CHATBOT.md) | Krishi Mitra chatbot architecture |
| [13_MAP_RENDERING.md](./docs/architecture/13_MAP_RENDERING.md) | Leaflet map and heatmap rendering |
| [14_LAYER_SYSTEM.md](./docs/architecture/14_LAYER_SYSTEM.md) | Optical vs. Radar layer toggle system |
| [15_IMAGE_PROCESSING.md](./docs/architecture/15_IMAGE_PROCESSING.md) | Image processing and tile generation |
| [16_ERROR_HANDLING.md](./docs/architecture/16_ERROR_HANDLING.md) | Error handling strategy |
| [17_CONFIGURATION.md](./docs/architecture/17_CONFIGURATION.md) | Centralised configuration reference |

### Dashboard & UI (`docs/dashboard/`)

| Document | Description |
|---|---|
| [18_DASHBOARD.md](./docs/dashboard/18_DASHBOARD.md) | Dashboard overview |
| [19_MAP_PAGE.md](./docs/dashboard/19_MAP_PAGE.md) | Map page |
| [20_ANALYSIS_PAGE.md](./docs/dashboard/20_ANALYSIS_PAGE.md) | Analysis page |
| [21_AUTHENTICATION_UI.md](./docs/dashboard/21_AUTHENTICATION_UI.md) | Authentication UI |
| [22_COMPONENTS.md](./docs/dashboard/22_COMPONENTS.md) | Reusable UI components |

### Evaluation (`docs/evaluation/` & `docs/future/`)

| Document | Description |
|---|---|
| [23_PERFORMANCE.md](./docs/evaluation/23_PERFORMANCE.md) | Performance characteristics |
| [24_LIMITATIONS.md](./docs/evaluation/24_LIMITATIONS.md) | Known limitations |
| [25_KNOWN_ISSUES.md](./docs/evaluation/25_KNOWN_ISSUES.md) | Known issues |
| [26_FUTURE_WORK.md](./docs/future/26_FUTURE_WORK.md) | Future work |
| [27_ROADMAP.md](./docs/future/27_ROADMAP.md) | Development roadmap |

---

## 🚀 Installation

### Prerequisites

- **Python** 3.10+
- **Node.js** 20+
- **PostgreSQL** 16 with PostGIS 3.x extension
- **Google Cloud project** with Earth Engine API enabled
- **Firebase project** with Phone Authentication enabled
- **Ollama** running locally with `llama3.2` model pulled

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NDVI_satellite-1
```

### 2. Backend Setup

```powershell
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows PowerShell
# source venv/bin/activate           # Linux / macOS

# Install dependencies (backend + chatbot)
pip install -r requirements.txt -r chatbot\requirements.txt

# Authenticate Google Earth Engine (one-time)
earthengine authenticate

# Configure environment variables
copy .env.example .env
# Edit .env: set GEE_PROJECT_ID, DATABASE_URL, FIREBASE_PROJECT_ID, JWT_SECRET_KEY

# Start the Flask API
python app.py
```

Backend runs at **`http://127.0.0.1:5000`**.

### 3. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at **`http://localhost:5173`**.

### 4. Database Setup

```sql
psql -U postgres
CREATE DATABASE mindstrix;
\c mindstrix
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\i schema.sql
```

### 5. Ollama Chatbot Service

```bash
ollama serve
ollama pull llama3.2
```

---

## ⚙️ Configuration

### Backend — `backend/.env`

Copy `backend/.env.example` to `backend/.env`:

| Variable | Description |
|---|---|
| `GEE_PROJECT_ID` | Google Cloud project ID with Earth Engine API enabled |
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:password@host:5432/dbname`) |
| `FIREBASE_PROJECT_ID` | Firebase project ID for Admin SDK |
| `JWT_SECRET_KEY` | Secret key for JWT token signing (change in production) |
| `FLASK_PORT` | Flask server port (default: `5000`) |
| `FLASK_ENV` | `development` or `production` |

### Frontend — `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

> GEE credentials are stored locally by `earthengine authenticate` at `~/.config/earthengine/credentials`.

---

## 🔌 API Overview

Full API contracts are documented in [`docs/architecture/07_API_ARCHITECTURE.md`](./docs/architecture/07_API_ARCHITECTURE.md).

### Core Analysis

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — GEE and Firebase status |
| `POST` | `/api/analyze` | Sentinel-2 analysis: indices + grid + farm stats |
| `POST` | `/api/analyze-dates` | Available Sentinel-2 acquisition dates for polygon |
| `POST` | `/api/analyze-day` | Single-date Sentinel-2 analysis |
| `GET` | `/api/sample` | Hover pixel sampling (`?lat=&lng=&band=NDVI`) |
| `POST` | `/api/analyze-radar` | Sentinel-1 radar analysis: SMI, RVI, VV/VH + grid |
| `POST` | `/api/analyze-radar-dates` | Available Sentinel-1 acquisition dates for polygon |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Send OTP to Indian mobile number |
| `POST` | `/api/auth/verify-otp` | Verify OTP and issue JWT |
| `POST` | `/api/auth/verify-token` | Verify Firebase ID token via Admin SDK |

### Chatbot

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chatbot/chat` | Send message; receive grounded AI reply |
| `POST` | `/chatbot/reset` | Clear session conversation memory |
| `GET` | `/chatbot/health` | Chatbot health check |

---

## 🛰 Satellite Analysis

### Sentinel-2 — Vegetation Indices

Computed by [`backend/services/index_service.py`](./backend/services/index_service.py) from a scaled Sentinel-2 SR median composite (reflectance [0.0, 1.0]).

| Index | Formula | Agronomic Meaning |
|---|---|---|
| **NDVI** | `(NIR − RED) / (NIR + RED)` | Overall vegetation greenness and density |
| **EVI** | `2.5 × (NIR − RED) / (NIR + 6×RED − 7.5×BLUE + 1)` | Vegetation with atmospheric correction; reduces canopy saturation |
| **SAVI** | `((NIR − RED) / (NIR + RED + 0.5)) × 1.5` | Vegetation adjusted for soil brightness bias |
| **NDMI** | `(NIR − SWIR) / (NIR + SWIR)` | Canopy moisture and drought stress |
| **NDWI** | `(GREEN − NIR) / (GREEN + NIR)` | Water body detection |
| **GNDVI** | `(NIR − GREEN) / (NIR + GREEN)` | Chlorophyll content and nutritional status |
| **CVI** | Weighted sum of NDVI, EVI, SAVI, NDMI, GNDVI | Composite multi-index fusion; weights in `config.py` |

### Sentinel-1 — Radar Indices

Computed by [`backend/services/radar_index_service.py`](./backend/services/radar_index_service.py) from speckle-filtered VV/VH dB composite.

| Index | Formula / Source | Agronomic Meaning |
|---|---|---|
| **VV** | Raw backscatter (dB) | Surface soil moisture and roughness sensitivity |
| **VH** | Raw backscatter (dB) | Vegetation structure and volume scattering |
| **SMI** | `(VV − VV_dry) / (VV_wet − VV_dry)`, clamped [0, 1] | Soil moisture index (0 = dry, 1 = wet) |
| **RVI** | `4 × VH_lin / (VV_lin + VH_lin)`, clamped [0, 1] | Radar vegetation index — canopy density |
| **RATIO** | `VV_dB − VH_dB` | VV/VH ratio: soil dominance vs. vegetation |

> **Cloud penetration:** The Sentinel-1 pipeline is independent of cloud cover, providing continuous monitoring regardless of weather.

---

## 🤝 Contributing

Read [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) before submitting any changes.

### Core Architectural Rules

1. **GEE Isolation**: All `earthengine-api` calls must remain strictly within `backend/services/gee_service.py` and `backend/services/sar_service.py`. Flask routes and other services must only consume `ee.Image` or `ee.Geometry` objects returned from those modules.

2. **Centralised Configuration**: All threshold values, index weights, cloud cover limits, and bounds must be defined in `backend/config.py`. Do not scatter constants through service logic.

3. **No Silent Fallbacks**: Return the correct HTTP error code on failure (`503` for GEE unavailable, `400` for invalid polygon). Do not swallow errors with fake or empty fallback data.

4. **Zero Documentation Drift**: If you modify an API route, update `docs/architecture/07_API_ARCHITECTURE.md`. If you update an index formula, update both `index_service.py` and `docs/architecture/06_VEGETATION_INDICES.md`.

---

## 👤 Authors

Author information has not been committed to the repository. Contributions are tracked via git history.

---

*For detailed technical documentation, architecture decisions, configuration reference, and known limitations, refer to the [`/docs`](./docs/) directory.*
