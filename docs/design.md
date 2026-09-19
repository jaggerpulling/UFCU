# VERIFIED — Design Spec (Cursor Context Document)

> This file is the single source of truth for this project. Read it fully before making any change. If a request conflicts with this file, flag the conflict instead of silently deviating.

## 1. Product Summary

VERIFIED is a personalized onboarding experience for UFCU built around one principle:

**A newcomer should not have to start their financial identity from zero.**

Instead of making a prospective member repeatedly enter information and upload documents, VERIFIED starts with a trusted identity credential, retrieves or verifies information through connected systems with the member's permission, asks only for what is missing, and builds a reusable verified profile.

**Hero use case:** an international F-1 student arriving in Austin and opening their first UFCU account.

The demo focuses entirely on this scenario, but the architecture represents a broader onboarding model that could later support other UFCU members.

### Core thesis

1. **Know me** — establish identity from a trusted credential instead of making me re-enter it
2. **Verify me** — retrieve information from trusted sources with my permission and clearly show what was verified
3. **Bring my history** — allow international members to connect financial history they already established outside the U.S.
4. **Help me start** — use the resulting profile to make UFCU onboarding and product discovery more relevant

### Core product principle

> Use trusted information to eliminate questions we already have answers to. Only ask the member for what is missing.

---

## 2. Non-Goals

Do not expand scope beyond the hackathon prototype.

- No production KYC implementation
- No real UFCU account creation
- No real underwriting or lending decisions
- No real debit or credit card provisioning
- No Apple Pay / Google Pay provisioning
- No direct government database integration
- No real SEVIS, CBP, DHS, or university integration
- No requirement to use a real Nova Credit API
- No multi-language implementation beyond an optional UI stub
- No multi-agent AI architecture
- No dedicated audit log UI
- No investment, legal, immigration, tax, or lending advice
- No claim that passport NFC alone contains immigration, enrollment, or financial information
- No claim that passport NFC replaces every document UFCU may legally or operationally require

External verification systems are simulated unless a safe sandbox or demo API is available.

---

## 3. Core Architecture

The passport is the **identity anchor** for the onboarding experience.

It does not contain every piece of information required for onboarding.

Instead:

```text
Passport NFC
      ↓
Identity established
      ↓
Member consent
      ↓
Connected verification sources
      ↓
School / student verification
International credit history
Other future verification sources
      ↓
VERIFIED Profile
      ↓
Membership-ready
      ↓
Personalized UFCU experience
```

VERIFIED should never imply that possession of passport information automatically grants access to external databases.

Every external connection requires visible member consent.

For the hackathon, external integrations may be simulated while preserving the UX and architecture that a production integration would use.

---

## 4. Demo Scenario

Build one path extremely well.

```json
{
  "residency": "international",
  "visa": "F1",
  "studentType": "new",
  "school": "Austin Community College",
  "program": "Computer Science",
  "programEnd": "2027-08-31",
  "countryOfOrigin": "demo_country",
  "usCreditHistory": false,
  "internationalCreditHistory": true,
  "goals": [
    "build_credit",
    "save_for_tuition",
    "everyday_banking"
  ]
}
```

Use synthetic data for the stored demo profile.

A real NFC-enabled passport may be used to demonstrate the physical NFC interaction, but real passport data must not be required for the rest of the demo.

After demonstrating NFC, the application may transition to synthetic demo data.

---

## 5. Primary User Flow

```text
Welcome / UFCU interest
        ↓
"Let's get you set up"
        ↓
Scan passport
        ↓
Passport NFC
        ↓
Identity established
        ↓
"Where do you attend school?"
        ↓
Austin Community College
        ↓
"Verify with ACC"
        ↓
Member consent
        ↓
Simulated school login
        ↓
Student information verified
        ↓
"Do you have credit history outside the U.S.?"
        ↓
YES
        ↓
Connect international credit
        ↓
Member consent
        ↓
Nova Credit / simulated Nova flow
        ↓
International credit profile retrieved
        ↓
VERIFIED PROFILE
        ↓
Membership-ready
        ↓
Financial goals
        ↓
Personalized UFCU Financial Guide
```

The experience should feel dramatically shorter than filling out a traditional application.

---

## 6. Screen 1 — Welcome

The first screen should not look like a form.

Primary message:

**Your financial identity should move with you.**

Supporting copy:

> Get started with UFCU without entering information we can securely verify.

Primary CTA:

**Get started**

Secondary trust message:

> You're always in control of what you connect.

The UI should immediately communicate simplicity, security, and member control.

---

## 7. Screen 2 — Passport Identity

Primary CTA:

**Scan passport**

Explain why before requesting access:

> Your passport securely establishes your identity so you don't have to enter the same information manually.

### NFC flow

```text
Scan passport data page / obtain access information
        ↓
Hold passport near phone
        ↓
NFC detected
        ↓
Reading secure passport chip
        ↓
Identity established
```

Display a polished scanning state.

Example completion state:

```text
Identity established

✓ Name
✓ Date of birth
✓ Nationality
✓ Passport
✓ Photo

Continue
```

Do not show unnecessary technical details such as BAC, PACE, data groups, MRZ keys, or cryptographic operations in the primary UI.

Those belong in architecture or judge Q&A.

### Important implementation rule

The NFC interaction may be real or simulated.

The demo must work perfectly without the physical passport.

Never make the entire demo dependent on NFC hardware succeeding.

---

## 8. Screen 3 — School

After identity is established, ask only:

**Where do you attend school?**

Provide a search/select interaction.

Demo selection:

**Austin Community College**

Then display:

```text
Verify your student information

Connect your school account so we can verify
your enrollment information instead of asking
you to upload it manually.

[ Continue with ACC ]
```

---

## 9. Screen 4 — School Verification

This integration is simulated for the hackathon.

Show a realistic authorization transition:

```text
Austin Community College

VERIFIED is requesting permission to verify:

✓ Enrollment status
✓ Program
✓ Expected completion date

[ Allow and continue ]
```

Then briefly show:

```text
Verifying student information...
```

Completion:

```text
Student information verified

✓ Austin Community College
✓ Currently enrolled
✓ Computer Science
✓ Expected completion: August 2027
```

The user should understand where this information came from.

Label the source:

**Source: Austin Community College — Demo Connection**

Never imply the prototype has actual ACC API access.

---

## 10. Screen 5 — International Financial History

After student verification:

**Do you have credit history outside the United States?**

Supporting copy:

> Moving countries shouldn't mean leaving your financial history behind.

Options:

**Yes, connect my history**

**No / Skip for now**

If YES:

```text
Bring your credit history with you

Securely connect eligible credit history from
your home country.

Powered by Nova Credit

[ Connect credit history ]
```

The user must explicitly initiate this connection.

---

## 11. Screen 6 — Nova Credit Connection

Nova Credit represents the production path for consumer-permissioned international credit information.

For the hackathon:

- Prefer Nova's sandbox if credentials and integration are readily available
- Otherwise simulate the NovaConnect experience
- Never allow Nova integration work to threaten the core demo
- Clearly identify synthetic financial information as demo data

Simulated sequence:

```text
Connecting securely...

Finding your credit history...

Translating your financial profile...

Building your VERIFIED profile...
```

Then:

```text
International credit profile connected

✓ 4 years of credit history
✓ 3 active accounts
✓ Strong payment history
✓ No reported delinquencies

Source: Nova Credit — Demo Data
```

Exact numbers are synthetic demo values.

Do not claim Nova itself makes a UFCU lending or underwriting decision.

The architecture should treat Nova data as an input UFCU could use within its existing compliance, underwriting, and decisioning processes.

---

## 12. VERIFIED Profile

The profile is the central data object in the product.

Every field must have a source.

```typescript
type Source =
  | "passport"
  | "school"
  | "nova_credit"
  | "self_reported"
  | "inferred"
  | "demo";

interface ProfileField {
  value: string | number | boolean;
  source: Source;
  verified: boolean;
  confidence?: number;
  sourceLabel?: string;
}

interface MemberProfile {
  identity: Record<string, ProfileField>;
  student: Record<string, ProfileField>;
  finances: Record<string, ProfileField>;
  goals: string[];
}
```

Example:

```json
{
  "identity": {
    "name": {
      "value": "Demo Student",
      "source": "passport",
      "verified": true
    },
    "nationality": {
      "value": "Demo Country",
      "source": "passport",
      "verified": true
    }
  },
  "student": {
    "school": {
      "value": "Austin Community College",
      "source": "school",
      "sourceLabel": "ACC Demo Connection",
      "verified": true
    }
  },
  "finances": {
    "internationalCreditHistory": {
      "value": true,
      "source": "nova_credit",
      "sourceLabel": "Nova Credit Demo Data",
      "verified": true
    }
  },
  "goals": []
}
```

---

## 13. Trust Model

Transparency is still a major product differentiator, but the trust mechanic has changed.

The primary question is no longer:

**"How confident is AI that it read my document correctly?"**

It is:

**"Where did this information come from, and did I authorize it?"**

Every important field should expose its source.

Examples:

```text
Name
Demo Student
✓ Passport verified
```

```text
Enrollment
Currently enrolled
✓ Austin Community College
```

```text
International credit history
4 years
✓ Nova Credit
```

```text
Goal
Build U.S. credit
◇ You told us
```

Use consistent source indicators throughout the app.

Suggested visual language:

- ✓ Verified source
- ◇ You told us
- ✦ Inferred

Never present inferred information as verified.

---

## 14. Consent Model

Every external connection must be initiated by the member.

The UX pattern is:

```text
Explain value
      ↓
Explain requested information
      ↓
User chooses Connect
      ↓
Authorization / consent
      ↓
Retrieve
      ↓
Show result + source
```

Never silently retrieve external information.

Example:

```text
Connect your international credit history?

VERIFIED will request eligible credit information
through Nova Credit to help build your financial
profile.

You can continue without connecting it.

[ Connect ]

[ Skip ]
```

---

## 15. Membership-Ready State

This is one of the most important screens in the demo.

It should feel like a payoff.

```text
You're ready.

✓ Identity established
✓ Student information verified
✓ Required information complete
✓ Financial profile connected

MEMBERSHIP READY
```

Supporting copy:

> We've collected and verified the information needed for this demo onboarding profile without making you repeatedly enter information that already exists.

CTA:

**Continue with UFCU**

Do not claim that this prototype has legally opened an account or completed production KYC.

For demo purposes, "membership-ready" means the prototype has assembled the information required by its simulated onboarding workflow.

---

## 16. Financial Goals

After becoming membership-ready:

**What would you like UFCU to help you with?**

Multi-select:

- Everyday banking
- Build U.S. credit
- Save for tuition
- Build an emergency fund
- Finance a car
- Other

These are self-reported profile facts.

---

## 17. Personalized Financial Guide

Never call this an "AI financial advisor."

Allowed names:

- Personalized Financial Guide
- Your UFCU Starting Point
- UFCU Financial Guidance

Use the verified profile and member-selected goals to surface relevant UFCU products and educational guidance.

Example:

```text
Your UFCU Starting Point

Build U.S. credit

You told us building U.S. credit is one
of your goals.

[ Explore relevant UFCU options ]

Why am I seeing this?
```

Expansion:

```text
Why you're seeing this

◇ You want to build U.S. credit
✓ Your profile shows no U.S. credit history
✓ You connected international credit history
```

Recommendations should explain themselves using profile facts.

---

## 18. Guidance Generation

AI may generate explanatory copy, but it must not control identity verification, requirements, underwriting, or eligibility.

System constraints:

- Use only supplied profile JSON
- Never invent facts about the member
- Never make underwriting decisions
- Never claim product approval
- Never determine KYC completion
- No legal, immigration, tax, investment, or lending advice
- Every recommendation must identify the profile facts supporting it
- Clearly distinguish verified information from self-reported or inferred information

Output:

```json
{
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "reasons": ["string"],
      "sourceFields": [
        "finances.usCreditHistory",
        "finances.internationalCreditHistory",
        "goals"
      ]
    }
  ]
}
```

---

## 19. Verification Provider Architecture

External verification should use provider interfaces so simulated providers can later be replaced.

```typescript
interface IdentityProvider {
  verify(): Promise<IdentityResult>;
}

interface StudentVerificationProvider {
  connect(): Promise<StudentVerificationResult>;
}

interface CreditHistoryProvider {
  connect(): Promise<CreditHistoryResult>;
}
```

Hackathon implementations:

```text
IdentityProvider
→ PassportNFCProvider OR MockPassportProvider

StudentVerificationProvider
→ MockACCProvider

CreditHistoryProvider
→ NovaSandboxProvider OR MockNovaProvider
```

This lets the demo switch between real and simulated integrations without changing the UI.

---

## 20. API Surface

Keep APIs minimal.

```text
POST /passport/session
POST /passport/complete

POST /school/connect
POST /school/verify

POST /credit/connect
POST /credit/complete

GET  /profile
POST /profile/goals

GET  /membership/status
POST /guidance/recommend
```

Mock integrations should return realistic structured responses after a short simulated delay.

---

## 21. Audit Log

Backend only.

```text
events:
id
timestamp
event_type
provider
field
old_value
new_value
source
```

Possible event types:

```text
PASSPORT_SCANNED
IDENTITY_ESTABLISHED
CONSENT_GRANTED
SCHOOL_CONNECTED
STUDENT_VERIFIED
CREDIT_CONNECTION_STARTED
CREDIT_PROFILE_RECEIVED
PROFILE_UPDATED
MEMBERSHIP_READY
RECOMMENDATION_GENERATED
```

Append-only.

Never build a dedicated audit-log screen.

---

## 22. Tech Stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind
- Backend: FastAPI
- Database: SQLite
- AI: optional LLM call for Financial Guide copy
- Passport: NFC integration if practical, otherwise simulated provider
- School: simulated provider
- International credit: Nova Credit sandbox if readily available, otherwise simulated provider

Keep the architecture simple.

Do not introduce infrastructure that does not improve the five-minute demo.

---

## 23. Build Priority

### Must work

1. Welcome screen
2. Passport scan interaction
3. Identity established screen
4. School selection
5. Simulated ACC authorization
6. Student verification result
7. International credit question
8. Simulated Nova connection
9. VERIFIED Profile
10. Membership-ready payoff

### Build next

11. Financial goals
12. Personalized UFCU Financial Guide
13. "Why am I seeing this?" explanations

### Only if time remains

14. Real passport NFC
15. Real Nova sandbox
16. Backend audit log
17. Additional animations/polish
18. Additional member personas

The mock flow must work before attempting real integrations.

**Never sacrifice a reliable demo for a real integration.**

---

## 24. Demo Reliability Rule

Every external integration must have a mock fallback.

The demo should be able to run with:

```text
MOCK_PASSPORT=true
MOCK_SCHOOL=true
MOCK_NOVA=true
```

Real integrations are enhancements, not dependencies.

If NFC, network access, credentials, Nova, or another external dependency fails, the presenter must be able to continue the exact same flow using synthetic data.

---

## 25. Visual Experience

The app should feel like a polished consumer banking application, not a hackathon dashboard.

Design mobile-first around a **390px phone viewport**.

Prioritize:

- Large touch targets
- One major decision per screen
- Very little text
- Strong progress feedback
- Clear source labels
- Smooth transitions between verification steps
- Trust and consent messaging
- Large success states
- Minimal manual typing

Avoid:

- Dense forms
- Developer terminology
- Tables
- Excessive cards
- Long explanations
- Technical API terminology
- Showing raw JSON
- Generic AI chatbot interfaces

The experience should feel almost surprisingly short.

---

## 26. Language Rules

Use:

**"Scan your passport"**

**"Establish your identity"**

**"Connect your school"**

**"Verify your student information"**

**"Bring your credit history with you"**

**"Connect international credit history"**

**"Membership ready"**

**"Personalized Financial Guide"**

**"Why am I seeing this?"**

Avoid:

**"Upload all required documents"**

**"AI financial advisor"**

**"AI verified your identity"**

**"Passport contains your student information"**

**"Passport gives us access to government databases"**

**"Nova approved you"**

**"You qualify for..."** unless actual eligibility logic exists

**"KYC complete"** unless discussing a hypothetical production integration

---

## 27. Pitch Language

Core problem:

> **Moving countries shouldn't mean starting your financial identity from zero.**

Core solution:

> **VERIFIED uses a trusted identity credential to establish who a member is, then, with their permission, connects information that already exists instead of asking them to repeatedly prove it.**

How it works:

> **The member scans their passport to establish identity, connects their school to verify student information, and can bring eligible international credit history through a provider such as Nova Credit. VERIFIED combines those trusted sources into a transparent profile that moves them toward membership-ready.**

Why UFCU:

> **Instead of treating onboarding as a form UFCU needs the member to complete, VERIFIED treats it as the beginning of a financial relationship.**

Trust:

> **The member can always see where information came from, what they authorized, and what they told us themselves.**

---

## 28. The Demo Story

The five-minute demo should tell one continuous story.

### Act 1 — Don't make me start over

An international student has arrived in Austin.

They already have an identity, a university relationship, and potentially years of financial history.

VERIFIED does not treat them like a blank profile.

### Act 2 — Verify what already exists

They scan their passport.

Their identity is established.

They answer one important missing question:

**Where do you go to school?**

They authorize their school connection.

Their student information is verified.

They authorize an international credit connection.

Their existing financial history becomes part of their profile.

### Act 3 — Start the relationship

VERIFIED shows:

**MEMBERSHIP READY**

The member chooses their financial goals.

UFCU can now provide a personalized starting point based on information the member can inspect and understand.

---

## 29. Final Product Principle

When making any design or engineering decision, ask:

> **"Are we asking the member for something we could securely verify with their permission instead?"**

If yes, prefer verification.

If the information cannot be retrieved or verified, ask the member directly.

The product should always preserve three things:

**Control. Transparency. Continuity.**

The member controls what they connect.

The member can see where information came from.

The member does not have to rebuild their identity from zero.