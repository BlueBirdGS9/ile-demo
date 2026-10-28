# Handoff: Ilé, Trust-Driven Property Operating System

## Overview
Ilé is a property platform for the Nigerian market built on two trust primitives, **verified identities** and **escrow-protected money**. The product is a suite of **six role-specific web apps** (Renter, Landlord, Buyer, Seller, Realtor, Field Agent) plus a **Home workspace switcher** and a shared **Onboarding & verification** flow. All apps share one design system and reference a consistent cast of personas so the suite reads as a single connected marketplace.

This bundle is the complete, working design prototype. The goal of the handoff is to **rebuild these designs in a production codebase**.

## About the design files
The files in this bundle are **design references created in HTML/CSS/JS**, high-fidelity prototypes showing the intended look, layout, and behavior. They are **not production code to copy verbatim**. They run on CDN React + in-browser Babel with mock data and no backend, which is great for design fidelity but not for shipping.

The task is to **recreate these designs in the target codebase's environment**, using its established framework, component library, and patterns. If no codebase exists yet, see **Recommended stack** below. The HTML files are the **pixel-perfect source of truth** for appearance; this document specifies structure, tokens, behavior, and data so the build is mechanical rather than guesswork.

Two companion docs at the project root are essential reading and are intentionally kept up to date:
- **`README.md`**, full architecture, file map, CSS layering, data namespaces, conventions.
- **`CLAUDE.md`**, the ruleset (Babel-scope sharing, structure, icon system, do's/don'ts).

**Backend team:** read **`design_handoff_getrentos/BACKEND_GUIDE.md`**, it specifies the domain model, the identity/verification/escrow/delegation systems, every cross-app data flow, the persistence the prototype fakes, a proposed API surface + events, and the authorization rules. The six `*/data.js` files are the field-level schema.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, components, and interactions are all decided and present in the prototypes. Recreate the UI faithfully using the target codebase's libraries. Do **not** re-style from scratch, the design system is fixed (see Design tokens).

---

## Recommended stack (if greenfield)
- **Vite + React + TypeScript.**
- **React Router**, the in-prototype `nav` arrays (`[icon, label, routeKey]` in each app's `data.js`) map 1:1 to routes.
- **Design tokens:** reuse `styles/tokens.css` as-is (framework-agnostic CSS variables) or port to a Tailwind theme / CSS-vars layer. Do not change values.
- **Shared UI package:** promote `styles/components.css` + the primitives in each `components.jsx` into one shared component library used by all six apps (monorepo `packages/ui` is a natural fit).
- **Data layer:** each app's `data.js` mock shapes are the **de-facto API contract**, they define entities and fields. Replace the `window.XX` globals with typed API clients + React Query.
- **Auth/identity & escrow** are core domain services; onboarding's verification steps and the escrow milestone trackers describe the required flows.

---

## The apps & their screens

Each app is a single-page React app with a left sidebar (nav), top bar (search + notifications), and a routed content area. The sidebar brand mark returns to the Home switcher. Navigation is in-memory (`route = {page, id}`); detail pages keep their parent nav item highlighted.

### 0. Home (`GetRentos Home.html`)
- **Purpose:** workspace switcher / product front door.
- **Layout:** sticky top bar (brand + links to Onboarding & Design System); full-width green gradient **hero** (eyebrow pill, headline, sub, 3 trust chips); a **3×2 grid of workspace cards** (one per role); a "Start here" row with two utility cards (Onboarding, Design System); footer.
- **Workspace card:** toned icon tile, kicker + role title, description, persona footer (avatar, name, trust), "Open →" link. The Seller card carries a small "For owners & sellers" tag.

### 1. Onboarding (`GetRentos Onboarding.html`)
- **Purpose:** fast account creation → routed into the chosen app, with identity verification repositioned as a just-in-time step (not a gate).
- **Fast path (default):** `splash (choose role)` → `signup (email/phone + password, or Google)` → `OTP` → `Welcome` → enter the role's app **unverified**. Reaching the dashboard is **not** gated behind KYC.
- **Sign in:** "I already have an account" opens a **Sign in** screen (email/phone + password, or Google) that routes to the **Home** workspace switcher.
- **Verification track (optional, resumable):** legal details + NIN → ID document upload → liveness selfie → review; supply-side roles (Landlord, Seller) add property/title document upload (C of O, Deed of Assignment, Survey Plan). Launchable from Welcome or when a trust boundary is hit in-app.
- **Routing contract:** `ROLE_APPS` keys in `onboarding/screens-verify.jsx` MUST match the role labels in `ROLES` (`onboarding/screens-auth.jsx`). The six: Renter, Landlord, Property Owner / Seller, Property Buyer, Realtor, Agent.
- See **BACKEND_GUIDE.md §3** for the auth/KYC service contract.

### 2. Renter (`GetRentos Renter App.html`), `window.RD`
Dashboard, Discover (search + filters + map toggle), Property details, Saved & Compare, Applications, Lease, Payments (escrow rent), Maintenance, Messages, Documents, Settings.

### 3. Landlord (`GetRentos Landlord App.html`), `window.LD`
Portfolio dashboard, Properties (+ units), Tenants, Rent collection, Maintenance tickets, Financials, Messages, Documents, Settings.

### 4. Buyer (`GetRentos Buyer App.html`), `window.BD`
Dashboard, Discover, Property details, Saved, Compare, Watchlist, Viewings, Offers + **negotiation thread**, **Make-offer flow** (multi-step), **Financing** (interactive mortgage calculator), Transactions (**escrow milestone tracker**), Documents, Messages, Settings.

### 5. Seller (`GetRentos Seller App.html`), `window.SD`
Dashboard (proceeds banner, sale progress), My Properties (status tabs), Property detail (listing performance), **Offers received** + seller-side negotiation (accept / counter / decline), **Valuation** (comparable-sales tool with estimated-value range + verdict), Transactions (escrow milestones to proceeds release), Documents, Messages, Settings.

### 6. Realtor (`GetRentos Realtor App.html`), `window.RT`
Dashboard (commission banner), Listings (grid/table, status tabs), Listing detail, **Leads pipeline (kanban)** with stage movement, Lead detail, **Deals** + commission tracking, Deal detail (escrow milestones), Viewings, **Performance** (charts + lead-source attribution + closed-deals table), Messages, Documents, Settings.

### 7. Field Agent (`GetRentos Agent App.html`), `window.AD`
**Today** (next-up hero + day timeline), **Schedule** (viewing **check-in → complete → log outcome** flow), **Tasks** (field-job checklist with fees), Leads (assigned follow-ups), Listings (read-only coverage + key/lockbox access), **Earnings** (field-fee payouts), Messages, Settings.

---

## Interactions & behavior
- **Verification gate (every app):** each app boots **unverified** with a trust banner + an "Unverified · Verify" identity pill. Browsing is open; **transact actions are gated** (apply, pay, make/accept offers, list/publish, claim field work, message counterparties, move money), clicking one opens a just-in-time verify sheet; on completion the gate lifts and the original action resumes. Settings has a "Reset (demo)" to flip back. The per-role gated/open matrix and server-side authz rules are in **BACKEND_GUIDE.md §3.5 / §12**.
- **Account menu (every app):** the top-bar avatar opens a dropdown (name, email, **Settings**, **Sign out**). Sign out returns to Onboarding.
- **Notifications (every app):** the top-bar **bell** opens a role-specific notifications dropdown with a "Mark all read" control; a ping shows while anything is unread. Badges (unread messages, new offers, open tasks) are counts derived from data.
- **Navigation:** sidebar item / link → `go(page, id)` updates `route` and scrolls content to top. No URL changes in the prototype; production should use real routes.
- **Negotiation (Buyer/Seller):** offer threads support submit / counter / accept (+ decline on Seller). State is local; each event appends to a thread array; status chip updates.
- **Escrow milestone trackers:** horizontal stepper (done / active / todo). "Confirm & continue" advances the active milestone; final step shows a completion callout.
- **Kanban (Realtor leads):** cards move between stage columns via ←/→ controls; column totals update.
- **Calculators/tools:** mortgage calculator (Buyer) and valuation (Seller) recompute live from sliders / selected property.
- **Schedule (Agent):** check-in then complete-and-log; logging an outcome "releases" the field fee (toast).
- **Toasts:** transient confirmation messages via `ctx.toast(msg)` (auto-dismiss ~2.2s).
- **Loading/empty states:** skeletons on filtered lists (Discover); `EmptyState` component for no-results.
- **Animations:** page enter `pageIn` (~200ms), hover lifts on cards (`translateY`, shadow), all using the motion tokens below.
- **Responsive / mobile-first:** the suite is built to work on phones. Breakpoint at **820px** is the primary mobile boundary; **1080px** reflows multi-column grids (`cols-4`→2→1, `dash-grid`/`pd-grid` stack). Mobile behaviours, all in shared CSS (`renter.css` shell + `landlord.css` for tables):
  - **Bottom tab bar** (`.bottom-nav`, rendered by `<BottomNav>` in each app shell): the first 4 nav items + a **More** tab that opens the full drawer. The desktop sidebar becomes an off-canvas drawer; the topbar shows a compact logo (`.topbar-brand`).
  - **Touch targets:** `.icon-btn` 44px, `.btn` min-height 44px, `.nav-item` 48px, slider thumbs 26px on mobile.
  - **Data tables → cards:** any `.dtable` collapses to stacked labeled cards on mobile, every `<td>` carries a `data-label` whose value is the column header (CSS shows it via `td::before`). Keep adding `data-label` to new table cells.
  - **Kanban** (`.kanban`): becomes an 84%-width scroll-snap carousel.
  - **Chat:** thread list becomes a horizontal strip above the conversation.
  - **Milestones:** flip from horizontal to vertical.
  - Verified at 390px with zero horizontal overflow across all six apps + Home + Onboarding.

## State management
Per app, a single root component holds:
- `route = { page, id }`, current view.
- `ctx = { route, go, toast, ... }` passed to all pages.
- App-specific session state, e.g. Buyer's `saved` + `compareList` (persisted to `localStorage` under `grt_buyer`).
- Local component state for flows (offer threads, milestone progress, kanban columns, calculator inputs), these reset on reload in the prototype; production should persist via the data layer.
- Badge counts derived from data (unread messages, new offers, open tasks).

Data is read synchronously from the `window.XX` namespace (mock). In production, swap for async fetches; the shapes are unchanged.

---

## Design tokens
All values are CSS custom properties in `styles/tokens.css`. **Use these exactly.**

### Color, Brand (Forest Trust Green)
`--green-50 #ECF6F1` · `100 #D2EBE1` · `200 #A6D6C4` · `300 #6FBBA1` · `400 #389C7E` · `500 #167F62` · **`600 #0E5A47` (PRIMARY)** · `700 #0B4839` · `800 #08372B` · `900 #052019`

### Color, Gold accent (sparing)
`--gold-50 #FBF4E2` · `100 #F4E6C0` · `400 #D2A94E` · `500 #B8862F` · `600 #97691E`

### Color, Warm neutral inks
`--ink-900 #14201B` · `800 #233029` · `700 #3A453F` · `600 #515C56` · `500 #6A756F` · `400 #8B958F` · `300 #B6BFB9` · `200 #DCE2DE` · `150 #E6EAE7` · `100 #EEF1EF` · `50 #F5F7F5`
`--paper #FBFCFB` · `--surface #FFFFFF` · `--surface-sunken #F7F9F8`

### Color, Semantic
success `#15935F` (bg `#E6F5EE`, text `#0B6A43`) · warning `#C77D0A` (bg `#FBF0DC`, text `#8A5400`) · error `#CF3B36` (bg `#FBE9E8`, text `#9E2420`) · info `#2563B8` (bg `#E7F0FB`, text `#194B91`) · **escrow `#5B3FD6`** (bg `#ECE8FB`, text `#3F2BA6`)

### Typography
- Sans: **Hanken Grotesk**; Mono: **IBM Plex Mono** (used for ALL money, IDs, metrics).
- Scale (`weight size/line-height`): display `700 44px/1.08` · h1 `700 32px/1.15` · h2 `700 24px/1.25` · h3 `600 20px/1.3` · h4 `600 17px/1.35` · body-lg `400 18px/1.6` · body `400 15px/1.55` · sm `400 14px/1.5` · caption `500 13px/1.4` · micro `600 11px/1.3`

### Spacing (8pt base)
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px (`--sp-1`…`--sp-20`).

### Radii
sm 6 · md 10 · lg 14 · xl 20 · 2xl 28 · pill 999 px.

### Shadows (warm-tinted)
xs `0 1px 2px rgba(16,32,26,.06)` · sm `0 1px 3px /.08 + 0 1px 2px /.04` · md `0 4px 12px -2px /.10 + 0 2px 6px -2px /.06` · lg `0 16px 40px -12px /.20 + 0 4px 12px -4px /.08` · focus `0 0 0 3px rgba(14,90,71,.18)`.

### Motion
ease `cubic-bezier(.4,0,.2,1)` · ease-out `cubic-bezier(.16,1,.3,1)` · durations fast 120ms / base 200ms / slow 360ms.

### Layout
Max container `1240px`.

---

## Assets
- **No raster images.** Property imagery is represented by diagonal-hatch placeholders (recreate with the codebase's image components / real photos in production).
- **Icons:** a custom inline-SVG set (`styles/icons.js` + per-app extras), 24×24 viewBox, 1.75 stroke, `currentColor`, rounded caps. Map these to the codebase's icon library or keep as SVG components.
- **Fonts:** Google Fonts (Hanken Grotesk, IBM Plex Mono) imported in `tokens.css`.
- **No third-party brand assets.** The "G" mark is a simple typographic badge.

## Currency & locale
Nigerian Naira. Format via `money()` (`₦185,000,000`) and `moneyShort()` (`₦185M`). Locations: Lagos, Abuja, Port Harcourt with real area names. Title types: C of O, Deed of Assignment, Survey Plan.

---

## Files
The design lives at the **project root** (this handoff folder sits alongside it). Key paths:
- `styles/tokens.css`, `styles/components.css`, `styles/icons.js`, shared foundation.
- `renter/`, `landlord/`, `buyer/`, `seller/`, `realtor/`, `agent/`, one folder per app, each with `data.js`, `components.jsx`, `pages-1/2/3.jsx`, `app.jsx`.
- `onboarding/`, onboarding screens + styles.
- `Ilé *.html`, the entry point for each app + Home + Design System.
- `README.md`, `CLAUDE.md`, architecture & conventions (read these).

Open `GetRentos Home.html` to explore the whole suite; open `GetRentos Design System.html` for the living component/token reference.
