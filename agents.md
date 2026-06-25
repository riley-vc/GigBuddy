# GigBuddy — Master Agent Prompt (`agents.md`)

> This file acts as the persistent **system prompt and working memory** for any AI agent
> (Antigravity, Copilot, etc.) contributing to this codebase. Update it as the project evolves.

---

## Project Identity

- **Product Name:** GigBuddy
- **Type:** B2B2C Marketplace (Web App)
- **Stack:** MongoDB · Express.js · React (Vite) · Node.js (MERN)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no config file)
- **Icons:** lucide-react
- **Animation:** motion (Framer Motion)
- **Server Port:** 4000 (macOS Control Center occupies 5000)
- **Client Port:** 5173
- **Current Phase:** Phase 1 MVP

---

## Mission

Connect Event Organizers (Clients) with Musicians/Performers through a dual-view marketplace.
- Organizers post gigs, review applications, manage bookings.
- Musicians browse open gigs, apply with their profile, track application status.

---

## Architecture Rules

1. **Monorepo layout:** `/server` (Express API) and `/client` (React + Vite). Root `package.json` orchestrates both via `concurrently`.
2. **API prefix:** All routes are namespaced under `/api/` (e.g., `/api/gigs`, `/api/applications`).
3. **Auth (Phase 1):** Mock auth context — `currentUser` is hardcoded. Toggle role via UI button. No real JWT until Phase 2.
4. **Auth (Phase 2+):** JWT stored in `httpOnly` cookies. Passwords hashed with `bcrypt`.
5. **No direct DB queries from frontend** — all data flows through the Express REST layer.
6. **Mongoose models live in** `server/models/`. Never mutate them without updating this file.
7. **React components** follow functional + hooks pattern. No class components.
8. **State management:** React Context for auth. React Query (or SWR) for server state — add in Phase 2.

---

## Current Mongoose Schemas

### User
| Field       | Type     | Notes                                        |
|-------------|----------|----------------------------------------------|
| email       | String   | required, unique                             |
| password    | String   | required (bcrypt hash)                       |
| role        | String   | enum: organizer \| musician                  |
| name        | String   | required                                     |
| bio         | String   | optional — musician profile bio              |
| genres      | [String] | optional — genres the musician plays         |
| instruments | [String] | optional — instruments the musician plays    |
| location    | String   | optional — city / area                       |

### Gig
| Field                      | Type     | Notes                                   |
|----------------------------|----------|-----------------------------------------|
| organizerId                | ObjectId | ref: User                               |
| title                      | String   | required                                |
| description                | String   |                                         |
| venueName                  | String   | required (renamed from `venue`)         |
| date                       | Date     | required                                |
| soundcheckTime             | String   | e.g. "18:00"                           |
| setTime                    | String   | e.g. "20:30" (renamed from startTime)  |
| endTime                    | String   | e.g. "23:00"                           |
| budget                     | Number   | required (USD)                          |
| genres                     | [String] | flat (was requirements.genres)          |
| instruments                | [String] | flat (was requirements.instruments)     |
| backlineProvided           | [String] | list of gear items (was Boolean)        |
| status                     | String   | enum: open \| filled \| in_progress \| completed \| cancelled |

### Application
| Field          | Type     | Notes                                                   |
|----------------|----------|---------------------------------------------------------|
| gigId          | ObjectId | ref: Gig                                                |
| musicianId     | ObjectId | ref: User                                               |
| musicianName   | String   | denormalized for display                                |
| musicianAvatar | String   | URL — denormalized for display                          |
| instrument     | String   | instrument they'll play                                 |
| skills         | [String] | skill tags                                              |
| sampleVideoUrl | String   | optional YouTube/video URL                              |
| coverNote      | String   | cover letter from musician                              |
| status         | String   | enum: pending \| approved \| rejected                   |
| initiatedBy    | String   | enum: musician \| organizer                             |
| appliedAt      | Date     | default: Date.now                                       |

### Contract
| Field               | Type     | Notes                                                   |
|---------------------|----------|---------------------------------------------------------|
| gigId               | ObjectId | ref: Gig                                                |
| applicationId       | ObjectId | ref: Application                                        |
| musicianId          | ObjectId | ref: User                                               |
| organizerId         | ObjectId | ref: User                                               |
| gigTitle            | String   | denormalized                                            |
| venueName           | String   | denormalized                                            |
| date                | String   | ISO date string                                         |
| compensation        | Number   | USD amount locked in escrow                             |
| organizerSignature  | String   | typed legal name                                        |
| musicianSignature   | String   | typed legal name                                        |
| signedAt            | String   | date string                                             |
| status              | String   | enum: pending_signatures \| fully_signed \| completed   |

---

## Current API Routes

| Method | Route                         | Description                                  |
|--------|-------------------------------|----------------------------------------------|
| GET    | /api/gigs                     | List gigs (filter: status, organizerId)      |
| POST   | /api/gigs                     | Create a gig (organizer)                     |
| GET    | /api/gigs/:id                 | Single gig detail                            |
| PATCH  | /api/gigs/:id/status          | Update gig status                            |
| GET    | /api/applications             | List applications (filter: gigId/musicianId) |
| POST   | /api/applications             | Apply (musician) OR invite (organizer)       |
| PATCH  | /api/applications/:id/status  | Accept / reject an application               |
| GET    | /api/users                    | List users (filter: role=musician)           |
| GET    | /api/users/:id                | Single user profile                          |
| GET    | /api/contracts                | List contracts (filter: gigId/musicianId/organizerId) |
| POST   | /api/contracts                | Create contract (auto-approves app + fills gig) |
| PATCH  | /api/contracts/:id/sign       | Add a signature (role: organizer\|musician)  |

| Phase | Focus |
|-------|-------|
| 1 (current) | Scaffold, schemas, 3 core pages (Dashboard, Gig Creator, Marketplace), mock auth |
| 2 | Real JWT auth, login/signup pages, musician profile page, email notifications |
| 3 | Contract generation (PDF), Stripe payment holding/refund, review system |
| 4 | Admin dashboard, analytics, availability calendar integration |

---

## Coding Conventions

- Use **async/await** with try/catch in all Express route handlers.
- Return consistent JSON shapes: `{ success: true, data: ... }` or `{ success: false, error: "..." }`.
- Frontend API calls live in `client/src/api/` (one file per resource, e.g., `gigs.js`).
- Use `import`/`export` (ESM) everywhere — both server (Node 18+ with `"type":"module"`) and client.
- Tailwind classes follow a **mobile-first** responsive approach.
- Component filenames: **PascalCase**. Utility/hook filenames: **camelCase**.

---

## Update Log

| Date       | Change |
|------------|--------|
| 2026-06-21 | Initial agents.md created for Phase 1 scaffold |
| 2026-06-21 | Philippines recontextualization (₱ PHP, PH venues, OPM/Bisrock genres) |
| 2026-06-21 | Marketplace made dual-view: organizers see artist directory + invite flow; User schema extended with musician profile fields; Application schema gets initiatedBy field; added /api/users route |
| 2026-06-24 | Full AI Studio frontend migration: Gig schema flattened (venueName, genres, instruments, backlineProvided as [String], soundcheckTime, setTime, filled status); Application enriched with musician display fields; new Contract model + /api/contracts routes; Tailwind v3→v4 upgrade; all components ported TSX→JSX; localStorage replaced with real API calls; server on port 4000 (5000 occupied by macOS Control Center) |
