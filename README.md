# VERIFIED

Mobile-first onboarding prototype for UFCU. This repository currently contains the application foundation only: a React/Vite frontend, a FastAPI backend, shared UI primitives, route placeholders, and the VERIFIED design tokens.

## Project structure

```text
frontend/   React + Vite + TypeScript + Tailwind
backend/    FastAPI application and tests
docs/       Product and visual design source of truth
```

## Frontend

Requires Node.js `20.19+` (or `22.12+`) and pnpm 11.

```bash
cd frontend
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Its health check is available at `GET /api/health`.

## Scope

This foundation intentionally does not implement onboarding features or simulated provider workflows yet. The route map mirrors the future product flow so screens can be added without restructuring the shell.
