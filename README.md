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

On Windows PowerShell, use Python 3.11 or newer:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Its health check is available at `GET /api/health`.
Open `http://localhost:8000/docs` to try `POST /api/school/verify`.

The school endpoint checks structured passport identity data against synthetic Austin Community
College student records. For example, send:

```json
{
  "first_name": "MARCO",
  "middle_name": "REED",
  "last_name": "AMMERMAN",
  "date_of_birth": "1999-01-01"
}
```

This record returns `{"verified": true, "status": "verified", "school": "Austin Community College", "source": "ACC Demo Connection"}`.
An inactive demo record is `JORDAN LEE CHEN`, born `2000-05-12`. Any other identity returns
`no_match`. The middle name may be omitted; when supplied, it must match. Multiple matching
records return `ambiguous` rather than verifying a student. This is demo data, not a real
school connection. The frontend should call this endpoint only after the member initiates
school verification.

To run backend tests from `backend/`, use `python -m pytest` after installing the dev dependencies.

## Scope

The backend currently includes mock school verification. Other onboarding features and provider
workflows are still placeholders.
