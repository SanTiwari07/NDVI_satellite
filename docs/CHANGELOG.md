# Changelog

All notable changes to the MindstriX Satellite Agronomy Intelligence Platform documentation and codebase structure are recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-07-27

### Added
- Created complete 27-document enterprise engineering documentation suite under `/docs/`.
- Created dedicated subsystem architecture guides for Google Earth Engine (`03_GOOGLE_EARTH_ENGINE.md`), Sentinel-2 (`04_SENTINEL2_PIPELINE.md`), Sentinel-1 (`05_SENTINEL1_PIPELINE.md`), and Vegetation Indices (`06_VEGETATION_INDICES.md`).
- Added comprehensive API specifications (`07_API_ARCHITECTURE.md`), Backend architecture (`08_BACKEND_ARCHITECTURE.md`), and Frontend architecture (`09_FRONTEND_ARCHITECTURE.md`).
- Documented Firebase Auth integration (`10_FIREBASE_AUTH.md`), dual-database architecture (`11_DATABASE.md`), and Krishi Mitra chatbot implementation (`12_CHATBOT.md`).
- Created dedicated dashboard pages and components documentation (`18_DASHBOARD.md` to `22_COMPONENTS.md`).
- Added evaluation metrics, performance analysis (`23_PERFORMANCE.md`), limitations (`24_LIMITATIONS.md`), known issues (`25_KNOWN_ISSUES.md`), and future roadmap (`26_FUTURE_WORK.md`, `27_ROADMAP.md`).

### Changed
- Standardized documentation paths to maintain zero drift with the live source code.
- Restructured `README.md` at project root to point directly to `docs/README.md`.

### Removed
- Removed legacy unorganized root markdown files (`SYSTEM_DESIGN.md`, `DATABASE_SETUP.md`, `DATABASE_SETUP_WINDOWS.md`), consolidating their technical facts into dedicated `/docs/` subsystem manuals.
