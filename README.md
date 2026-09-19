# VERIFIED

Mobile-first onboarding prototype for UFCU. It includes a React/Vite frontend, a FastAPI backend, shared UI primitives, and a consent-driven international credit history flow using Nova Credit Sandbox with a demo-safe fallback.

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

## Nova Credit Sandbox

Copy `.env.example` and set `NOVA_CLIENT_ID`, `NOVA_SECRET_KEY`, `NOVA_PUBLIC_ID`, and `NOVA_PRODUCT_ID`. With `NOVA_PROVIDER=auto`, the backend uses the Nova Credit sandbox only when all credentials are present; otherwise it returns a visibly labeled demo mock provider. `NOVA_PROVIDER=mock` or `MOCK_NOVA=true` forces the demo provider.

Nova credentials, access tokens, status calls, and Credit Passport retrieval remain server-side. The browser receives only NovaConnect's public/product IDs and its 10-minute single-use initialization token. Configure Nova webhooks to post to `/api/nova/webhook`; client polling remains enabled as the fallback completion signal.

## Scope

The implemented international credit path lives at `/credit`; the remaining route placeholders mirror the broader product flow.
