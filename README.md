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

## Socure identity verification demo

After the synthetic passport scan, `/identity/verify` shows the exact identity fields proposed for
sharing and requires an explicit **Allow & Continue** action. **Not Now** makes no verification
request. The browser posts only the approved legal name, date of birth, passport number, and
nationality to `POST /api/identity/socure/verify`; it never calls Socure directly.

`IDENTITY_PROVIDER=mock_socure` is the default. `MockSocureVerificationProvider` implements the
same `SocureVerificationProvider` boundary reserved for a future authenticated integration, but it
runs fully offline and does not claim access to a passport, government record, or live Socure
capability. The response is labeled `Socure — Demo Verification` throughout the UI.

Consent audit events contain only the provider, purpose, shared field names, decision, event ID,
and server timestamp—never identity values. Validation and frontend errors do not echo sensitive
inputs. A future live server transport must load `SOCURE_API_KEY` and `SOCURE_API_BASE_URL` from
backend environment variables, rejects non-HTTPS endpoints, and sets TLS 1.2 as its minimum.
No Socure secret is exposed through a `VITE_*` variable or frontend bundle.

The school endpoint receives only the school identifier and minimum identity-matching fields after
the member explicitly starts verification. For local development, set
`STUDENT_VERIFICATION_PROVIDER=mock_nsc`. For example, send:

```json
{
  "schoolId": "austin-community-college",
  "identity": {
    "firstName": "MARCO",
    "lastName": "AMMERMAN",
    "dateOfBirth": "1999-01-01"
  }
}
```

The synthetic demo identity returns a successful response labeled
`National Student Clearinghouse — Demo Verification` in the UI. The backend implementation is
`MockNationalStudentClearinghouseProvider`, behind a `StudentVerificationProvider` protocol, so an
authorized production provider can replace it later without changing the frontend flow. It does
not contact NSC or a school, collect school credentials, or require internet access.

To run backend tests from `backend/`, use `python -m pytest` after installing the dev dependencies.

## Nova Credit Sandbox

Copy `.env.example` and set `NOVA_CLIENT_ID`, `NOVA_SECRET_KEY`, `NOVA_PUBLIC_ID`, and `NOVA_PRODUCT_ID`. With `NOVA_PROVIDER=auto`, the backend uses the Nova Credit sandbox only when all credentials are present; otherwise it returns a visibly labeled demo mock provider. `NOVA_PROVIDER=mock` or `MOCK_NOVA=true` forces the demo provider.

Nova credentials, access tokens, status calls, and Credit Passport retrieval remain server-side. The browser receives only NovaConnect's public/product IDs and its 10-minute single-use initialization token. Configure Nova webhooks to post to `/api/nova/webhook`; client polling remains enabled as the fallback completion signal.

## Scope

The implemented school verification path lives at `/school`, and the international credit path
lives at `/credit`. The remaining route placeholders mirror the broader product flow.
