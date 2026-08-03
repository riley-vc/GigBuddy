# GigBag — Business Requirements Document (BRD)

**Version:** 1.2 — Phase 1 MVP (Complete)
**Last Updated:** 2026-07-13
**Status:** Phase 1 Complete · Phase 2 Planned

---

## 1. Executive Summary

**GigBag** *(formerly GigBuddy)* is a mobile-first, web-based B2B2C marketplace platform connecting Event Organizers with Musicians and Performers in the Philippines. Musicians are adept at sourcing work via personal networks, but Organizers lack a reliable, low-friction way to find, vet, and safely book the right talent for their events.

GigBag addresses this by providing:
- A structured directory of verified musician profiles
- An organizer-side gig posting and application management system
- Real-time chat between organizers and musicians
- MoA (Memorandum of Agreement) contract generation with digital signatures
- A secure ₱ PHP escrow payment holding scheme
- Mobile-first responsive design — fully usable on phones

---

## 2. Stakeholders

| Role | Description |
|------|-------------|
| Event Organizer (Planner) | Posts gigs, browses artist directory, sends invitations, reviews applications, manages bookings, signs MoA contracts |
| Musician / Performer | Browses open gigs, applies with their profile, receives planner invitations, chats directly with organizers, signs MoA |
| Platform Admin | Manages disputes, verifies profiles, monitors platform health (Phase 4) |

---

## 3. Core Problem Statement

**For Event Organizers:**
- No central, curated place to discover musicians matching specific event needs (genre, instrumentation, budget, PH location)
- No standardized vetting or booking flow — relies on word of mouth
- Risk of no-shows or unenforceable verbal agreements
- No payment protection

**For Musicians:**
- Missed gig opportunities outside their immediate network
- No formal system to track applications or gig commitments
- Lack of payment protection or contract enforcement

---

## 4. Goals & Success Metrics (Phase 1)

| Goal | Metric |
|------|--------|
| Organizers can post a gig via 3-step wizard | ≥1 gig posted per session in testing |
| Musicians can browse and apply | Apply CTA works, application stored in DB |
| Dual-view dashboard renders correctly | Zero console errors on role toggle |
| Real-time chat between parties | Messages appear without page refresh |
| MoA contract can be drafted and signed | Both roles can sign; status updates to `fully_signed` |
| App usable on real phones | Tested on iOS Safari via LAN URL |
| Demo accounts auto-fill on login page | Testers can sign in with one tap |

---

## 5. Functional Requirements

### 5.1 Authentication (Phase 1 — Real JWT)
- **FR-A01:** Login page shall accept email + password and POST to `/api/auth/login`.
- **FR-A02:** Register page shall accept name, email, password, role and POST to `/api/auth/register`.
- **FR-A03:** On success, user object is stored in `AuthContext` and `localStorage`.
- **FR-A04:** Logout clears auth context and redirects to login.
- **FR-A05:** Login page shall display tappable demo account cards that auto-fill credentials.

### 5.2 Unified Dashboard (Both Roles)
- **FR-D01:** System shall display a role-specific dashboard after login.
- **FR-D02:** A persistent "Toggle Role" button shall allow switching views during Phase 1 development.
- **FR-D03 (Organizer):** Dashboard shall display: Active Open Calls, Pending Applications, Confirmed Bookings.
- **FR-D04 (Organizer):** Dashboard shall list the organizer's own gigs with status management controls.
- **FR-D05 (Musician):** Dashboard shall display application statuses: Pending, Approved, Rejected.
- **FR-D06 (Musician):** Dashboard shall display an availability weekly toggle per day.
- **FR-D07 (Musician):** Dashboard shall contain a Planner Invitations inbox.

### 5.3 Gig Creator (Organizer Only)
- **FR-GC01:** Form shall be presented as a **3-step wizard** to avoid overwhelming mobile users.
  - Step 1: Event Info (title, venue, date)
  - Step 2: Schedule & Budget (soundcheck, set, end times; ₱ PHP budget; description)
  - Step 3: Talent Specs (genres, instruments, backline provided)
- **FR-GC02:** Each step shall validate before proceeding to the next.
- **FR-GC03:** Desktop shall show a live preview panel alongside the form.
- **FR-GC04:** On valid submission, system shall POST to `/api/gigs` and redirect to dashboard.

### 5.4 Marketplace — Dual-View (Role-Aware)

#### Musician View (Gig Feed)
- **FR-GM01:** Page shall display all gigs with `status: "open"`.
- **FR-GM02:** Each gig card shall show: Title, Venue, Date, Budget (₱ PHP), Genre tags.
- **FR-GM03 (Mobile):** Tapping a card opens a full-screen bottom sheet with gig details.
- **FR-GM03 (Desktop):** Clicking a card populates a split-pane detail panel.
- **FR-GM04:** Detail panel shall include an "Apply with Musician Profile" CTA.
- **FR-GM05:** Clicking CTA shall POST to `/api/applications` with `initiatedBy: "musician"`.
- **FR-GM06:** After applying, the CTA shall update to "Applied ✓".

#### Organizer View (Artist Directory)
- **FR-AD01:** Page shall display a directory of all users with `role: "musician"`.
- **FR-AD02:** Musician cards shall show: Name, Location, Bio excerpt, Genre/Instrument tags.
- **FR-AD03:** Clicking a musician card shows their full profile.
- **FR-AD04:** Organizer selects one of their open gigs and clicks "Send Invitation".
- **FR-AD05:** This shall POST to `/api/applications` with `initiatedBy: "organizer"`.
- **FR-AD06:** After inviting, an "Open Chat" button shall appear to begin real-time conversation.

### 5.5 Real-Time Chat
- **FR-CH01:** Every application/invitation automatically creates a Conversation with the `coverNote` as the opening message.
- **FR-CH02:** A `ChatDrawer` slide-in panel provides real-time messaging via Socket.io.
- **FR-CH03 (Mobile):** Chat drawer is full-screen on phones.
- **FR-CH03 (Desktop):** Chat drawer is a right-side panel (max-width: 28rem).
- **FR-CH04:** Unread message counts are shown in the header bell icon and BottomNav badge.
- **FR-CH05:** Musicians see all organizer invitations in an Invitation Inbox on their dashboard.

### 5.6 MoA Contract System
- **FR-CO01:** Organizer can draft a contract after approving an application, specifying compensation (₱ PHP).
- **FR-CO02:** Both organizer and musician must type their legal name to sign.
- **FR-CO03:** Contract status: `pending_signatures` → `fully_signed` → `completed`.
- **FR-CO04:** Payment Portal allows organizer to fund escrow and release payment on completion.

### 5.7 Mobile-First UI
- **FR-MO01:** App shall be fully functional on iPhone/Android browsers at 375px+ width.
- **FR-MO02:** A sticky `BottomNav` bar replaces the desktop tab bar on mobile.
- **FR-MO03:** All modals shall slide up from the bottom on mobile (bottom-sheet pattern).
- **FR-MO04:** Inputs shall have a minimum 16px font size to prevent iOS Safari auto-zoom.
- **FR-MO05:** App shall use `env(safe-area-inset-bottom)` for iPhone home bar compatibility.
- **FR-MO06:** A `?` Help button in the header opens a guide modal explaining the sandbox flow.

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | Page load < 2s on local dev server |
| Responsiveness | Fully functional on screens ≥ 375px (iPhone SE) |
| Code quality | Zero build errors; no console errors in production build |
| Security (Phase 2+) | Passwords bcrypt-hashed; JWT in httpOnly cookie |
| CORS | Server allows localhost + all LAN IPs for mobile testing |
| Locale | Philippines — ₱ PHP currency, PH venues, OPM/Bisrock genres |

---

## 7. Out of Scope (Phase 1 — Deferred to Later Phases)

- Email / push notifications
- Contract generation (PDF export)
- GCash / Stripe payment integration
- Musician public profile pages (shareable URL)
- Admin dashboard
- Native mobile app

---

## 8. Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Scaffold, schemas, dual-view marketplace, real auth, MoA contracts, Socket.io chat, invitation inbox, mobile-first UI, PH locale | ✅ Complete |
| 2 | Musician public profile pages, email notifications, profile editing, photo uploads | 🔜 Next |
| 3 | Contract PDF generation, GCash / Stripe payment holding, refund logic, review system | Planned |
| 4 | Admin dashboard, analytics, availability calendar integration | Planned |

---

## 9. Technical Architecture Summary

```
GigBag/
├── server/                   # Node.js + Express API (port 4000)
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Gig.js
│   │   ├── Application.js
│   │   ├── Contract.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── routes/               # Express routers
│   │   ├── auth.js           # POST /api/auth/login, /register
│   │   ├── gigs.js
│   │   ├── applications.js
│   │   ├── contracts.js
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── index.js              # App entry, Socket.io, LAN-aware CORS
│   └── seed.js               # DB seeder (PH sample data)
├── client/                   # React + Vite + Tailwind CSS v4 (port 5173)
│   ├── src/
│   │   ├── api/              # Fetch wrappers (gigs, applications, etc.)
│   │   ├── components/
│   │   │   ├── BottomNav.jsx         # Mobile sticky navigation
│   │   │   ├── HelpModal.jsx         # ? guide modal
│   │   │   ├── Header.jsx
│   │   │   ├── ChatDrawer.jsx        # Real-time Socket.io chat
│   │   │   ├── GigMarketplace.jsx    # Mobile drill-down + desktop split
│   │   │   ├── GigCreatorForm.jsx    # 3-step wizard
│   │   │   ├── ArtistMarketplace.jsx
│   │   │   ├── OrganizerDashboard.jsx
│   │   │   ├── MusicianDashboard.jsx
│   │   │   ├── InvitationInbox.jsx
│   │   │   ├── MoaContractModal.jsx
│   │   │   ├── PaymentPortalModal.jsx
│   │   │   ├── LoginPage.jsx         # Demo account auto-fill
│   │   │   └── RegisterPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # JWT auth context
│   │   └── App.jsx                   # Root — socket.io, routing, state
│   ├── vite.config.js                # host: true for LAN/phone testing
│   └── index.html                    # Mobile meta tags, viewport-fit=cover
├── agents.md                 # AI agent master prompt (living document)
├── brd.md                    # This file
├── how2run.md                # Developer setup and run guide
└── package.json              # Root workspace — concurrently dev scripts
```

---

## 10. Demo Accounts (Seed Data)

| Role | Name | Email | Password |
|------|------|-------|----------|
| Event Planner | Maria Santos | maria@skydeck.com.ph | password123 |
| Musician | Carlo Reyes | carlo@gigbag.ph | password123 |

Run `npm run seed` from the project root to populate these accounts.

---

## 11. Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-06-21 | GigBag Team | Initial BRD — Phase 1 scope |
| 1.1 | 2026-06-26 | GigBag Team | Added chat, invitation inbox, Socket.io, MoA contracts, PH recontextualization |
| 1.2 | 2026-07-13 | GigBag Team | Mobile-first refactor: BottomNav, HelpModal, 3-step wizard, full-screen chat, bottom-sheet modals, LAN CORS, real JWT auth, demo account auto-fill |
