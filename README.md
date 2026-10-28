# Ilé, Trust-Driven Property Operating System

A high-fidelity, interactive prototype suite for **Ilé**, a property platform for the Nigerian market built around two trust primitives: **verified identities** and **escrow-protected money**. Every role in the property lifecycle, renting, letting, buying, selling, broking, gets its own dedicated workspace, all sharing one design system and trust layer.

> **Status:** Design prototype. Built with CDN React + in-browser Babel and mock data. No backend. See **[Production direction](#production-direction)** for the suggested path to a real app.

---

## Quick start

No build step. Serve the folder over a static HTTP server and open `GetRentos Home.html`:

```bash
# any static server works, e.g.
npx serve .
# then open http://localhost:3000/GetRentos%20Home.html
```

Opening the files directly via `file://` mostly works, but a local server is recommended so relative asset paths and fonts resolve cleanly.

**Entry point:** `GetRentos Home.html`, the workspace switcher linking to all six apps + onboarding + design system.

---

## What's in the box

| File | What it is |
|------|------------|
| `GetRentos Home.html` | **Start here.** Landing / workspace switcher, hero + 6 role cards + links to onboarding & design system. |
| `GetRentos Onboarding.html` | Account creation, role selection, identity verification. Routes the user into the app for their chosen role. |
| `GetRentos Renter App.html` | **Renter**, discover & rent verified homes, escrow rent, lease management, applications, payments, maintenance. |
| `GetRentos Landlord App.html` | **Landlord**, portfolio, properties, tenants, rent collection, maintenance, financials. |
| `GetRentos Buyer App.html` | **Buyer**, discover, compare, make offers, negotiate, mortgage calculator, escrow purchase. |
| `GetRentos Seller App.html` | **Seller / owner**, list for sale, review & negotiate offers, valuation tool, escrow sale, proceeds. |
| `GetRentos Realtor App.html` | **Realtor**, listings, lead pipeline (kanban), deals & commission, performance analytics. |
| `GetRentos Agent App.html` | **Field agent**, daily schedule, viewing check-ins, field tasks, lead follow-ups, field-fee earnings. |
| `GetRentos Design System.html` | Living reference: tokens, type, color, components, patterns. |

Each app is a **standalone HTML file** that boots an independent React app from CDN. Apps are linked, every app's sidebar brand mark returns to `GetRentos Home.html`, and onboarding deep-links into the matching app.

---

## Architecture

### Shared foundation (`styles/`)
- **`tokens.css`**, all design tokens as CSS custom properties: brand greens, gold accent, warm neutral inks, status/escrow colors, type scale (Hanken Grotesk + IBM Plex Mono), spacing, radii, shadows, motion. **The single source of truth for visual style.**
- **`components.css`**, core UI primitives shared by every app: buttons, cards, chips, badges, inputs, avatars, trust rings, property cards, tables, empty states, etc. Also holds the **global icon safety net** (`svg { width:18px; height:18px; flex:none }`) so no icon can balloon.
- **`icons.js`**, `window.ICONS`, a map of icon-name → SVG path string (24×24 viewBox, 1.75 stroke, `currentColor`). Each app extends this map with its own extras in its `components.jsx`.

### CSS layering / reuse
Apps load stylesheets in cascade order and **reuse each other's CSS** rather than duplicating:
- `renter.css` defines the **app shell** (sidebar + topbar + content layout, feed, chat, property detail) reused by all apps.
- `landlord.css` adds shared widgets (donut charts, data tables, stat deltas).
- `buyer.css` adds the **escrow milestone tracker, funds banner, negotiation thread, mortgage sliders**, reused by the Seller app.
- Each app's own stylesheet (`<app>.css`) adds only what's unique to it.

A typical app's `<head>`:
```html
<link rel="stylesheet" href="styles/tokens.css">
<link rel="stylesheet" href="styles/components.css">
<link rel="stylesheet" href="renter/renter.css">     <!-- shell -->
<link rel="stylesheet" href="landlord/landlord.css"> <!-- shared widgets -->
<link rel="stylesheet" href="buyer/buyer.css">       <!-- (seller only) milestones/nego -->
<link rel="stylesheet" href="seller/seller.css">     <!-- app-specific -->
```

### Per-app structure
Every app folder follows the **same five-part split**:

```
<app>/
  data.js          # window.<XX>, all mock data + helpers (plain JS, no JSX)
  components.jsx    # icons extras, primitives, Sidebar, TopBar, shared widgets
  pages-1.jsx       # ~3 page components
  pages-2.jsx       # ~3 page components
  pages-3.jsx       # ~3 page components
  app.jsx           # <XxxApp> shell: state, router (switch on route.page), badges
```

The HTML entry loads them in order: React → Babel → `icons.js` → `data.js` → `components.jsx` → `pages-*.jsx` → `app.jsx`.

### Data namespaces
Each app exposes its mock data on a global so page files can read it without imports:

| App | Namespace |
|-----|-----------|
| Renter | `window.RD` |
| Landlord | `window.LD` |
| Buyer | `window.BD` |
| Seller | `window.SD` |
| Realtor | `window.RT` |
| Agent | `window.AD` |

Each exposes domain collections (`listings`, `offers`, `transactions`, …) plus finder helpers (`find(id)`, `findOffer(id)`, …) and `nav` (the sidebar definition: `[icon, label, routeKey]`).

### Routing & state
Each app is a single React component (`<XxxApp>`) holding `route = { page, id }` in state. Navigation is a `go(page, id)` function passed down via a `ctx` object. There is **no router library** and no real URLs, it's in-memory SPA state. A `sidebarKey` map keeps the correct nav item highlighted on detail pages (e.g. `offer` → highlights `offers`).

`ctx` (passed to every page) carries: `{ route, go, toast, ... }` plus app-specific state (e.g. Buyer's `saved`, `compareList`).

### Cross-component sharing (important)
Because each `<script type="text/babel">` is transpiled in its own scope, page files share components by assigning to `window` at the end of each file:
```js
Object.assign(window, { SellDashboard, MyProperties, PropertyDetail });
```
`components.jsx` does the same for primitives. **Never** use a top-level `const styles = {}`, name style objects uniquely or use inline styles, to avoid cross-file collisions.

---

## Design system

- **Brand:** Forest Trust Green (`--green-600` primary). Gold (`--gold-*`) is a sparingly-used premium accent. Escrow/“money held” uses a distinct purple (`--escrow`).
- **Type:** Hanken Grotesk (sans) + IBM Plex Mono (all monetary figures, IDs, metrics).
- **Currency:** Nigerian Naira, formatted via `money()` / `moneyShort()` helpers (`₦185,000,000` / `₦185M`).
- **Trust motifs:** `TrustRing` (score donut), `Vbadge` (verified/pending), escrow callouts, milestone trackers.
- Full reference: open **`GetRentos Design System.html`**.

### Personas (consistent across the suite)
| Role | Persona |
|------|---------|
| Renter | Adaeze Okonkwo |
| Landlord | Chidi Nwosu |
| Buyer | Olu Adebayo |
| Seller | Yewande Coker |
| Realtor | Ngozi Eze (Prime Realty) |
| Agent | Tobi Adeniyi (Prime Realty) |

Personas reference each other across apps (e.g. the Realtor's leads include the Buyer persona; the Agent works for the Realtor's brokerage) so the suite reads as one connected marketplace.

---

## Conventions

- **Canonical HTML/JSX**, close every element; double-quote attributes.
- **Flex/grid + `gap`** for layout, not margin hacks or inline-flow whitespace.
- **Icons** come from `window.ICONS` via `<Icon name="..." />`; add new ones to the app's `components.jsx` extras map (or `styles/icons.js` if broadly shared).
- **No new colors/fonts**, compose from tokens only.
- **Money is mono**, always render currency in `var(--font-mono)`.
- **Minimum sizes**, body text ≥ 14px; touch targets ≥ 44px.
- See **`CLAUDE.md`** for the full ruleset future AI/dev sessions should follow.

---

## Production direction

This is a **prototype** (CDN React + in-browser Babel + mock data) optimized for fast design iteration. To productionize, a Claude Code session should target:

- **Stack:** Vite + React + TypeScript. Migrate each `pages-*.jsx` into proper component modules; replace `window.XX` data globals with typed API clients / React Query.
- **Design tokens:** keep `tokens.css` as-is (or port to a Tailwind/CSS-vars theme). It is already framework-agnostic.
- **Routing:** replace the in-memory `route` state with React Router; the existing `nav` arrays map directly to routes.
- **Shared UI:** promote `components.css` + the primitives in each `components.jsx` into a single shared component library consumed by all apps (or a monorepo `packages/ui`).
- **Backend:** the mock data shapes in each `data.js` are the de-facto API contract, they define the entities (listings, offers, transactions, leads, deals, …) and their fields.

The mock data and component structure are intentionally close to a real app so the translation is mechanical, not a rewrite.
