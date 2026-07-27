<div align="center">

<!-- Animated capsule-render banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100:0f3460&height=220&section=header&text=MindstriX&fontSize=72&fontColor=4ade80&animation=fadeIn&fontAlignY=35&desc=Satellite%20Farm%20Analysis%20Platform&descAlignY=58&descColor=86efac&descSize=22" width="100%"/>

<!-- Animated typing SVG -->
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=18&duration=3000&pause=800&color=4ADE80&center=true&vCenter=true&multiline=true&width=750&height=60&lines=Real-time+Sentinel-2+%26+Sentinel-1+Satellite+Analysis;NDVI+%7C+EVI+%7C+SAVI+%7C+NDMI+%7C+NDWI+%7C+GNDVI+%7C+CVI;Krishi+Mitra+AI+%E2%80%94+Grounded+Agronomy+Intelligence" alt="Typing SVG" />

<br/><br/>

<!-- Badge row 1 — Stack -->
<img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/Flask-3.0%2B-000000?style=for-the-badge&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>

<br/>

<!-- Badge row 2 — Services -->
<img src="https://img.shields.io/badge/Google%20Earth%20Engine-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
<img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
<img src="https://img.shields.io/badge/PostgreSQL%20%2B%20PostGIS-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Ollama%20llama3.2-LangChain-00A67E?style=for-the-badge&logo=ollama&logoColor=white"/>

<br/><br/>

</div>

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

---

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a1a2e,100:0f3460&height=3&section=header" width="100%"/>

## 🌍 Overview

### Purpose

MindstriX is a full-stack satellite agronomy intelligence platform that delivers high-resolution multi-spectral and radar satellite imagery analysis directly to farm-level workflows. The platform transforms raw **Sentinel-2** optical and **Sentinel-1 SAR** radar bands into actionable vegetation health heatmaps, soil moisture assessments, and AI-grounded agronomic recommendations.

### Problem Statement

Small and medium-scale farmers lack access to affordable, real-time satellite crop health monitoring. Traditional field scouting is slow, expensive, and incomplete. Existing cloud-based satellite platforms are complex and not optimized for the agronomist or farmer workflow.

### High-Level Overview

| Layer | Technology | Responsibility |
|---|---|---|
| 🗺 **Interactive Map** | React + Leaflet | Draw farm boundary polygon |
| ⚙️ **REST API** | Flask + GEE Python API | Satellite processing pipeline |
| 🛰 **Optical Pipeline** | Sentinel-2 SR (S2_SR_HARMONIZED) | Cloud-free vegetation index heatmaps |
| 📡 **Radar Pipeline** | Sentinel-1 GRD (S1_GRD) | Cloud-penetrating soil moisture maps |
| 🤖 **AI Chatbot** | LangChain + Ollama (llama3.2) | Grounded agronomy Q&A |
| 🔐 **Auth** | Firebase Phone OTP + JWT | Secure mobile-first login |
| 🗃 **Database** | PostgreSQL + PostGIS | Farmer & farm data persistence |

---

## ✅ Features

> All features listed are implemented and verified in the codebase.

<div align="center">

| 🛰 Remote Sensing | 🗺 Frontend | 🔐 Auth & Data |
|---|---|---|
| Sentinel-2 90-day cloud-free composite | Interactive Leaflet map + polygon drawing | Firebase Phone OTP login |
| SCL per-pixel cloud/shadow masking | Farm boundary delineation & rendering | Firebase JWT verification |
| NDVI · EVI · SAVI · NDMI · NDWI · GNDVI · CVI | Optical ↔ Radar layer toggle | 8-step farmer onboarding flow |
| Sentinel-1 SAR speckle-filtered composite | Vegetation index heatmap grid renderer | PostgreSQL + PostGIS persistence |
| SMI · RVI · VV · VH · Ratio radar indices | Farm statistics sidebar | Firestore session synchronisation |
| 10m grid generation + Gaussian smoothing | Timeline bar for date navigation | Protected routes + JWT session |
| GEE bicubic-smoothed tile URL generation | Krishi Mitra AI chatbot panel | |
| Single-date S2 & S1 analysis | Single-pixel hover sampling | |

</div>

---

## 🛠 Tech Stack

### 🖥 Frontend

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=react-router&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet_1.9-199900?style=flat-square&logo=leaflet&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts_3-22C55E?style=flat-square)
![Axios](https://img.shields.io/badge/Axios_1-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Turf.js](https://img.shields.io/badge/Turf.js_7-00A896?style=flat-square)
![Firebase SDK](https://img.shields.io/badge/Firebase_SDK_12-FFCA28?style=flat-square&logo=firebase&logoColor=black)

</div>

### ⚙️ Backend

<div align="center">

![Flask](https://img.shields.io/badge/Flask_3.0%2B-000000?style=flat-square&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![JWT](https://img.shields.io/badge/Flask--JWT--Extended-4.6%2B-000000?style=flat-square)
![Marshmallow](https://img.shields.io/badge/Marshmallow-3.21%2B-EF5350?style=flat-square)

</div>

### 🌍 GIS & Remote Sensing

<div align="center">

![GEE](https://img.shields.io/badge/Google_Earth_Engine_API-0.1.390%2B-4285F4?style=flat-square&logo=google&logoColor=white)
![Sentinel-2](https://img.shields.io/badge/Sentinel--2_SR_L2A-10m_Optical-2E7D32?style=flat-square)
![Sentinel-1](https://img.shields.io/badge/Sentinel--1_GRD-SAR_Radar-1565C0?style=flat-square)

</div>

### 🗃 Database & Auth

<div align="center">

![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS_3.x-336791?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase_Auth_(Phone_OTP)-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Firebase Admin](https://img.shields.io/badge/Firebase_Admin_SDK-FFA000?style=flat-square&logo=firebase&logoColor=black)

</div>

### 🤖 AI

<div align="center">

![Ollama](https://img.shields.io/badge/Ollama_llama3.2-Local_LLM-00A67E?style=flat-square)
![LangChain](https://img.shields.io/badge/LangChain_0.3%2B-1C3C3C?style=flat-square)

</div>

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
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── MapView.jsx              # Leaflet map with polygon drawing
│   │   ├── HeatmapLayer.jsx         # GeoJSON heatmap cell renderer
│   │   ├── KrishiMitraPanel.jsx     # AI chatbot sidebar
│   │   ├── FarmSummary.jsx          # Statistics sidebar
│   │   ├── Legend.jsx               # Colour scale legend
│   │   ├── TimelineBar.jsx          # Date selection timeline
│   │   ├── LayerToggle.jsx          # Optical / Radar toggle
│   │   ├── firebase.js
│   │   ├── api.js
│   │   ├── colorUtils.js
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                         # Flask REST API
│   ├── app.py                       # Main Flask app + core routes
│   ├── config.py                    # Centralised configuration constants
│   ├── requirements.txt
│   ├── .env.example
│   ├── blueprints/                  # Modular route blueprints
│   │   ├── auth.py  ·  farmer.py  ·  farm.py  ·  crop.py
│   │   ├── irrigation.py  ·  soil.py  ·  consent.py  ·  dashboard.py
│   ├── services/                    # Business logic
│   │   ├── gee_service.py           # GEE — Sentinel-2 pipeline
│   │   ├── sar_service.py           # GEE — Sentinel-1 pipeline
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
│   │   └── prompts/
│   ├── db/pool.py                   # PostgreSQL connection pool
│   ├── repositories/                # Data access layer
│   │   ├── farmer.py  ·  farm.py  ·  crop.py  ·  irrigation.py
│   │   ├── soil.py  ·  consent.py  ·  vi_report.py
│   ├── firestore/                   # Firestore session sync
│   │   ├── client.py  ·  session.py
│   ├── middlewares/
│   └── utils/geo_utils.py           # GeoJSON ↔ EE geometry
│
├── docs/                            # Technical documentation
│   ├── architecture/                # 03–17  architecture docs
│   ├── dashboard/                   # 18–22  UI docs
│   ├── evaluation/                  # 23–25  performance & issues
│   └── future/                      # 26–27  roadmap
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
┌─────────────────────────────────────────────────────────────┐
│                    User (Browser)                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           React + Vite Frontend  (port 5173)                │
│  • Leaflet map — draw farm boundary polygon                 │
│  • Submit GeoJSON → backend REST API                        │
│  • Render heatmap grid + GEE tile overlay                   │
│  • Statistics sidebar · chatbot panel · layer toggle        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Flask REST API Backend  (port 5000)               │
│  • Validate GeoJSON polygon                                 │
│  • Convert to ee.Geometry                                   │
│  • Route to optical or radar pipeline                       │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌───────────────────────────────┐
│  Sentinel-2 Optical  │      │    Sentinel-1 Radar Pipeline  │
│  gee_service.py      │      │    sar_service.py             │
│  • 90-day lookback   │      │    • S1 GRD collection        │
│  • SCL cloud mask    │      │    • Speckle filter           │
│  • Median composite  │      │    • Median composite         │
│         ↓            │      │           ↓                   │
│  index_service.py    │      │  radar_index_service.py       │
│  NDVI·EVI·SAVI·NDMI  │      │  SMI · RVI · VV/VH · Ratio   │
│  NDWI·GNDVI·CVI      │      │                               │
└──────────┬───────────┘      └──────────────┬────────────────┘
           │                                 │
           └─────────────┬───────────────────┘
                         ▼
             grid_service / radar_grid_service
             • 10m grid cell generation
             • Per-cell band value reduction
             • Gaussian smoothing
                         │
                         ▼
             GeoJSON FeatureCollection
             + GEE smooth tile URLs
             + Farm-wide statistics
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend                             │
│  HeatmapLayer.jsx  →  per-cell colour polygons             │
│  FarmSummary.jsx   →  vegetation index statistics           │
│  Legend.jsx        →  colour gradient scale                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
              KrishiMitraPanel.jsx
              POST /chatbot/chat
              { farmData + heatmapData + user message }
                          │
                          ▼
              LangChain → grounded system prompt
              Ollama (llama3.2) → agronomic answer
```

---

## 📚 Documentation

> Detailed technical documentation is maintained in [`/docs`](./docs/).

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
| [10_FIREBASE_AUTH.md](./docs/architecture/10_FIREBASE_AUTH.md) | Firebase Phone OTP authentication |
| [11_DATABASE.md](./docs/architecture/11_DATABASE.md) | PostgreSQL schema and PostGIS usage |
| [12_CHATBOT.md](./docs/architecture/12_CHATBOT.md) | Krishi Mitra chatbot architecture |
| [13_MAP_RENDERING.md](./docs/architecture/13_MAP_RENDERING.md) | Leaflet map and heatmap rendering |
| [14_LAYER_SYSTEM.md](./docs/architecture/14_LAYER_SYSTEM.md) | Optical vs. Radar layer toggle |
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

### Evaluation & Roadmap

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

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 20+ |
| PostgreSQL | 16 with PostGIS 3.x |
| Google Cloud project | Earth Engine API enabled |
| Firebase project | Phone Authentication enabled |
| Ollama | `llama3.2` model pulled |

### 1 · Clone

```bash
git clone https://github.com/SanTiwari07/NDVI_satellite.git
cd NDVI_satellite-1
```

### 2 · Backend Setup

```powershell
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows PowerShell
# source venv/bin/activate           # Linux / macOS

# Install all dependencies
pip install -r requirements.txt -r chatbot\requirements.txt

# One-time GEE authentication
earthengine authenticate

# Configure environment
copy .env.example .env
# → Edit .env: GEE_PROJECT_ID, DATABASE_URL, FIREBASE_PROJECT_ID, JWT_SECRET_KEY

# Start Flask API
python app.py
# Running at http://127.0.0.1:5000
```

### 3 · Frontend Setup

```powershell
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

### 4 · Database Setup

```sql
psql -U postgres
CREATE DATABASE mindstrix;
\c mindstrix
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\i schema.sql
```

### 5 · Ollama Chatbot

```bash
ollama serve
ollama pull llama3.2
```

---

## ⚙️ Configuration

### Backend — `backend/.env`

| Variable | Description |
|---|---|
| `GEE_PROJECT_ID` | Google Cloud project ID with Earth Engine API enabled |
| `DATABASE_URL` | `postgresql://user:password@host:5432/dbname` |
| `FIREBASE_PROJECT_ID` | Firebase project ID for Admin SDK |
| `JWT_SECRET_KEY` | Secret key for JWT token signing — **change in production** |
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

> **GEE credentials** are stored locally by `earthengine authenticate` at `~/.config/earthengine/credentials` — no manual key file needed.

---

## 🔌 API Overview

> Full contracts: [`docs/architecture/07_API_ARCHITECTURE.md`](./docs/architecture/07_API_ARCHITECTURE.md)

### 🛰 Satellite Analysis

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — GEE & Firebase status |
| `POST` | `/api/analyze` | Sentinel-2 analysis — indices + grid + stats |
| `POST` | `/api/analyze-dates` | Available S2 acquisition dates for polygon |
| `POST` | `/api/analyze-day` | Single-date Sentinel-2 analysis |
| `GET` | `/api/sample` | Pixel hover sampling `?lat=&lng=&band=NDVI` |
| `POST` | `/api/analyze-radar` | Sentinel-1 radar — SMI, RVI, VV/VH + grid |
| `POST` | `/api/analyze-radar-dates` | Available S1 acquisition dates for polygon |

### 🔐 Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Send OTP to Indian mobile number |
| `POST` | `/api/auth/verify-otp` | Verify OTP → issue JWT |
| `POST` | `/api/auth/verify-token` | Verify Firebase ID token via Admin SDK |

### 🤖 Chatbot

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chatbot/chat` | Send message → grounded AI reply |
| `POST` | `/chatbot/reset` | Clear session conversation memory |
| `GET` | `/chatbot/health` | Chatbot health check |

---

## 🛰 Satellite Analysis

### Sentinel-2 — Vegetation Indices

> Computed by `backend/services/index_service.py` from scaled reflectance composite `[0.0, 1.0]`

| Index | Formula | Agronomic Meaning |
|---|---|---|
| 🟢 **NDVI** | `(NIR − RED) / (NIR + RED)` | Vegetation greenness & density |
| 🌿 **EVI** | `2.5 × (NIR − RED) / (NIR + 6×RED − 7.5×BLUE + 1)` | Atmospheric-corrected; reduces canopy saturation |
| 🌱 **SAVI** | `((NIR − RED) / (NIR + RED + 0.5)) × 1.5` | Soil brightness bias corrected |
| 💧 **NDMI** | `(NIR − SWIR) / (NIR + SWIR)` | Canopy moisture & drought stress |
| 🌊 **NDWI** | `(GREEN − NIR) / (GREEN + NIR)` | Water body detection |
| 🍃 **GNDVI** | `(NIR − GREEN) / (NIR + GREEN)` | Chlorophyll & nutritional status |
| 🎯 **CVI** | Weighted sum of NDVI, EVI, SAVI, NDMI, GNDVI | Multi-index fusion composite — weights in `config.py` |

### Sentinel-1 — Radar Indices

> Computed by `backend/services/radar_index_service.py` from speckle-filtered VV/VH dB composite

| Index | Formula | Agronomic Meaning |
|---|---|---|
| 📡 **VV** | Raw backscatter (dB) | Soil moisture & surface roughness |
| 📡 **VH** | Raw backscatter (dB) | Vegetation volume structure |
| 💧 **SMI** | `(VV − VV_dry) / (VV_wet − VV_dry)` ∈ [0,1] | Soil Moisture Index (0 = dry → 1 = wet) |
| 🌿 **RVI** | `4 × VH_lin / (VV_lin + VH_lin)` ∈ [0,1] | Radar Vegetation Index — canopy density |
| ⚖️ **RATIO** | `VV_dB − VH_dB` | Soil vs. vegetation dominance |

> ☁️ **Cloud-independent:** The Sentinel-1 pipeline penetrates cloud cover, delivering continuous monitoring regardless of weather.

---

## 🤝 Contributing

Read [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) before submitting changes.

### Architectural Rules

| Rule | Description |
|---|---|
| 🔒 **GEE Isolation** | All `earthengine-api` calls stay in `gee_service.py` and `sar_service.py` only |
| ⚙️ **Centralised Config** | All thresholds, weights, and bounds live in `backend/config.py` |
| 🚫 **No Silent Fallbacks** | Return correct HTTP error codes — never fake/empty data on failure |
| 📝 **Zero Doc Drift** | API changes → update `07_API_ARCHITECTURE.md`; index changes → update `06_VEGETATION_INDICES.md` |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,50:16213e,100:1a1a2e&height=120&section=footer&fontSize=16&fontColor=4ade80&animation=fadeIn" width="100%"/>

*Detailed technical documentation, architecture decisions, configuration reference, and known limitations → [`/docs`](./docs/)*

</div>
