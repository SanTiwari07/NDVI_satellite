# MindstriX — Satellite Agronomy Intelligence Platform

MindstriX is a production-grade, full-stack precision-agriculture platform that converts raw satellite imagery into actionable farm-level intelligence. A farmer or agronomist draws a polygon on an interactive Leaflet map, and within seconds the system returns a per-cell heatmap grid showing vegetation health, soil moisture, and chlorophyll status — powered entirely by Google Earth Engine running on Sentinel-2 and Sentinel-1 radar imagery. An on-device LLM chatbot, Krishi Mitra, answers natural-language questions about the current field using those live stats as grounded context.

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Key Capabilities](#key-capabilities)
- [System Architecture](#system-architecture)
- [Vegetation Index Engine](#vegetation-index-engine)
- [Radar / SAR Soil Moisture Pipeline](#radar--sar-soil-moisture-pipeline)
- [Krishi Mitra Chatbot](#krishi-mitra-chatbot)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Frontend Application](#frontend-application)
- [Configuration Reference](#configuration-reference)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Repository Layout](#repository-layout)
- [Contributing](#contributing)

---

## Platform Overview

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite + Leaflet | Map, polygon draw, heatmap, dashboard |
| Backend | Flask 3 + Python | REST API, GEE orchestration, auth |
| Vegetation Engine | Google Earth Engine (Sentinel-2 SR) | NDVI, EVI, SAVI, NDMI, NDWI, GNDVI, CVI |
| Radar Engine | Google Earth Engine (Sentinel-1 GRD) | SMI, RVI, VV/VH backscatter |
| Chatbot | LangChain + Ollama (local LLM) | Grounded agronomic Q&A |
| Relational DB | PostgreSQL 16 + PostGIS 3 | Farmers, farms, crops, VI reports |
| Real-time Layer | Cloud Firestore | OTP sessions, onboarding state, alerts |
| Auth | Firebase Phone Auth + JWT | OTP-based mobile login |
| Hosting | Firebase Hosting + Cloud Run | Static frontend, scalable API |

---

## Key Capabilities

**Composite Vegetation Index (CVI)** — Rather than relying on NDVI alone, MindstriX fuses six spectral indices into a single weighted composite. NDVI saturates in dense canopies (LAI > 3); the CVI compensates by blending EVI for atmospheric correction, SAVI for soil brightness, NDMI for moisture stress, and GNDVI for chlorophyll sensitivity.

**Radar Soil Moisture** — An independent Sentinel-1 SAR pipeline computes a Soil Moisture Index (SMI), Radar Vegetation Index (RVI), and VV/VH backscatter ratio. This provides soil-level intelligence that works even through cloud cover that blocks optical sensors.

**Per-cell Heatmap Grid** — The farm polygon is tiled into a 10 m grid (auto-coarsened if the polygon is large). Each cell carries its own index values and a Gaussian-smoothed colour score, giving field-level spatial detail that farm-wide averages miss.

**Confidence Scoring** — Every report carries a 0-100% confidence metric that combines scene count over the analysis window, residual cloud cover, and spatial variance across the field. A low confidence score flags that the analysis period had poor data quality.

**9-Step Farmer Onboarding** — A resumable, mobile-first onboarding flow collects farmer profile, location, farm boundary, crop, irrigation, and soil data across nine steps. Each step writes to PostgreSQL and syncs progress to Firestore so a reconnect can resume exactly where it left off.

**Krishi Mitra (Farmer's Friend)** — A local Ollama-hosted LLM configured via LangChain that receives the live field stats as system-prompt context on every message. It gives agronomically grounded answers about crop stress, irrigation recommendations, and index interpretations.

**Firebase Phone Auth** — Farmers log in with a mobile OTP — no passwords. The Flask backend verifies the Firebase JWT on every protected route using Firebase Admin SDK.

---

## System Architecture

```
Browser / Mobile
       |
       | HTTPS
       v
  [Vite Dev Server / Firebase Hosting]
       |  (proxies /api and /chatbot to Flask)
       v
  [Flask REST API  --  backend/app.py]
       |
       +---> utils/geo_utils.py          GeoJSON to ee.Geometry validation
       |
       +---> services/gee_service.py     Sentinel-2 filter, cloud mask, composite
       |           |
       |           +--> services/index_service.py    NDVI, EVI, SAVI, NDMI, NDWI, GNDVI, CVI
       |           |
       |           +--> services/grid_service.py     Polygon tiling, Gaussian smooth, GeoJSON
       |           |
       |           +--> services/stats_service.py    Farm-wide stats, confidence score
       |
       +---> services/sar_service.py     Sentinel-1 pipeline, independent of optical
       |           |
       |           +--> services/radar_index_service.py   SMI, RVI, VV/VH ratio
       |           |
       |           +--> services/radar_grid_service.py    Radar heatmap grid
       |
       +---> chatbot/routes.py           Flask Blueprint at /chatbot
       |           |
       |           +--> chatbot/prompts/   build_system_prompt with live farm data
       |           +--> chatbot/chain.py   ChatOllama via LangChain
       |           +--> chatbot/memory.py  Per-session chat history
       |
       +---> blueprints/                 Onboarding step blueprints
       |
       +---> repositories/               PostgreSQL data access layer
       |
       +---> firestore/                  Firestore session and alert helpers
       |
  [PostgreSQL + PostGIS]         [Cloud Firestore]
  farmers, farms, crops,         OTP sessions, onboarding
  irrigation, soil_info,         state, farm alerts,
  vi_reports, consents,          org live stats
  api_keys, webhooks
```

GEE operations are lazy. All band math, filtering, and reduction happen on Google's servers. The Flask process only waits at `.getInfo()` or `.getMapId()` calls. The most recently indexed image is cached on the `app` object so the `/api/sample` pixel-hover endpoint can query it without re-running the full pipeline.

---

## Vegetation Index Engine

### Why Six Indices?

NDVI is the most-used vegetation index but has well-documented failure modes: it saturates when Leaf Area Index (LAI) exceeds roughly 3.0 (common in mature paddy or dense wheat), and it is sensitive to atmospheric haze and soil brightness. MindstriX computes five additional indices and fuses them into a Composite Vegetation Index (CVI).

### Index Definitions

All indices are computed over a Sentinel-2 Surface Reflectance (`COPERNICUS/S2_SR_HARMONIZED`) median composite after per-pixel SCL cloud and shadow masking. DN values are divided by 10,000 to produce true reflectance in [0, 1].

| Index | Formula | What It Measures |
|---|---|---|
| NDVI | (NIR - RED) / (NIR + RED) | Canopy greenness, overall plant vigour |
| EVI | 2.5 * (NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1) | Greenness with atmospheric and canopy correction |
| SAVI | 1.5 * (NIR - RED) / (NIR + RED + 0.5) | Greenness with soil brightness correction (L=0.5) |
| NDMI | (NIR - SWIR) / (NIR + SWIR) | Vegetation moisture and drought stress |
| NDWI | (GREEN - NIR) / (GREEN + NIR) | Open water presence and canopy water content |
| GNDVI | (NIR - GREEN) / (NIR + GREEN) | Chlorophyll concentration, crop nutrient status |

Sentinel-2 bands used: B2 (Blue ~490 nm), B3 (Green ~560 nm), B4 (Red ~665 nm), B8 (NIR ~842 nm at 10 m), B11 (SWIR ~1610 nm at 20 m, resampled by GEE), SCL (Scene Classification Layer for masking).

### CVI Weights (current production values from config.py)

The weights are read from `backend/config.py` at startup. They must sum to 1.0.

| Weight | Index | Rationale |
|---|---|---|
| 0.70 | NDVI | Primary signal; dominant in most agronomic conditions |
| 0.10 | EVI | Corrects atmospheric scattering and canopy saturation |
| 0.05 | SAVI | Reduces soil background in sparse or row crops |
| 0.10 | NDMI | Moisture stress signal; critical for drought detection |
| 0.05 | GNDVI | Chlorophyll and nitrogen status proxy |

To change weights, edit `CVI_WEIGHTS` in `backend/config.py`. Do not change service modules. Changes take effect on the next restart.

### Preprocessing Pipeline

1. Filter `COPERNICUS/S2_SR_HARMONIZED` by bounding box and date range.
2. Drop images with scene-wide cloud cover above `MAX_CLOUD_COVER_PCT` (default 20%).
3. Apply per-pixel SCL mask: pixels classified as Cloud Shadow (3), Medium Cloud (8), High Cloud (9), or Cirrus (10) are masked out at pixel level, not scene level.
4. Scale all bands from DN to reflectance by dividing by 10,000.
5. Reduce the filtered collection to a median composite. The median is robust to outlier pixels and residual unmasked cloud edges.

### Heatmap Grid

`grid_service.py` tiles the polygon using `ee.Image.coveringGrid()` at `GRID_SCALE_M` (default 10 m, matching Sentinel-2 native resolution for NDVI and EVI). If the resulting cell count exceeds `MAX_GRID_CELLS` (default 2,000), the scale is auto-incremented by `GRID_SCALE_STEP_M` (2 m per step) until the count is within budget. Each cell is a GeoJSON Feature with all index values and a Gaussian-smoothed CVI colour score in its properties.

### Confidence Score

The confidence score (0-100%) combines three signals:

- **Scene count signal** — `min(scene_count / CONFIDENCE_SCENE_TARGET, 1.0)`. Target is 5 scenes. Fewer scenes means less temporal averaging and more noise.
- **Variance signal** — `1 - min(std_dev / CONFIDENCE_STD_MAX, 1.0)`. High within-field variance (non-uniform canopy, partial cloud residue) reduces confidence.
- **Residual cloud signal** — estimated from the difference between raw image count and masked image count.

The three signals are averaged and multiplied by 100.

### CVI Interpretation Thresholds

| CVI Value | Label |
|---|---|
| >= 0.50 | Healthy vegetation |
| >= 0.25 | Moderate vegetation, possible stress |
| < 0.25 | Poor vegetation, needs attention |

### NDVI Interpretation Thresholds

| NDVI Value | Label |
|---|---|
| >= 0.60 | Dense, healthy vegetation |
| >= 0.40 | Moderate vegetation |
| >= 0.20 | Sparse / stressed vegetation |
| >= 0.00 | Bare soil |
| < 0.00 | Water / non-vegetated |

---

## Radar / SAR Soil Moisture Pipeline

The Sentinel-1 SAR pipeline is completely independent of the optical pipeline. It uses `COPERNICUS/S1_GRD` (Ground Range Detected, IW mode, DESCENDING pass) and operates on backscatter in decibels.

### Why SAR?

Synthetic Aperture Radar penetrates cloud cover. On cloudy days when Sentinel-2 returns no usable pixels, the SAR pipeline still provides soil moisture information. VV (vertical transmit/receive) backscatter is sensitive to surface soil moisture; VH backscatter is sensitive to volume scattering in vegetation.

### SAR Processing Steps

1. Filter `COPERNICUS/S1_GRD` by IW mode, DESCENDING pass, VV+VH polarisation bands, and `resolution_meters = 10`.
2. Select images within a plus-or-minus `S1_DATE_WINDOW_DAYS` (default 6 days) window around the selected date.
3. Apply a focal-median speckle filter with radius `S1_SPECKLE_RADIUS_M` (default 50 m, circle kernel) to reduce SAR speckle noise without blurring boundaries.
4. Reduce to a median composite.

### Radar Index Definitions

| Index | Formula / Method | Range | What It Measures |
|---|---|---|---|
| SMI | clamp((VV_db - DRY_REF) / (WET_REF - DRY_REF), 0, 1) | 0-1 | Soil Moisture Index normalised against fixed VV dB calibration bounds |
| RVI | 4*VH_lin / (VV_lin + VH_lin) | 0-1 | Radar Vegetation Index, proxy for vegetation density |
| VV/VH Ratio | VV_db - VH_db (dB subtraction equals power ratio) | varies | Structural roughness and moisture-to-vegetation ratio |
| VV | raw VV dB | -22 to -6 | Direct VV backscatter |
| VH | raw VH dB | -28 to -12 | Direct VH backscatter |

SMI calibration bounds are in `config.py`: `SMI_VV_DRY_DB = -20.0` dB (dry soil) and `SMI_VV_WET_DB = -8.0` dB (wet soil). Adjust these bounds when deploying in a new agro-climatic zone.

---

## Krishi Mitra Chatbot

Krishi Mitra is an agronomic assistant built as a Flask Blueprint registered under `/chatbot`. It is layered so HTTP, prompt, and LLM concerns stay in separate modules.

### Architecture

```
POST /chatbot/chat
       |
  routes.py -- HTTP only; receives message + farmData + heatmapData
       |
  prompts/build_system_prompt(farm_data, heatmap_data)
       |   Injects live VI stats, field name, polygon area, CVI mean,
       |   individual index values, and confidence score into the
       |   system prompt for every request.
       |
  chain.py -- builds ChatOllama chain via LangChain
       |   Model configurable via OLLAMA_MODEL
       |   Base URL via OLLAMA_BASE_URL (default http://localhost:11434)
       |
  memory.py -- in-process per-session_id chat history
       |   Capped at CHATBOT_MAX_HISTORY turns (default 10)
       |
  response returned to frontend
```

### Session Management

Chat history is stored in memory keyed by a `session_id` UUID provided by the frontend. `POST /chatbot/reset` clears the history for a session. In a multi-process deployment (Gunicorn with multiple workers), sessions are not shared across workers. Use a Redis-backed memory store for production multi-process setups.

### LLM Requirements

Ollama must be running locally with the target model pulled before starting the backend:

```bash
ollama serve
ollama pull llama3.2
```

If Ollama is not running, `/chatbot/chat` returns HTTP 502. The rest of the platform continues to work normally.

---

## Database Design

MindstriX uses two complementary databases: PostgreSQL with PostGIS for all persistent relational spatial data, and Cloud Firestore for ephemeral real-time data.

### Why PostgreSQL and PostGIS?

Farm boundaries are polygons in WGS-84 coordinates. PostGIS provides native `GEOMETRY(POLYGON, 4326)` column types, GIST indexes for O(log n) spatial queries, and functions like `ST_GeomFromGeoJSON()`, `ST_Contains()`, and `ST_Area()`. PostgreSQL's ACID guarantees ensure that a nine-step onboarding transaction never partially commits. DynamoDB has no PostGIS equivalent. MongoDB geospatial capabilities are weaker for polygon-level intersection and area queries.

### Why Firestore Only for Sessions and Alerts?

- `otp_sessions` have a native TTL policy. Auto-deleted after the OTP expires. Storing in PostgreSQL would require a cron job.
- `farmer_sessions` are onboarding state documents. Written after each step to enable reconnect resume. Deleted on Step 9 completion.
- `farm_alerts` are written by the VI engine after every analysis. The React frontend subscribes via Firestore real-time listeners for instant dashboard badge updates without polling.
- `org_live_stats` are aggregated stats pushed reactively to enterprise dashboards.

### PostgreSQL Schema -- 13 Tables

| Table | Purpose |
|---|---|
| `organizations` | FPO, cooperative, or agri-company accounts with plan tier |
| `users` | All user accounts linked to Firebase UID |
| `farmer_profiles` | Farmer-specific profile data and onboarding progress |
| `farmer_locations` | PIN-code-based location resolved via India Post PIN API |
| `farms` | Farm polygon as `GEOMETRY(POLYGON, 4326)`, area, ownership |
| `crops` | Crop name, variety, sowing date, season; multiple crops per farm |
| `irrigation` | Irrigation type and source per farm |
| `soil_info` | Soil type, pH, organic matter; one row per farm |
| `consents` | Farmer consents for satellite monitoring and data sharing |
| `vi_reports` | VI engine output: six index means, CVI stats, confidence score |
| `api_keys` | Hashed API keys for enterprise and third-party access |
| `api_request_logs` | Audit log of all API key calls |
| `webhooks` | Outbound webhook registrations for VI report events |

### Key Indexes

```sql
CREATE INDEX ON farms USING GIST(boundary_geom);
CREATE INDEX ON vi_reports(farm_id, created_at DESC);
CREATE INDEX ON users(mobile_number);
CREATE INDEX ON users(firebase_uid);
CREATE INDEX ON crops(farm_id) WHERE is_current = TRUE;
CREATE INDEX ON api_keys(key_hash);
```

The GIST index on `boundary_geom` makes polygon intersection queries O(log n). The composite `(farm_id, created_at DESC)` index enables `DISTINCT ON` to retrieve the latest VI report per farm in a single index scan.

### Firestore Collections

| Collection | Document ID | Lifecycle |
|---|---|---|
| `otp_sessions` | mobile number | TTL-deleted after OTP expiry |
| `farmer_sessions` | user UID | Deleted on Step 9 completion |
| `farm_alerts` | farm UUID | Overwritten on each VI analysis |
| `org_live_stats` | org UUID | Updated on each org-level analysis |

---

## API Reference

All endpoints are served by Flask at `http://127.0.0.1:5000`. The Vite dev server proxies `/api` and `/chatbot` with a 300-second timeout because GEE computations can be slow for large polygons.

### POST /api/analyze

Runs the full optical vegetation pipeline over the last 90 days.

**Request body:**
```json
{
  "polygon": {
    "type": "Polygon",
    "coordinates": [[[lon, lat], [lon, lat], "..."]]
  }
}
```

**Response:**
```json
{
  "stats": {
    "cvi": {
      "mean": 0.62, "median": 0.61, "std_dev": 0.05,
      "p25": 0.58, "p75": 0.66, "interpretation": "Healthy vegetation"
    },
    "ndvi": 0.86, "evi": 0.50, "savi": 0.47,
    "ndmi": 0.33, "ndwi": -0.78, "gndvi": 0.77,
    "scene_count": 4, "confidence": 78.3,
    "period_start": "2025-10-01", "period_end": "2026-01-01"
  },
  "grid": { "type": "FeatureCollection", "features": ["..."] },
  "tile_urls": {
    "ndvi": "https://earthengine.googleapis.com/...",
    "cvi":  "https://earthengine.googleapis.com/..."
  }
}
```

### GET /api/analyze-dates

Lists all Sentinel-2 acquisition dates available for a polygon within the last 90 days. Used by the Timeline Bar.

Query parameter: `polygon` (URL-encoded GeoJSON string)

### POST /api/analyze-day

Computes indices for a single Sentinel-2 acquisition date instead of a median composite.

Request body: `{ "polygon": {...}, "date": "2025-11-15" }`

### POST /api/sample

Returns index values for a single pixel. Used for the cursor hover tooltip. The previous indexed image is cached on `app._last_indexed_image` so no pipeline re-run is needed.

Request body: `{ "lat": 13.42, "lon": 75.53 }`

### POST /api/analyze-radar

Runs the Sentinel-1 SAR pipeline. Returns SMI, RVI, VV/VH ratio, VV, and VH grid plus tile URLs. Accepts an optional `date` field for single-date analysis.

### POST /api/auth/verify-token

Verifies a Firebase JWT issued after phone OTP auth. Returns decoded claims on success.

### GET /health

```json
{ "gee_ready": true, "firebase_ready": true, "status": "ok" }
```

### POST /chatbot/chat

```json
{
  "session_id": "uuid-string",
  "message": "Is there any drought stress in my field?",
  "farmData": { "cvi_mean": 0.62 },
  "heatmapData": { "features": ["..."] }
}
```

### POST /chatbot/reset

Clears chat history for the given `session_id`.

### GET /chatbot/health

Returns whether Ollama is reachable.

---

## Frontend Application

The frontend is a React 19 Single-Page Application built with Vite, served from `frontend/`.

### Component Overview

| Component | File | Responsibility |
|---|---|---|
| App | App.jsx | Top-level state; holds fields array and activeFieldId; auth gate |
| MapView | MapView.jsx | Leaflet map, polygon draw and edit via leaflet-draw |
| HeatmapLayer | HeatmapLayer.jsx | Renders GeoJSON grid as coloured Leaflet polygons |
| FarmSummary | FarmSummary.jsx | Stats sidebar showing CVI, individual indices, confidence |
| TimelineBar | TimelineBar.jsx | Date picker for available S2 acquisition dates |
| Legend | Legend.jsx | CVI and index colour legend with threshold labels |
| KrishiMitraPanel | KrishiMitraPanel.jsx | Chat UI; sends farmData and heatmapData on every message |
| PremiumAuthFlow | PremiumAuthFlow.jsx | Multi-step Firebase phone OTP auth with premium gating |
| AuthModal | AuthModal.jsx | OTP entry modal |
| LocationForm | LocationForm.jsx | Address form calling India Post PIN API |
| LayerToggle | LayerToggle.jsx | Switches between Optical and Radar analysis modes |
| LoadingOverlay | LoadingOverlay.jsx | Full-screen spinner during GEE calls |

### Multi-Field Model

`App.jsx` maintains a `fields[]` array where each entry carries its own `id`, `name`, `geometry`, `analysisData`, `availableDates`, and `selectedDate`. Multiple fields can be drawn and analysed independently. The active field is set by `activeFieldId`.

### API Client

`api.js` is the single Axios HTTP client. All calls target relative paths so the Vite proxy handles routing in development. Set `VITE_API_BASE_URL` in `frontend/.env` to target a non-proxied backend.

### Key Frontend Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^19.2.4 | UI framework |
| react-router-dom | ^7.18.0 | Client-side routing |
| leaflet | ^1.9.4 | Map rendering |
| react-leaflet | ^5.0.0 | React bindings for Leaflet |
| leaflet-draw | ^1.0.4 | Polygon drawing and editing |
| @turf/turf | ^7.3.4 | Client-side GeoJSON area and geometry utilities |
| recharts | ^3.8.1 | Stats charts in sidebar |
| firebase | ^12.12.0 | Firebase Auth client SDK |
| axios | ^1.18.1 | HTTP client |

---

## Configuration Reference

`backend/config.py` is the single tuning surface for all engine parameters. Do not hardcode thresholds or weights in service modules.

### Google Earth Engine

```python
GEE_PROJECT_ID       # Set via .env -- GCP project with Earth Engine API enabled
DATASET              # "COPERNICUS/S2_SR_HARMONIZED" -- Sentinel-2 Surface Reflectance
LOOKBACK_DAYS        # 90 -- analysis window in days
MAX_CLOUD_COVER_PCT  # 20 -- scene-level cloud filter percentage
SCL_MASK_VALUES      # [3, 8, 9, 10] -- cloud shadow, medium cloud, high cloud, cirrus
```

### CVI Weights

```python
CVI_WEIGHTS = {
    "NDVI":  0.70,
    "EVI":   0.10,
    "SAVI":  0.05,
    "NDMI":  0.10,
    "GNDVI": 0.05,
}
```

All values must sum to 1.0. Earlier documentation quoted different weights (0.35/0.25/0.15/0.15/0.10) -- those were legacy CLI values. Trust `config.py`.

### Grid Parameters

```python
GRID_SCALE_M        # 10 -- native Sentinel-2 resolution in metres
MAX_GRID_CELLS      # 2000 -- auto-coarsening budget
GRID_SCALE_STEP_M   # 2 -- step size when scaling up in metres
```

### Sentinel-1 SAR

```python
S1_DATASET          # "COPERNICUS/S1_GRD"
S1_INSTRUMENT_MODE  # "IW" -- Interferometric Wide swath
S1_ORBIT_PASS       # "DESCENDING" -- consistent dB across time
S1_LOOKBACK_DAYS    # 90
S1_DATE_WINDOW_DAYS # 6 -- plus/minus days for single-date composite
S1_SPECKLE_RADIUS_M # 50 -- focal median speckle filter radius
SMI_VV_DRY_DB       # -20.0 dB -- dry soil calibration reference
SMI_VV_WET_DB       # -8.0 dB -- wet soil calibration reference
```

### Confidence Score

```python
CONFIDENCE_SCENE_TARGET  # 5 -- target scene count for full confidence
CONFIDENCE_STD_MAX       # 0.3 -- max std dev before confidence starts dropping
```

---

## Installation and Setup

### Prerequisites

- Python 3.10 or later (Windows: use `py` launcher)
- Node.js 20 or later
- PostgreSQL 16 with PostGIS 3 extension
- A Google Cloud Project with the Earth Engine API enabled
- An Earth Engine registered account at earthengine.google.com
- A Firebase project with Phone Auth enabled
- Ollama installed and running for the Krishi Mitra chatbot

### Backend Setup

```powershell
# Clone the repository
git clone https://github.com/SanTiwari07/NDVI_satellite.git
cd NDVI_satellite

# Create and activate the virtual environment
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1

# Install all Python dependencies including chatbot requirements
.\venv\Scripts\pip.exe install -r requirements.txt -r chatbot\requirements.txt

# Authenticate with Google Earth Engine
.\venv\Scripts\earthengine.exe authenticate

# Configure environment variables
copy .env.example .env
# Edit .env and set GEE_PROJECT_ID at minimum

# Start the Flask server
.\venv\Scripts\python.exe app.py
# Health check: GET http://127.0.0.1:5000/health
```

On Linux or macOS, replace `py` with `python3` and use `source venv/bin/activate` instead of the PowerShell activation script.

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
# Dev server starts at http://localhost:5173
```

### Database Setup

See `DATABASE_SETUP.md` for the complete walkthrough. Summary:

```sql
psql -U postgres
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE DATABASE mindstrix;
\c mindstrix
\i mindstrix_setup.sql
```

### Chatbot Setup

```bash
# Install Ollama from https://ollama.com
ollama serve
ollama pull llama3.2
```

---

## Environment Variables

### backend/.env

```ini
# Required
GEE_PROJECT_ID=your-gcp-project-id

# Database -- enables onboarding and VI report persistence
DATABASE_URL=postgresql://user:password@localhost:5432/mindstrix

# Firebase Admin -- enables auth verification
FIREBASE_SERVICE_ACCOUNT_PATH=../serviceAccountKey.json

# JWT -- required if Firebase auth is enabled
JWT_SECRET_KEY=your-very-long-random-secret

# Flask
FLASK_ENV=development
FLASK_DEBUG=1
```

### backend/chatbot/.env

```ini
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
CHATBOT_MAX_HISTORY=10
```

### frontend/.env

```ini
# Leave empty to use Vite proxy in development
VITE_API_BASE_URL=

# Firebase web config -- required for phone auth
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Never commit `.env` files or `serviceAccountKey.json`. Both are in `.gitignore`.

---

## Deployment

### Frontend -- Firebase Hosting

```powershell
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend -- Cloud Run

The Flask API is stateless (JWT auth, no server-side session storage) and deploys cleanly to Cloud Run:

```bash
gcloud run deploy mindstrix-api \
  --source backend/ \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEE_PROJECT_ID=your-project
```

Set `VITE_API_BASE_URL` in the frontend `.env` to the Cloud Run service URL and rebuild the frontend.

### Scaling to 100,000 Farmers

Full rationale is documented in `SYSTEM_DESIGN.md`. Key points:

**Connection pooling** -- `psycopg2.ThreadedConnectionPool(max=20)` handles Flask multi-threaded mode. For 100K concurrent users, deploy behind Gunicorn with 4-8 workers and PgBouncer in transaction mode to multiplex thousands of app connections onto approximately 50 PostgreSQL server connections.

**GEE batch jobs** -- At scale, the VI Engine runs as scheduled Earth Engine batch tasks (`Export.image.toCloudStorage`) dispatched by Cloud Tasks or Celery plus Redis, one polygon per task, grouped by district to minimise API quota usage.

**Read replicas** -- Dashboard queries join farmers, farms, crops, and the latest VI report per farm. Add a PostgreSQL read replica and route `GET /dashboard` to it.

**Horizontal API scaling** -- Multiple Cloud Run instances can run concurrently. The API is fully stateless.

---

## Repository Layout

```
NDVI_satellite/
├── backend/
│   ├── app.py                      Flask entrypoint; GEE/Firebase lazy init; CORS config
│   ├── config.py                   Central configuration -- the only file to tune
│   ├── requirements.txt            Backend Python dependencies
│   ├── .env.example                Environment variable template
│   ├── services/
│   │   ├── gee_service.py          Sentinel-2 filter, cloud mask, composite, tile URLs
│   │   ├── index_service.py        NDVI, EVI, SAVI, NDMI, NDWI, GNDVI, CVI computation
│   │   ├── grid_service.py         Polygon tiling, Gaussian smoothing, GeoJSON emission
│   │   ├── stats_service.py        Farm-wide stats and confidence score calculation
│   │   ├── sar_service.py          Sentinel-1 SAR pipeline
│   │   ├── radar_index_service.py  SMI, RVI, VV/VH ratio computation
│   │   └── radar_grid_service.py   SAR heatmap grid generation
│   ├── chatbot/
│   │   ├── routes.py               Blueprint: /chatbot/chat, /reset, /health
│   │   ├── chain.py                LangChain ChatOllama chain builder
│   │   ├── memory.py               Per-session chat history management
│   │   ├── config.py               Chatbot-specific config
│   │   └── prompts/                System prompt builder injecting live farm data
│   ├── blueprints/                 Onboarding step blueprints
│   ├── repositories/               PostgreSQL data access objects
│   ├── firestore/                  Firestore session and alert helpers
│   ├── middlewares/                JWT verification middleware
│   ├── utils/
│   │   └── geo_utils.py            GeoJSON validation and ee.Geometry conversion
│   └── legacy/
│       ├── main.py                 Original interactive CLI entry point (reference only)
│       └── gee_engine.py           Original monolithic GEE engine (reference only)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 Top-level state and auth gate
│   │   ├── api.js                  Single Axios HTTP client
│   │   ├── firebase.js             Firebase Auth client initialisation
│   │   ├── MapView.jsx             Leaflet map with polygon draw and edit
│   │   ├── HeatmapLayer.jsx        GeoJSON grid rendered as coloured polygons
│   │   ├── FarmSummary.jsx         Index stats sidebar
│   │   ├── KrishiMitraPanel.jsx    Chatbot UI
│   │   ├── PremiumAuthFlow.jsx     Firebase phone OTP auth flow
│   │   ├── TimelineBar.jsx         Acquisition date picker
│   │   └── colorUtils.js           CVI and index colour scale utilities
│   ├── vite.config.js              Dev proxy: /api and /chatbot to port 5000
│   └── package.json
│
├── mindstrix_setup.sql             Complete PostgreSQL DDL
├── DATABASE_SETUP.md               Step-by-step database setup guide
├── DATABASE_SETUP_WINDOWS.md       Windows-specific PostgreSQL notes
├── SYSTEM_DESIGN.md                Architecture decisions and scalability rationale
├── CLAUDE.md                       AI assistant context for this repository
├── firebase.json                   Firebase Hosting configuration
├── .firebaserc                     Firebase project alias
└── .gitignore                      Excludes .env, serviceAccountKey.json, venv, node_modules
```

---

## Contributing

There is no automated test suite. GEE pipeline correctness is validated by hitting the live endpoints with real polygon coordinates.

**Configuration changes** -- Make them only in `backend/config.py`. Do not scatter thresholds into service modules.

**GEE isolation** -- All Google Earth Engine API calls must stay in `backend/services/gee_service.py`. Other service modules receive `ee.Image` and `ee.Geometry` objects -- they never call GEE directly.

**Secrets** -- Never commit `.env` files or `serviceAccountKey.json`. Verify with `git status` before every push.

**Weight changes** -- If you update `CVI_WEIGHTS`, update the weights table in this README as well so documentation stays accurate.

**New indices** -- Add the band formula to `index_service.py`, add an interpretation threshold dictionary to `config.py`, and register it in `CVI_WEIGHTS` ensuring the total remains 1.0.

---

*MindstriX -- Built for agronomists, precision farmers, and agritech teams who need satellite intelligence that goes beyond NDVI.*
