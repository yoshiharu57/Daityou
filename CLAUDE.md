# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

橋梁管理システム (Bridge Management System) — a full-stack web app for municipal bridge infrastructure management. Backend is Python/FastAPI with SQLite; frontend is React/Vite. All UI strings are in Japanese.

## Development Commands

### Start (Development)
```bash
bash start_dev.sh
# Backend on http://localhost:8000, Frontend dev server on http://localhost:3000
```

### Start (Production)
```bash
bash start.sh
# Builds frontend, seeds DB, serves everything from port 8000
```

### Backend only
```bash
cd backend
pip install -r requirements.txt
python seed_data.py          # seed sample data
uvicorn main:app --reload --port 8000
```

### Frontend only
```bash
cd frontend
npm install
npm run dev      # dev server on port 3000 (proxies /api → localhost:8000)
npm run build    # production build into frontend/dist/
```

## Architecture

### Request Flow
```
Browser → Vite dev proxy (/api → :8000) → FastAPI routers → SQLAlchemy → SQLite
```
In production, FastAPI itself serves the built frontend static files from `frontend/dist/`.

### Backend (`backend/`)
- `main.py` — FastAPI app entry point; mounts routers, configures CORS, serves static files
- `database.py` — SQLite engine + `SessionLocal` factory; use `get_db()` dependency in routes
- `models.py` — SQLAlchemy ORM: `Bridge → Inspection → DamageRecord`, `Inspection → Photo`
- `schemas.py` — Pydantic v2 request/response schemas (separate `Create`/`Response` pairs)
- `routers/bridges.py` — CRUD for bridges; search via query param `q`
- `routers/inspections.py` — Inspection CRUD + `POST /api/inspections/{id}/damage` for damage records
- `routers/photos.py` — Multipart upload; files stored at `uploads/bridge_{id}/inspection_{id}/`

### Frontend (`frontend/src/`)
- `api.js` — All Axios calls go through here; also exports domain constants (`HEALTH_RATINGS`, `MEMBER_TYPES`, `DAMAGE_TYPES`, `STRUCTURE_TYPES`) and helpers (`formatDate`, `getGoogleMapsUrl`)
- `App.jsx` — React Router v6 routes + persistent navbar
- `pages/` — Full-page views: `BridgeListPage`, `BridgeDetailPage`, `BridgeFormPage`
- `components/` — Sub-page sections used by detail/form pages: `BridgeLedger`, `InspectionList`, `PhotoGallery`

### Data Model
```
Bridge (management_number unique)
  └─ Inspection (date, type, health_rating I/II/III/IV, inspector)
       ├─ DamageRecord (member_type, damage_type, extent, repair_method)
       └─ Photo (uuid-named file, member_type, damage_type, caption)
```

Health ratings: `I` = good (green), `II` = fair (cyan), `III` = poor (yellow), `IV` = critical (red).

### Allowed photo formats
`jpg`, `jpeg`, `png`, `gif`, `bmp`, `tiff`, `pdf` — validated in `routers/photos.py` and stored with UUID filenames.

## Key Conventions

- **No tests exist** — there is no test suite; manual testing via the running app is the current workflow.
- **Japanese strings** — all user-facing labels, error messages, and field names are in Japanese; keep them that way.
- **Domain constants live in `api.js`** — add new lookup values (structure types, damage types, etc.) there, not scattered across components.
- **CSS theme variables** are defined in `frontend/src/index.css`: primary `#1a4f8a` (navy), accent `#e8a020` (gold).
- **SQLite file** is created at `backend/bridge_management.db` on first run; `seed_data.py` is idempotent.
