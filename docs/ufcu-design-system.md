# VERIFIED × UFCU — Design System

## Overview

VERIFIED borrows UFCU's institutional trust — a deep, unhurried navy `{colors.primary}` (`#23335D`) — and pairs it with a warm signal-orange `{colors.secondary}` (`#EF6820`) reserved for exactly one job: showing the member something has just been confirmed. The brand reads as a credit union that got serious about product, not a fintech startup borrowing a bank's credibility — restrained navy authority for structure and text, warm orange only at the moment of verification.

The typographic voice runs on three faces with strict roles, and this is the system's signature idea: **Fraunces** (a warm, slightly humanist serif) carries every headline and hero moment — the "a human decided to build this for you" voice. **Inter** carries all body copy and UI chrome — quiet, legible, gets out of the way. **IBM Plex Mono** is reserved exclusively for anything that represents *verified, machine-read data* — confidence percentages, extracted field values, audit log entries, document IDs. The moment a number appears in Plex Mono, the member has learned a visual rule: this came from a document, not a guess.

Cards sit at a restrained `{rounded.lg}` 16 px — rounded enough to feel current, not so rounded it reads as playful. This is deliberate: VERIFIED is Gen Z-facing but handles passports and visa status, and the shape language should feel more "well-made government form" than "consumer app." The accent orange gradient (`subtle → lighter → accent → darker → darkest`) doubles as the literal visual language of the product's confidence meter — a component unique to this brief, not borrowed from a generic kit.

**Key Characteristics:**
- Navy `{colors.primary}` (`#23335D`) is the authority color — nav, headlines, primary structure. It is *not* the action color.
- Orange `{colors.secondary}` (`#EF6820`) is reserved for confirmation and action — CTA buttons, "Verified ✓" states, active confidence fill. Seeing orange means something just got confirmed.
- Three-face type system with semantic roles: **Fraunces** (human voice / headlines), **Inter** (utility / body), **IBM Plex Mono** (verified data / numbers). This mapping is a rule, not a style choice — never render a confidence score or extracted field value in Inter.
- `{rounded.lg}` 16 px is canonical — intentionally more restrained than a typical consumer fintech pill, signaling institutional seriousness.
- The accent orange 5-step ramp (`subtle/lighter/accent/darker/darkest`) is repurposed as the **confidence meter** scale — low confidence sits pale, full confidence sits at `{colors.accent-darkest}`. This is the system's one deliberately bold, brief-specific idea.
- Surface contrast (navy-tinted `{colors.canvas-soft}` vs. white `{colors.canvas}`) carries elevation — no drop shadows on primary surfaces.

## Colors

### Primary (Navy — structure, authority, text)
- **Primary Subtle** (`{colors.primary-subtle}` — `#CDCDE0`): Soft lavender-navy tint. Page canvas / hero band background.
- **Primary Lighter** (`{colors.primary-lighter}` — `#8182B1`): Muted navy. Secondary icons, disabled states, dividers on dark surfaces.
- **Primary** (`{colors.primary}` — `#23335D`): The brand's core navy. Nav bar, headline text, primary structural elements.
- **Primary Darker** (`{colors.primary-darker}` — `#020442`): Deep navy. Footer background, high-emphasis dark surfaces.
- **Primary Darkest** (`{colors.primary-darkest}` — `#020332`): Near-black navy. Default body ink — this is `{colors.ink}`.

### Secondary (Orange — action, confirmation)
- **Secondary Subtle** (`{colors.secondary-subtle}` — `#FCE1D2`): Palest peach. Badge backgrounds, hover fills.
- **Secondary Lighter** (`{colors.secondary-lighter}` — `#F49A6A`): Mid-warm orange. Hover state for primary buttons.
- **Secondary** (`{colors.secondary}` — `#EF6820`): The brand's single CTA color. Every primary button, every "Confirm" action, the "Verified ✓" checkmark.
- **Secondary Darker** (`{colors.secondary-darker}` — `#D14D10`): Pressed/active button state.
- **Secondary Darkest** (`{colors.secondary-darkest}` — `#693829`): Reserved for text-on-secondary-subtle surfaces only — never a fill.

### Accent (Orange — confidence meter, tertiary illustration)
- **Accent Subtle** (`{colors.accent-subtle}` — `#FDEBDB`): Confidence meter, 0–20% fill.
- **Accent Lighter** (`{colors.accent-lighter}` — `#F6A055`): Confidence meter, 20–50% fill.
- **Accent** (`{colors.accent}` — `#F2780C`): Confidence meter, 50–75% fill. Also used for illustrative tertiary graphics (document icons, upload states).
- **Accent Darker** (`{colors.accent-darker}` — `#A95408`): Confidence meter, 75–90% fill.
- **Accent Darkest** (`{colors.accent-darkest}` — `#854207`): Confidence meter, 90–100% fill / fully verified.

> **Rule:** Secondary and Accent are visually close on purpose but never interchangeable. Secondary = a member action just happened (tap, confirm, submit). Accent = a system state is being displayed (confidence level, extraction progress). If a color appears on something the member clicked, it's Secondary. If it appears on something the system is showing, it's Accent.

### Surface
- **Canvas** (`{colors.canvas}` — `#FFFFFF`): Card interiors.
- **Canvas Soft** (`{colors.canvas-soft}` — derived from Primary Subtle at 40% opacity over white, ≈ `#EEEEF5`): Page background, hero band.

### Text
- **Ink** (`{colors.ink}` — `#020332`, = Primary Darkest): Default text and headlines.
- **Body** (`{colors.body}` — `#454859`): Secondary body text (navy-tinted grey, not neutral grey — keeps warmth consistent with the primary hue).
- **Mute** (`{colors.mute}` — `#8182B1`, = Primary Lighter): Captions, placeholders, fine print, timestamps.

### Semantic (deliberately outside the brand palette — never reuse Primary/Secondary/Accent for status)
- **Positive** (`{colors.positive}` — `#1E8E5A`): Requirement met, document accepted.
- **Positive Subtle** (`{colors.positive-subtle}` — `#DDF3E8`): Success badge background.
- **Warning** (`{colors.warning}` — `#C9871A`): Low-confidence flag, needs review.
- **Warning Subtle** (`{colors.warning-subtle}` — `#FBEDD8`): Warning badge background.
- **Negative** (`{colors.negative}` — `#C6323F`): Document rejected, extraction failed.
- **Negative Subtle** (`{colors.negative-subtle}` — `#FADCDE`): Error badge background.

## Typography

### Font Family — three faces, three jobs
1. **Fraunces** (weight 600–900): Every headline, hero statement, and section title. This is the "a person wrote this for you" voice — warm, slightly literary, not a typical fintech geometric sans. Never used below 24px.
2. **Inter** (weight 400/600): All body copy, form labels, buttons, nav. Neutral utility — gets out of the way of Fraunces.
3. **IBM Plex Mono** (weight 400/500): Reserved exclusively for machine-read/verified values — confidence percentages, extracted field values, document IDs, audit log timestamps. This is a hard rule, not a style preference: if a number represents something the AI read from a document, it renders in Plex Mono. If it's a member-typed or system-copy number (like a step count "3 of 4"), it stays in Inter.

### Hierarchy

| Token | Font | Size | Weight | Line Height | Use |
|---|---|---|---|---|---|
| `{typography.hero}` | Fraunces | 56px | 700 | 60px | Landing / welcome headline. |
| `{typography.display-lg}` | Fraunces | 40px | 600 | 46px | Section headlines ("Your UFCU checklist"). |
| `{typography.display-md}` | Fraunces | 28px | 600 | 34px | Card / screen titles. |
| `{typography.display-sm}` | Fraunces | 22px | 600 | 28px | Sub-section titles. |
| `{typography.body-lg}` | Inter | 18px | 400 | 27px | Lead paragraphs, explanatory copy. |
| `{typography.body-md}` | Inter | 16px | 400 | 24px | Default body. |
| `{typography.body-md-strong}` | Inter | 16px | 600 | 24px | Emphasized inline body. |
| `{typography.body-sm}` | Inter | 14px | 400 | 20px | Secondary text, help copy. |
| `{typography.caption}` | Inter | 12px | 400 | 16px | Fine print, disclaimers. |
| `{typography.button}` | Inter | 16px | 600 | 24px | Button labels. |
| `{typography.data-lg}` | IBM Plex Mono | 32px | 500 | 38px | Hero confidence score, e.g. "87%". |
| `{typography.data-md}` | IBM Plex Mono | 16px | 500 | 22px | Extracted field values, document IDs. |
| `{typography.data-sm}` | IBM Plex Mono | 13px | 400 | 18px | Audit log entries, timestamps. |

### Principles
- **Fraunces speaks, Inter assists, Plex Mono proves.** Never blur these roles — the member should be able to tell, without reading, whether they're looking at a human statement, an instruction, or a verified fact.
- Headlines in Fraunces are set with slightly negative letter-spacing (-0.01em) to keep the serif from feeling loose at large sizes.

## Layout

### Spacing System
- **Base unit**: 4px.
- **Tokens**: `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.2xl}` 32px · `{spacing.3xl}` 48px.
- **Screen padding**: 24px horizontal on mobile, 48px on desktop.
- **Card interior**: `{spacing.lg}` 16px on mobile, `{spacing.xl}` 24px on desktop.

### Grid & Container
- App container centers at ~480px on mobile-first screens (this is an onboarding flow, treat it like a guided single-column experience, not a dashboard).
- Desktop/demo-projector view: center the 480px flow inside a wider canvas rather than stretching content full-width — keeps the "guided path" feeling intact even on a big screen.

### Responsive Strategy

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Single column, full-width cards, sticky bottom CTA. |
| Tablet/Desktop | ≥ 768px | Flow stays centered at 480px max-width; no multi-column onboarding — this is intentional, not a missed breakpoint. |

### Touch Targets
Buttons render 48px tall minimum. Document scan trigger button renders at 64px — it's the single most important tap target in the product.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Level 0 — Flat | No shadow, no border. | Default text and layout. |
| Level 1 — Hairline | 1px solid `{colors.primary-subtle}` border. | Form inputs, tertiary buttons. |
| Level 2 — Soft Card | White card on `{colors.canvas-soft}` background. Surface contrast is the elevation cue. | Default cards. |
| Level 3 — Confirmed | White card, 2px solid `{colors.secondary}` border. | A card that was just verified/confirmed — the border appears as an animated draw-on when confirmation happens, not present before. |

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed bands, audit log table. |
| `{rounded.sm}` | 8px | Badges, small pills. |
| `{rounded.md}` | 12px | Form inputs. |
| `{rounded.lg}` | 16px | The canonical card + button radius. |
| `{rounded.pill}` | 9999px | Status badges only (Verified / Self-reported / Inferred). |

## Components

### Buttons
**`button-primary`** — Background `{colors.secondary}`, text white, `{typography.button}`, padding `{spacing.md} {spacing.xl}`, shape `{rounded.lg}`. Hover: `{colors.secondary-lighter}`. Active: `{colors.secondary-darker}`.

**`button-secondary`** — Background `{colors.canvas}`, text `{colors.primary}`, 1px solid `{colors.primary}` border, same shape/padding.

**`button-scan`** — The document-capture trigger. Background `{colors.primary}`, text white, 64px height, `{rounded.lg}`, camera icon left-aligned. This is the product's most important button — never share its styling with any other action.

### Signature Components (specific to VERIFIED)

**`confidence-meter`** — A horizontal bar or radial ring filled along the Accent ramp (`subtle → lighter → accent → darker → darkest` as confidence rises 0→100%). Value itself renders in `{typography.data-lg}` IBM Plex Mono. This is the product's core visual metaphor — the same component appears at field level (small, inline) and profile level (large, hero-sized on the "membership-ready" screen).

**`source-badge`** — Pill-shaped, `{rounded.pill}`, three variants:
- *Verified*: background `{colors.positive-subtle}`, text `{colors.positive}`, "✓ Verified"
- *Self-reported*: background `{colors.primary-subtle}`, text `{colors.primary}`, "◇ Self-reported"
- *Inferred*: background `{colors.accent-subtle}`, text `{colors.accent-darker}`, "✦ Inferred"

**`document-scan-card`** — Background `{colors.canvas}`, 1px `{colors.primary-subtle}` border, `{rounded.lg}`. Contains the captured document image with extracted-field overlays. Low-confidence fields get a `{colors.warning}` outline directly on the image region — this is the "show your work" interaction and should be the most polished component in the build.

**`requirement-checklist-item`** — Row with a `source-badge`-style leading icon (empty circle → filled `{colors.secondary}` circle on completion), requirement name in `{typography.body-md-strong}`, and an expandable "why we need this" in `{typography.body-sm}` `{colors.body}`.

**`financial-guide-card`** — Background `{colors.canvas-soft}`, `{rounded.lg}`, headline in `{typography.display-sm}` Fraunces, body in `{typography.body-md}`, with a footer link "Why am I seeing this?" in `{typography.body-sm-strong}` `{colors.primary}` that expands to show cited `source-badge` chips.

**`audit-log-row`** *(backend-facing / architecture slide only — not a member-visible screen)* — Monospace throughout, `{typography.data-sm}`, zero radius, hairline row dividers in `{colors.primary-subtle}`.

## Do's and Don'ts

### Do
- Reserve `{colors.secondary}` orange for member-facing confirmation actions only — buttons, "Verified ✓" states.
- Render every AI-extracted or confidence-bearing number in IBM Plex Mono. This is the product's core trust signal — don't let it get inconsistent.
- Use the Accent orange ramp exclusively for the confidence meter and system-state indicators, never for buttons.
- Keep the flow single-column and centered even on desktop — this is a guided process, not a dashboard.
- Use `{colors.primary}` navy for structural authority (nav, headlines) — it should feel like "the institution," while orange feels like "you, taking action."

### Don't
- Don't use Secondary and Accent interchangeably — see the rule under Colors. This is the easiest brand mistake to make given how close the hex values are.
- Don't render body copy in Fraunces — it's a display face only, reserves its warmth for headlines.
- Don't put a drop shadow on default cards — surface contrast (`canvas-soft` vs `canvas`) is the elevation system.
- Don't round document-scan-card or audit-log-row past `{rounded.lg}`/`{rounded.none}` respectively — both should read as slightly more formal than the rest of the app, on purpose.
- Don't use Positive/Warning/Negative semantic colors for anything except document/requirement status — they're reserved, not decorative.
