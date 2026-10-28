# CLAUDE.md, Ilé project conventions

Persistent guidance for working on the Ilé prototype suite. Read `README.md` first for architecture; this file is the rules you must follow when editing or extending.

## What this project is
A suite of **six standalone HTML apps** + a Home switcher + onboarding, sharing one design system, for a Nigerian property platform built on **verified identities** and **escrow-protected money**. CDN React + in-browser Babel + mock data. No build step, no backend, no router library.

## Golden rules
1. **Reuse the design system. Invent nothing.** All color, type, spacing, radii, shadows live in `styles/tokens.css`. Compose from those CSS variables, never hard-code a hex or introduce a new font. Money always renders in `var(--font-mono)`.
2. **Follow the per-app structure exactly** (see below). New apps mirror existing ones bone-for-bone.
3. **Match the established visual vocabulary**, study a sibling app before adding anything. Cards, chips, badges, trust rings, milestone trackers, escrow callouts already exist; use them.
4. **No filler.** Every element earns its place. No dummy stats, decorative icons, or placeholder sections.

## Per-app file structure
Every app folder (`renter/`, `landlord/`, `buyer/`, `seller/`, `realtor/`, `agent/`) contains:
- `data.js`, plain JS (no JSX). Exposes one global namespace (`window.RD`/`LD`/`BD`/`SD`/`RT`/`AD`) with data collections, finder helpers, and a `nav` array of `[iconName, label, routeKey]`.
- `components.jsx`, extends `window.ICONS` with app-specific icons; defines primitives + `Sidebar`, `TopBar`, `PageHeader`, `Stat`, `EmptyState`, etc. Ends with `Object.assign(window, {...})`.
- `pages-1.jsx`, `pages-2.jsx`, `pages-3.jsx`, page components (~3 each). Each ends with `Object.assign(window, {...})` exporting its pages.
- `app.jsx`, the `<XxxApp>` shell: holds `route = {page, id}` state, a `go(page,id)` navigator, a `ctx` object, a `switch` router, badge counts, and `ReactDOM.createRoot(...).render(...)`.

The HTML entry loads, in order: React (pinned 18.3.1 + integrity) → ReactDOM → Babel (pinned 7.29.0) → `styles/icons.js` → `<app>/data.js` → `components.jsx` → `pages-1/2/3.jsx` → `app.jsx`.

## Critical Babel-scope rules
Each `<script type="text/babel">` transpiles in its **own scope**. Therefore:
- **Share across files via `window`**: every component/page must be assigned to `window` at the end of its file, and read off `window` (or just referenced by name, since `Object.assign(window,...)` makes them global) elsewhere.
- **NEVER declare a top-level `const styles = {}`**, it collides across files and breaks the app. Name style objects uniquely (e.g. `const sellCardStyles = {}`) or use inline styles.
- Data is read via the global namespace (`window.SD.listings`), never imported.

## Mobile-first (IMPORTANT, maintain)
The suite must work on phones. Breakpoint **820px** = mobile; **1080px** reflows grids. All mobile behaviour lives in shared CSS (`renter.css` shell, `landlord.css` for tables).
- **Bottom tab bar:** every app shell renders `<BottomNav nav={window.XX.nav} route={...} onNav={go} badges={badges} onMore={() => setDrawer(true)} />` (defined in each `components.jsx`). It shows the first 4 nav items + a **More** tab → drawer. Keep this when editing shells. On mobile the sidebar is an off-canvas drawer and the topbar shows `.topbar-brand` (compact logo).
- **Touch targets ≥44px** on mobile, don't ship controls smaller.
- **New data tables MUST give every `<td>` a `data-label="<column header>"`** so they collapse to readable cards on mobile (CSS renders the label via `td::before`). No data-label = no label shown.
- Don't reintroduce fixed multi-column layouts without a stacking rule. Verify new screens at 390px (zero horizontal overflow is the bar).

## CSS layering
Load order matters; apps reuse each other's stylesheets:
- `tokens.css` → `components.css` → `renter.css` (shell) → `landlord.css` (shared widgets: donut, tables) → [`buyer.css` for milestones/funds-banner/negotiation/sliders, Seller loads this] → `<app>.css` (only what's unique).
- Add app-specific CSS to `<app>/<app>.css`. Put genuinely shared primitives in `styles/components.css`.
- **Icon safety net:** `styles/components.css` has a low-specificity `svg { width:18px; height:18px; flex:none }`. Keep it, it prevents bare `<Icon>` elements from ballooning in flex contexts. More specific rules (`.btn svg`, `.stat-ic svg`, …) and inline styles still win.

## Icons
- Render with `<Icon name="..." />`. The icon must exist in `window.ICONS`.
- `styles/icons.js` holds the broadly-shared set. Each app's `components.jsx` adds its own extras via `Object.assign(window.ICONS, {...})`.
- All icons: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.75"`, rounded caps/joins.

## Routing & navigation
- In-memory only: `route = { page, id }`. No URLs, no router lib.
- `go(page, id)` changes route and scrolls content to top.
- Detail pages keep the right sidebar item active via a `sidebarKey` map in `app.jsx` (e.g. `{ offer: 'offers', propertyDetail: 'properties' }`).
- The sidebar **brand mark links to `GetRentos Home.html`** (workspace switcher), preserve this in every app.
- Onboarding routes to apps via `ROLE_APPS` in `onboarding/screens-verify.jsx`. The keys MUST exactly match the role labels in `ROLES` (`onboarding/screens-auth.jsx`).

## Personas (keep consistent)
Renter = Adaeze Okonkwo · Landlord = Chidi Nwosu · Buyer = Olu Adebayo · Seller = Yewande Coker · Realtor = Ngozi Eze (Prime Realty) · Agent = Tobi Adeniyi (Prime Realty). They cross-reference each other across apps, keep relationships coherent when editing data.

## Content & market
- Nigerian market: Naira currency, Lagos/Abuja/Port Harcourt locations, real area names (Lekki, Ikoyi, Wuse, Maitama, GRA), title types (C of O, Deed of Assignment, Survey Plan).
- Trust & escrow are the product's spine, surface verification badges, trust scores, and escrow protection wherever money or identity is involved.

## When adding a feature
1. Find the equivalent in a sibling app and match its pattern.
2. Add data to the app's `data.js` namespace.
3. Build the page in the appropriate `pages-*.jsx`, export it via `Object.assign(window, {...})`.
4. Register the route in `app.jsx`'s switch + add the `nav` entry in `data.js` if it's a top-level page.
5. Verify: no console errors, no ballooned icons (scan for `svg` with rendered width > 60px), nav highlight tracks, layout holds at narrow widths.

## Verification habits
- After changes, load the app and check the console is clean (only the expected Babel dev-transform warning).
- Screenshots from html-to-image can **ghost text mid-animation** and look like overlap, confirm layout via DOM measurement (`getBoundingClientRect`) before treating it as a bug.
- The `.page` entry animation (`pageIn`) is brief; faint captures are usually timing artifacts, not real opacity bugs.
