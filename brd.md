# GigBuddy — Business Requirements Document (BRD)

**Version:** 1.0 — Phase 1 MVP  
**Last Updated:** 2026-06-21  
**Status:** Draft  

---

## 1. Executive Summary

**GigBuddy** is a web-based marketplace platform that solves the discovery and booking gap between Event Organizers (Clients) and Musicians/Performers. Musicians are adept at sourcing work via personal networks, but Clients lack a reliable, low-friction way to find, vet, and safely book the right talent for their events.

GigBuddy addresses this by providing:
- A structured directory of verified musician profiles
- An organizer-side gig posting and application management system
- End-to-end booking with auto-generated contracts (Phase 3)
- A secure, refundable payment holding scheme (Phase 3)

---

## 2. Stakeholders

| Role | Description |
|------|-------------|
| Event Organizer (Client) | Posts gigs, reviews musician applications, confirms bookings, manages payments |
| Musician / Performer | Browses open gigs, applies with their profile, tracks application status |
| Platform Admin | Manages disputes, verifies profiles, monitors platform health (Phase 4) |

---

## 3. Core Problem Statement

**For Event Organizers:**
- No central, curated place to discover musicians that match specific event needs (genre, instrumentation, budget, location)
- No standardized vetting or booking flow — relies on word of mouth
- Risk of no-shows or unenforceable verbal agreements

**For Musicians:**
- Missed gig opportunities outside their immediate network
- No formal system to track applications or gig commitments
- Lack of payment protection or contract enforcement

---

## 4. Goals & Success Metrics (Phase 1)

| Goal | Metric |
|------|--------|
| Organizers can post a gig | ≥1 gig posted per session in testing |
| Musicians can browse and apply | Apply CTA works, application stored in DB |
| Dual-view dashboard renders correctly | Zero console errors on role toggle |
| All 3 MVP pages load and are navigable | Routing verified manually |

---

## 5. Functional Requirements

### 5.1 Unified Dashboard (Both Roles)
- **FR-D01:** System shall display a role-specific dashboard after login.
- **FR-D02:** A persistent "Toggle Role" button shall allow switching views during Phase 1 development.
- **FR-D03 (Organizer):** Dashboard shall display: Total Active Gigs, Pending Applications, Confirmed Bookings.
- **FR-D04 (Organizer):** Dashboard shall list the organizer's own upcoming events.
- **FR-D05 (Musician):** Dashboard shall display upcoming scheduled gigs.
- **FR-D06 (Musician):** Dashboard shall display application statuses: Pending, Accepted, Rejected.
- **FR-D07 (Musician):** Dashboard shall include a quick link to update availability.

### 5.2 Gig Creator (Organizer Only)
- **FR-GC01:** Form shall capture: Event Title, Description, Venue Name, Location, Gig Date.
- **FR-GC02:** Form shall capture: Soundcheck time, Set start time, Set end time.
- **FR-GC03:** Form shall capture: Budget (numeric, USD), Genre preferences, Instruments needed, Backline provided (boolean toggle).
- **FR-GC04:** On valid submission, system shall POST to `/api/gigs` and create a Gig document.
- **FR-GC05:** On successful creation, user shall be redirected to the Dashboard.

### 5.3 Marketplace — Dual-View (Role-Aware)

#### Musician View (Gig Feed)
- **FR-GM01:** Page shall display all gigs with `status: "open"`.
- **FR-GM02:** Each gig card shall show: Title, Venue, Date, Budget (₱ PHP), Genre tags.
- **FR-GM03:** Clicking a card shall populate a detail panel with: Description, Time window, Gear info.
- **FR-GM04:** Detail panel shall include an "Apply with Profile" CTA button.
- **FR-GM05:** Clicking CTA shall POST to `/api/applications` with `initiatedBy: "musician"`.
- **FR-GM06:** After applying, the CTA shall update to show "Applied ✓" and be disabled.

#### Organizer View (Artist Directory)
- **FR-AD01:** Page shall display a directory of all users with `role: "musician"`.
- **FR-AD02:** Each musician card shall show: Name, Location, Bio excerpt, Genre tags.
- **FR-AD03:** Clicking a musician card shall populate a detail panel with their full profile (bio, genres, instruments).
- **FR-AD04:** The detail panel shall contain an "Send an Invitation" section.
- **FR-AD05:** Organizer selects one of their own open gigs from a dropdown, then clicks "Send Invitation".
- **FR-AD06:** This shall POST to `/api/applications` with `initiatedBy: "organizer"`.
- **FR-AD07:** After inviting, the CTA shall update to "Invitation Sent ✓" and be disabled for that gig+musician pair.
- **FR-AD08:** If the organizer has no open gigs, the panel shall show a prompt to post one.

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | Page load < 2s on local dev server |
| Responsiveness | Functional on screens ≥ 768px wide |
| Code quality | ESLint clean; no console errors in production build |
| Security (Phase 2+) | Passwords bcrypt-hashed; JWT in httpOnly cookie |

---

## 7. Out of Scope (Phase 1)

- Real authentication / account creation
- Email / push notifications
- Contract generation (PDF)
- Stripe payment integration
- Musician public profile pages
- Admin dashboard
- Mobile app

---

## 8. Phase Roadmap

| Phase | Target Features | Est. Effort |
|-------|----------------|-------------|
| 1 (current) | Scaffold, 3 core pages, mock auth, Mongoose schemas | 1–2 weeks |
| 2 | Real JWT auth, signup/login, musician profile page, email notifications | 2–3 weeks |
| 3 | Contract generation, Stripe payment holding, refund logic | 3–4 weeks |
| 4 | Admin dashboard, analytics, availability calendar integration | 3–4 weeks |

---

## 9. Technical Architecture Summary

```
GigBuddy/
├── server/                  # Node.js + Express API
│   ├── models/              # Mongoose schemas (User, Gig, Application)
│   ├── routes/              # Express routers (gigs, applications)
│   ├── index.js             # App entry point
│   └── seed.js              # Dev seed script
├── client/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/             # Fetch wrappers per resource
│   │   ├── context/         # AuthContext (mock Phase 1)
│   │   ├── components/      # Shared UI (Navbar, GigCard, etc.)
│   │   └── pages/           # Dashboard, GigCreator, GigMarketplace
│   └── tailwind.config.js
├── agents.md                # AI agent master prompt (update iteratively)
├── brd.md                   # This file — business requirements
└── package.json             # Root workspace orchestration
```

---

## 10. Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-06-21 | GigBuddy Team | Initial BRD — Phase 1 scope |
