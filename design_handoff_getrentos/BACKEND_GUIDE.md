# Ilé, Backend Engineering Guide

Everything the backend team needs to stand up the services behind the Ilé frontend: the domain model, the trust/identity/escrow systems, every cross‑app data flow, the persistence the prototype fakes in `localStorage`, a proposed API surface, the event/realtime needs, and the authorization rules.

> **Read order:** `README.md` (architecture) → `design_handoff_getrentos/HANDOFF.md` (UI/design spec) → **this file** (data + services). The six `*/data.js` files are the **de‑facto schema**, every field named here exists there with real sample values. When in doubt, open the relevant `data.js`.

---

## 1. The product in one paragraph

Ilé is a property **operating system** for the Nigerian market. Six role‑specific web apps (Renter, Landlord, Buyer, Seller, Realtor, Field Agent) sit on top of **one shared trust layer** built from two primitives: **verified identities** (KYC against NIMC) and **escrow‑protected money** (funds move only when milestones clear). A single person can hold multiple roles and appears across apps (a renter is a landlord's tenant; a buyer is a realtor's lead; an agent works for a realtor's brokerage), so the backend models **one user/identity graph** and **one property graph**, not six silos.

---

## 2. Architecture today vs. target

**Today (prototype):** each app is a standalone CDN‑React SPA reading a synchronous `window.XX` mock namespace; there is **no backend**. Cross‑app "live" interactions are faked through shared `localStorage` keys (see §10). The shapes are intentionally production‑realistic.

**Target:** replace the `window.XX` globals and the `localStorage` bridges with real services + typed API clients. The mock collections become tables; the `localStorage` bridges (`grt_mgmt`, `grt_field_tasks`, `grt_invites`, `grt_access_log`) become **first‑class services with realtime push** (they exist precisely because two different apps must see the same state in real time).

---

## 3. Identity, accounts & authentication

### 3.1 Account creation (fast path)
Onboarding (`GetRentos Onboarding.html`) was redesigned for **shortest time‑to‑dashboard**. The flow is:

`splash (choose role)` → `signup (email or phone + password, or Google)` → `OTP (6‑digit, 10‑min expiry, single‑use)` → `Welcome` → **enter the role's app, unverified.**

Reaching the dashboard is **no longer gated behind KYC.** Identity verification is deferred (see §3.4). Backend needs:
- `POST /auth/signup` (email|phone, password) → creates user, sends OTP.
- `POST /auth/otp/verify` → activates session.
- OAuth (`Google` shown; "Apple" was intentionally removed, do not re‑add unless asked).
- Role is captured **before** credentials (it tailors the workspace). One primary role per signup; a user may later hold more.

### 3.2 Sign in (returning users)
"I already have an account" → **Sign in** screen (email|phone + password, or Google) → lands on the **Home workspace switcher** (`GetRentos Home.html`), since a returning user chooses which workspace to enter.
- `POST /auth/login` → session; respond with the user's available workspaces/roles.

### 3.3 Sign out
Available in every app via the top‑bar avatar **account menu** (Settings · Sign out). Clears the session and returns to Onboarding.
- `POST /auth/logout`.

### 3.4 Identity verification (KYC), the trust boundary
Verification is an **optional, resumable track** launched from the Welcome screen or just‑in‑time when a user hits a trust boundary in‑app. Steps (see `onboarding/screens-verify.jsx`):
1. **Legal details**, legal name, DOB, **NIN** (11 digits), residential address.
2. **Government ID**, NIN slip / driver's licence / int'l passport / voter's card (document upload).
3. **Liveness selfie**, face match to ID.
4. **Review**, checks: *NIN verified against NIMC*, *ID authenticated*, *face match & liveness*, *compliance review*. Async; the user proceeds while it completes.
5. **Supply‑side roles also do Property/ownership verification** (Landlord, Seller): upload **C of O**, **Deed of Assignment**, **Survey Plan / Title Deed**; cross‑checked against the **land registry** (24 to 48h).

Backend services: a **KYC service** (NIMC lookup, document authenticity, biometric liveness, compliance queue) and a **title‑verification service** (land‑registry cross‑check). Both are asynchronous and emit status events.

### 3.5 The verification gate (authorization at the boundary)
Each app boots **unverified** and shows a trust banner + an "Unverified · Verify" identity pill. **Browsing is always open; transacting is gated.** A user must be verified to perform these per‑role actions (this is the core authz rule, enforce server‑side, the UI gate is only a courtesy):

| App | Gated (requires verified identity) | Always open |
|---|---|---|
| Renter | apply to rent, pay rent (escrow), message owners | discover, save, compare, schedule viewing, view lease/docs |
| Buyer | make/counter offer, pay via escrow, message sellers | discover, save, compare, watchlist, mortgage calculator |
| Seller | list/publish, accept/counter offer, escrow payout, message buyers | dashboard, valuation tool, browse |
| Landlord | add property, approve application, release escrow, approve managed decisions, message | portfolio/read views |
| Realtor | publish listing, assign field task, accept management, send proposal, request approval, hire agent, message | listings/leads/read views |
| Agent | check‑in/complete viewing (releases fee), mark task done, accept/apply to brokerage, message | today/schedule/read views |

When verification completes the gate lifts and the originally‑attempted action resumes. Verified state is persisted (prototype: per‑app `localStorage`; production: on the user record).

---

## 4. Trust score

Every person carries a **trust score (0 to 100)** and a tier (e.g. Good / Excellent). It is surfaced everywhere money or identity is involved (sidebars, offer threads, applications, agency directory). Rules to model:
- Verifying identity raises it (the onboarding success screen shows a jump to ~68 "Good").
- It grows with **successful, on‑time transactions** (rent paid on time, deals closed, jobs completed).
- It's shown for counterparties so each side can judge the other (tenant trust, owner trust, agent trust, agency trust).
Model as a derived/ledgered score with an event history, not a free field.

---

## 5. Verified property & titles

Properties/listings carry `verified: boolean` (title verified) and a **title type**: `C of O` (Certificate of Occupancy), `Deed of Assignment`, or `Survey Plan`. Verified listings get a badge and rank/feature higher; unverified supply (an unverified owner's listing) should **not** go live publicly. Title verification is the land‑registry cross‑check from §3.4.

---

## 6. Escrow & money movement (the second trust primitive)

All money flows through Ilé **escrow**, "funds move only when both sides hit their milestones." Four escrow contexts:

**6.1 Rent escrow (Renter → Landlord).** Tenant pays into escrow; state machine per rent row: `pending → held → released`. On release, a **payout** is remitted to the landlord's payout account (ref `GRT-PO-…`). See `renter/data.js` (`payments`) and `landlord/data.js` (`rentRows`, `payouts`).

**6.2 Purchase escrow (Buyer ↔ Seller).** Created from an accepted offer. Milestone tracker (`buyer/data.js` `escrowMilestones`, mirrored seller‑side):
`deposit (10% held)` → `verification (title cross‑check)` → `final (balance to escrow)` → `completion (funds released to seller, certificate issued)`. Each milestone has `state: done|active|todo`, an amount, and a date. A transaction has `stage: In Escrow | Completed`, `amount`, `held`.

**6.3 Field‑fee escrow (Brokerage → Field Agent).** A dispatched field task carries a `fee`; the brokerage funds it and it is **released to the agent on job completion** (logging the outcome). See §9 and `agent/data.js` (`payouts`).

**6.4 Commission (Sale → Realtor).** A closed deal releases the realtor's commission through escrow (`realtor` deals + commission tracker).

**6.5 Managed‑rent flow (Owner ↔ Agency).** Collected rent flows **owner‑direct through escrow**; the agency's management fee (default **10%**, configurable per mandate) is deducted and the **net is remitted to the owner** (`styles/mgmt.js`, `FEE_PCT`, feed event "Payout remitted … after 10% management fee").

Backend: an **Escrow/Ledger service** owning held balances, milestone state machines, release authorization (who can release, gated by verification + role), and **payout accounts** (bank, masked number, verified flag).

---

## 7. Core domain entities

Names map to the `data.js` collections. Treat these as the initial schema; exact fields are in the files.

### People & accounts
- **User/Identity**, name, role(s), `verified` (identity), `trust` score, contact (phone/email), payout account(s). Users recur across apps by identity (Adaeze = renter + a landlord's tenant + a realtor's lead).
- **Persona cast (sample data, keep coherent):** Renter *Adaeze Okonkwo* · Landlord *Chidi Nwosu* · Buyer *Olu Adebayo* · Seller *Yewande Coker* · Realtor *Ngozi Eze (Prime Realty)* · Field Agent *Tobi Adeniyi (Prime Realty)*.

### Property graph
- **Property / Listing**, `owner` (User: name/verified/trust/since), type, `area`+`city` (Lagos/Abuja/PH + real area names), `price`, specs (`beds/baths/sqm`, furnished, pet), `amenities[]`, `verified` (title), title type, `desc`, image placeholder, `rating`/`reviews`, status. Rental listings (`RD.properties`), sale listings (`BD.listings`, `SD.listings`, `RT.listings`, `AD.listings`).
- **Building + Units (Landlord)**, a property has `units`, `occupied`, `rentPerUnit`; `units[propId]` is a roll of `{ no, beds, tenant, status: Occupied|Vacant, rent, due: paid|due|overdue, leaseEnd }`.

### Tenancy
- **Lease/Tenancy**, property/unit, landlord, tenant, `rent`, `deposit`, `start`/`end`, `renewal`, `nextDue`/`nextAmount`, `status`.
- **Application**, applicant (User, trust, income, verified), target unit, `when`, `status: New|Reviewing|Approved|Declined`. Approving issues an **escrow invite** that becomes a lease.
- **Maintenance ticket**, property/unit, tenant, `category`, `status: New|Assigned|In Progress|Resolved`, `priority`, `sla` (hours), `vendor`, `desc`, photos. Vendors are a directory.

### Sale & negotiation
- **Offer**, `listingId`, `amount`, `status: Submitted|Countered|Accepted|Declined`, `financing: Cash|Mortgage`, `counter` amount, and a **negotiation thread** of events `{ type: offer|counter|accept|msg, amount, text, t }`. Buyer‑side (`BD.offers`) and seller‑side (`SD.offers`) are two views of the same negotiation.
- **Transaction (escrow purchase)**, see §6.2.
- **Valuation comparables (Seller)**, `SD.comparables`: recent comparable sales powering the estimated‑value range + verdict tool.

### Brokerage operations (Realtor)
- **Lead**, person, `stage: New|Contacted|Viewing|Offer|Closed` (kanban), `listingId`, `budget`, `intent: Buy|Rent`, `trust`, `source`, contact.
- **Deal**, a sale in progress; `salePrice`, commission, deal milestones (offer→deposit→title→transfer→commission released), stage.
- **Viewing**, `listingId`, lead, date/time, assigned agent, `status: Requested|Confirmed|Completed`, `fee` (the agent's field fee), `outcome`.
- **Team/Agents & directory**, agents the brokerage has hired or can hire (profile, rating, coverage, trust).
- **Performance**, revenue/lead‑source attribution + closed‑deals analytics (derive from the above).

### Field agent
- **Field Task**, `type: Photos|Documents|Signage|Handover|Inspection`, `listingId`, `priority`, `due`, `fee`, `status: To Do|In Progress|Done`, `note`, `assignedBy`, `brokerage`, and **property access** `{ method: lockbox|caretaker|estate|concierge|office|tenant, code, where, contact{name,phone}, notes }`. Dispatched from the Realtor app (§10).
- **Access log**, check‑in/out events per property (who entered, when), an audit trail (`grt_access_log`).
- **Earnings/Payouts**, released field fees.
- **Agent marketplace profile**, `open_to_work`, coverage `areas`, `rating`, `completed`, `feeMin/feeMax`, `trust`. **Brokerage invites** (brokerage→agent) and **applications** (agent→brokerage), see §10.

### Management mandate (Landlord ⇄ Realtor), `styles/mgmt.js`
The richest cross‑app system. An owner delegates property management to an agency; both apps render the same mandate in real time. Entities:
- **Mandate**, `manager` (agency, lead, trust, since), `owner`, `feePct`.
- **Delegation dial**, `maintThreshold` (auto‑approve repairs under ₦X), `tenantApproval: auto|manual`, `rentIncrease: auto|manual`, `leaseRenewal: auto|manual`, `notify: all|digest`. **This dial is the authorization policy** for what the agency may do without owner sign‑off.
- **Managed properties**, each with a `roll` of units `{ unit, tenant, trust, verified, rent, status, escrow, due }`.
- **Approvals queue**, decisions the manager raises that exceed the dial → owner `approves|declines`. Anything under the thresholds never appears (it's auto‑handled and just logged).
- **Activity feed**, everything the manager did, newest first; the **transparency layer** (owner sees all without being in tenant conversations).
- **Open properties + Proposals**, an owner can *open* a property to receive management **proposals** from agencies (agency→owner, with fee %, services, message); accepting onboards the property into the managed portfolio. **Agencies directory** (with reviews) is the comparison set.

### Cross‑cutting
- **Document**, typed (`Lease|Receipt|Title|Escrow|Contract|Insurance|Financial|Report|Offer`), `verified`, size, date. File storage + verification status.
- **Message thread**, participants (name, role, trust), `messages[] {me, text, t}`, `unread`. Realtime chat.
- **Notification**, typed event (rent due, maintenance update, new/counter offer, escrow update, payout, new lead, viewing confirmed, commission released, new task, verify reminder), `unread`, time, tone. Per‑user feed with mark‑all‑read. The top‑bar bell renders the latest; badges (unread messages, new offers, open tasks) are counts derived from these.

---

## 8. The marketplace graph (keep relationships coherent)

These references are intentional and must stay consistent across services:
- Renter **Adaeze** is **Landlord Chidi's** tenant in Admiralty Court A1.
- Buyer **Olu** is a **Realtor Ngozi** lead and has an active escrow purchase with seller **Sadiq**.
- **Chidi** delegates his **Abuja** portfolio to **Prime Realty (Ngozi)**; **Ngozi** dispatches field work to **Agent Tobi**; **Tobi** works for **Prime Realty**.
- Trust scores, names, and amounts should reconcile across the renter/landlord/realtor/agent views of the same entity.

---

## 9. Key lifecycles (state machines to implement)

- **Rent:** invoice → tenant pays → `held` in escrow → confirm → `released` → landlord payout.
- **Application:** `New → Reviewing → Approved` (issues escrow invite → lease) `| Declined`.
- **Offer:** `Submitted → Countered ⇄ … → Accepted` (creates escrow transaction) `| Declined`.
- **Purchase escrow:** `deposit → verification → final → completion` (see §6.2).
- **Viewing (agent):** `Requested → Confirmed → Checked‑in → Completed (+outcome logged → field fee released)`.
- **Field task:** `dispatched → To Do → In Progress → Done (→ fee released)`.
- **Mandate approval:** manager raises → `pending → approved|declined` by owner (auto‑resolved if under dial threshold).
- **Management proposal:** owner opens property → agency proposes → owner `accepts` (onboards) `| declines`.
- **Brokerage membership:** brokerage invites or agent applies → `pending → accepted|declined`.
- **KYC:** `submitted → checking → verified|rejected` (identity); title verification analogous.

---

## 10. Persistence the prototype fakes (and what each becomes)

The prototype uses `localStorage`; several keys are **cross‑app bridges** that must become realtime services:

| Key | Purpose | Becomes |
|---|---|---|
| `grt_onboard` | onboarding progress (role, screen) | ephemeral client state |
| `grt_renter` / `grt_buyer` / `grt_seller` / `grt_landlord` / `grt_realtor` / `grt_agent` | per‑app session: `verified` flag + Buyer/Renter `saved`/`compareList`/`watched` | user record + user‑prefs service |
| **`grt_mgmt`** | **Landlord ⇄ Realtor** mandate: dial, managed roll, approvals, activity feed, open properties, proposals | **Mandate/Delegation service (realtime)** |
| **`grt_field_tasks`** | **Realtor → Agent** task dispatch | **Field‑task service (realtime push to agent)** |
| **`grt_invites`** | **Realtor → Agent** brokerage invitations | **Membership service** |
| `grt_access_log` | property access check‑in/out audit | **Access/Audit service** |
| `grt_open_to_work` | agent availability flag | agent profile field |

The four bolded keys exist because two different apps must observe the same state, they are your realtime/event surfaces.

---

## 11. Proposed API surface

REST resources (all under auth; enforce role + verification + delegation):

```
POST   /auth/signup · /auth/otp/verify · /auth/login · /auth/logout · /auth/oauth/google
GET    /users/me · GET /users/:id              # profile, role(s), trust, verification status
POST   /kyc/identity · GET /kyc/status         # NIN/NIMC, ID doc, liveness
POST   /kyc/property · GET /kyc/property/:id    # C of O / Deed / Survey → land registry
GET    /listings  (search, filters, map) · GET /listings/:id · POST/PATCH /listings   # publish gated
GET    /properties · /properties/:id · /units
POST   /applications · PATCH /applications/:id (approve|decline)   # approve gated
GET/POST /tenancies · /payments (rent → escrow) · /payouts · /payout-accounts
POST   /offers · POST /offers/:id/counter|accept|decline · GET /offers/:id/thread     # gated
GET    /transactions · POST /transactions/:id/milestones/:key/advance                 # escrow
GET/POST /maintenance · PATCH /maintenance/:id (assign vendor|advance)
GET/POST /viewings · POST /viewings/:id/checkin|complete   # complete releases field fee
GET/POST /leads · PATCH /leads/:id (stage) · GET/POST /deals · GET /performance
GET/POST /field-tasks · POST /field-tasks/:id/accept|complete
GET/POST /mandates · PATCH /mandates/:id/dial · /mandates/:id/approvals/:id (approve|decline)
GET    /agencies · POST /mandates/:propertyId/open · POST /proposals · POST /proposals/:id/accept
GET/POST /brokerage-memberships (invite|apply) · PATCH …/:id (accept|decline)
GET    /valuations?listingId= (comparables)
GET/POST /documents (upload, verify)
GET    /threads · POST /messages                                   # send gated
GET    /notifications · POST /notifications/read-all
```

**Realtime / events** (websocket or webhooks), emit at least:
`offer.created|countered|accepted`, `escrow.milestone.advanced`, `payment.received`, `payout.released`, `application.submitted|decided`, `maintenance.updated`, `viewing.checkedin|completed`, `fieldtask.dispatched|completed`, `mandate.request|accepted`, `approval.raised|decided`, `message.created`, `kyc.identity.verified`, `kyc.property.verified`, `notification.created`. These drive the badges, notification bell, and the cross‑app bridges in §10.

---

## 12. Authorization model (enforce server‑side)

Three layers stack:
1. **Role** → which app/surface and which resources a user sees.
2. **Verification** → whether a user may *transact* (the §3.5 gate). Browsing/read is open; create/accept/move‑money/message is verified‑only.
3. **Delegation** (managed properties) → the mandate **dial** decides what a managing agency may do autonomously (auto‑approve repairs under threshold, let units, renew leases) vs. what needs owner sign‑off; everything is written to the transparency feed regardless. **Property access codes** are permissioned: the brokerage sets them, the agent reveals them at the job, and reveals are logged.

---

## 13. Non‑functional

- **Locale/currency:** Nigerian Naira only. Format `₦185,000,000` (full) / `₦185M` (short); render money in a mono typeface. Locations: Lagos, Abuja, Port Harcourt with real area names (Lekki, Ikoyi, Wuse, Maitama, GRA, Gwarinpa).
- **Compliance:** NDPR; identity data (NIN, biometrics, documents) is sensitive, encrypt at rest, never expose publicly, restrict to the compliance queue. NIN is "verified against NIMC, never displayed."
- **Audit/transparency:** the management activity feed and access log are product‑level audit trails, model them as append‑only event streams.
- **File storage:** documents, ID uploads, property photos (the UI uses placeholders today; production needs real object storage + the `verified` workflow).
- **Idempotency & money:** all escrow/payment/payout mutations must be idempotent and ledgered.

---

## 14. Open questions for product + backend

1. **Multi‑role identity:** one account that can switch workspaces, or separate accounts per role? The sign‑in→Home hub assumes the former eventually.
2. **Hard vs. soft sign‑out:** should sign‑out also clear verification/session artifacts server‑side beyond the token?
3. **Escrow provider:** which licensed partner; what are the real release‑authorization rules and dispute flow?
4. **NIMC / land‑registry integrations:** availability, latency, and fallback when a lookup is pending (the UI already supports "verify in the background").
5. **Trust score formula:** exact inputs/weights and decay.
6. **Notification fan‑out:** push channels (in‑app, SMS, email) per event type and per user preference.

---

*This guide is generated from the prototype source. The `*/data.js` files and `styles/mgmt.js` are the authoritative field‑level reference; this document explains how they fit together into services.*
