# MindstriX — Satellite Agronomy Intelligence Platform

MindstriX is a production-grade, full-stack precision-agriculture platform that converts raw satellite imagery into actionable farm-level intelligence. A farmer or agronomist draws a polygon on an interactive Leaflet map, and within seconds the system returns a per-cell heatmap grid showing vegetation health, soil moisture, and chlorophyll status — powered entirely by Google Earth Engine running on Sentinel-2 optical and Sentinel-1 radar imagery. An on-device LLM chatbot, Krishi Mitra, answers natural-language questions about the current field using live stats as grounded context.

---

## Technical Documentation Suite

The project includes an enterprise-grade, multi-file engineering documentation suite inside `/docs`:

### Root Manuals
- [**Master Index (`docs/README.md`)**](./docs/README.md)
- [**Project Context**](./docs/PROJECT_CONTEXT.md)
- [**System Architecture**](./docs/ARCHITECTURE.md)
- [**Introduction**](./docs/01_INTRODUCTION.md)
- [**System Overview**](./docs/02_SYSTEM_OVERVIEW.md)
- [**Changelog**](./docs/CHANGELOG.md)
- [**Contributing Guidelines**](./docs/CONTRIBUTING.md)
- [**Current Implementation State**](./docs/CURRENT_STATE.md)
- [**How to Run Guide**](./docs/HOW_TO_RUN.md)
- [**Validation Procedures**](./docs/VALIDATION.md)
- [**Documentation Audit Report**](./docs/DOCUMENTATION_AUDIT_REPORT.md)

### Subsystem Manuals
- [**Architecture Subsystems (`docs/architecture/`)**](./docs/README.md#subsystem-architecture-docsarchitecture)
- [**Dashboard Subsystems (`docs/dashboard/`)**](./docs/README.md#dashboard--ui-subsystems-docsdashboard)
- [**System Evaluation (`docs/evaluation/`)**](./docs/README.md#system-evaluation-docsevaluation)
- [**Future Engineering (`docs/future/`)**](./docs/README.md#future-development-docsfuture)

---

## Quickstart

### Prerequisites
- Python 3.10+
- Node.js 20+
- PostgreSQL 16 with PostGIS 3.x
- GCP project with Earth Engine API enabled
- Firebase Project with Phone Auth
- Ollama running `llama3.2`

### Run Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1
pip install -r requirements.txt -r chatbot/requirements.txt
earthengine authenticate
python app.py
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

*MindstriX — Precision Satellite Agronomy Intelligence*
