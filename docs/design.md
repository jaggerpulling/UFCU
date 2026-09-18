# VERIFIED — Design Spec (Cursor Context Document)

> This file is the single source of truth for this project. Read it fully before making any change. If a request conflicts with this file, flag the conflict instead of silently deviating.

## 1. Product Summary

VERIFIED is a personalized onboarding experience for UFCU. It replaces a generic document checklist with a dynamic, transparent flow: understand the member's situation, tell them exactly what they need, verify documents with visible AI confidence, then carry that verified profile into personalized financial guidance.

**Hero use case (not a limitation):** an international F-1 student opening their first UFCU account. The architecture is designed to generalize, but the demo and MVP build around this one scenario only.

**Three-part thesis, said in this order every time it's described:**
1. **Understand me** — personalized requirements, not a generic checklist
2. **Show me** — AI decisions are visible, sourced, and correctable, never silently trusted
3. **Help me** — verified profile becomes personalized financial guidance (not "AI financial advisor" — call it "Personalized Financial Guide" everywhere in UI copy and pitch)

## 2. Non-Goals (do not build these, even if asked to expand scope)

- Real KYC / identity verification against government or bureau data — simulated only
- Real account opening or banking backend
- Multi-language support beyond a UI toggle stub
- A fancy audit log UI — the log is a database table only, never a dedicated screen
- Multi-agent AI orchestration — one multimodal call for extraction, one LLM call for guidance
- Any output framed as investment, legal, or immigration advice

## 3. Core Architectural Rule

**The rules engine, not an LLM, decides what documents/information are required.** This is deterministic, testable, and hallucination-proof. AI is used only for: (a) reading/extracting data from documents, (b) turning the verified profile into personalized guidance text. Never let an LLM decide a requirement. Never let an LLM's output bypass the confidence/confirmation loop.

## 4. Demo Scenario (build this one path perfectly before generalizing)

```json
{
  "residency": "international",
  "visa": "F1",
  "studentType": "new",
  "school": "UT Austin",
  "program": "Computer Science",
  "programEnd": "2027-08-31",
  "annualIncome": 18000,
  "monthlyExpenses": 1400,
  "savings": 1500,
  "usCreditHistory": false,
  "goals": ["build_credit", "save_for_tuition", "everyday_banking"]
}
```

Hardcode this as the seed/test student. Every screen should work end-to-end against this data before anything is made dynamic.

## 5. Flow (in order)

```
Intake questions (residency, visa/status, program stage)
  → Rules engine generates required document list, each with a plain-language "why"
  → Document scan/upload (photo or file)
  → AI extraction with per-field confidence + source bounding box
  → Low-confidence fields surfaced for user confirm/edit; high-confidence auto-fills
  → Confidence-weighted profile builds (verified / self-reported / inferred)
  → "Membership-ready" progress state ("3 of 4 requirements complete")
  → Financial goals question (multi-select)
  → Personalized Financial Guide screen, each recommendation tagged with its source facts
  → "Why am I seeing this?" expandable explanation on every recommendation
  → (backend only, never a UI screen) append-only audit log of every step
```

## 6. Data Model

Every piece of profile data carries a source. This is the core trust mechanic — never store a bare value without its source and confidence.

```typescript
type Source = "document" | "self_reported" | "inferred";

interface ProfileField {
  value: string | number | boolean;
  source: Source;
  confidence?: number; // only present for "document" source
  verified: boolean;   // true once user has confirmed or field was high-confidence
  sourceRegion?: [number, number, number, number]; // bounding box, "document" source only
}

interface MemberProfile {
  identity: Record<string, ProfileField>;   // visaStatus, program, programEnd, name, etc.
  finances: Record<string, ProfileField>;   // income, expenses, savings, creditHistory
  goals: string[];                          // self-reported, no ProfileField wrapper needed
}
```

## 7. Rules Engine

Pure function, no AI, fully unit-testable.

```typescript
function getRequirements(input: {
  residency: string;
  visa?: string;
  studentType?: string;
}): Requirement[]

interface Requirement {
  id: string;          // "passport", "i20", "proof_of_address"
  name: string;
  required: boolean;
  why: string;          // plain-language explanation shown to the member
}
```

Start with one branch (international + F1 + new) fully correct. Add branches only after the demo path is solid.

## 8. Document Extraction Endpoint

```
POST /documents/extract
Input: { image: base64, document_type: string }
Output: {
  document_type: string,
  fields: [
    { name: string, value: string, confidence: number, source_region: [x,y,w,h] }
  ]
}
```

Confirm before building against this: does the chosen multimodal model actually return usable bounding boxes for extracted fields? If not, fall back to highlighting the whole document image rather than a precise region — still meets the "show your work" bar, just less precise.

## 9. Confidence Threshold Logic

- `confidence >= 0.90` → auto-fill, mark verified, no interruption
- `confidence < 0.90` → surface to user with source region, require explicit confirm/edit before marking verified
- On confirm: `verified = true`, keep original confidence value for the record (don't overwrite it — the audit log should show "76% → user confirmed")

## 10. AI Guidance Generation

System prompt constraints (enforce these, do not let them drift):
- Use ONLY the supplied profile JSON. No external knowledge about the member.
- No legal, immigration, tax, or licensed investment advice.
- Every recommendation must cite which profile fields (with their source) justify it.
- Every recommendation must be inspectable via a "why am I seeing this" expansion using the same cited fields.
- Output strict JSON matching the schema below — never freeform prose the UI has to parse.

```json
{
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "reasons": ["string"],
      "sourceFields": ["finances.income", "goals"],
      "confidence": 0.0
    }
  ]
}
```

## 11. Audit Log

Table only, never a UI screen (mentionable in pitch/Q&A, shown on an architecture slide if needed, not built as a feature).

```
events: id, timestamp, event_type, field, old_value, new_value, confidence, source
event_type ∈ { DOCUMENT_UPLOADED, FIELD_EXTRACTED, FIELD_FLAGGED, FIELD_CONFIRMED, PROFILE_UPDATED, RECOMMENDATION_GENERATED }
```

Append-only: the codebase should never contain an UPDATE or DELETE against this table.

## 12. Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: FastAPI
- DB: SQLite
- AI: one multimodal call for document extraction, one LLM call for guidance generation — no multi-agent framework
- Keep the stack boring. Time goes into the product, not infrastructure choices.

## 13. Build Priority Order (stop-and-polish points marked)

0. Demo scenario hardcoded (Section 4)
1. Document scan/upload UI
2. Extraction + confidence scoring working end-to-end
3. Source-region / confirm-or-edit verification UI — **this is the single most important interaction in the whole product; do not deprioritize it under time pressure**
4. Profile auto-builds from confirmed data
5. Financial Guide consumes the real profile (not hardcoded copy) — **if behind schedule, stop here and polish 0–5 rather than continuing**
6. Personalized document rules generalized beyond the one demo branch
7. Audit log backend
8. Everything else (multi-language stub, additional visa branches, etc.)

## 14. Language Rules for UI Copy and Pitch

- Never call it "AI financial advisor" — use "Personalized Financial Guide" / "UFCU Financial Guidance"
- Every AI-derived screen has a visible "Why am I seeing this?" affordance
- Every profile field visibly shows its source tag: ✓ Verified / ◇ Self-reported / ✦ Inferred
- State plainly, when asked: real KYC is simulated; production would integrate a licensed provider (Persona/Jumio) and UFCU's existing identity/compliance systems
