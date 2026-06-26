# GigBag — Master Agent Prompt (`agents.md`)

> This file acts as the persistent **system prompt and working memory** for any AI agent
> (Antigravity, Copilot, etc.) contributing to this codebase. Update it as the project evolves.

---

## Project Identity

- **Product Name:** GigBag *(formerly GigBuddy)*
- **Type:** B2B2C Marketplace (Web App)
- **Stack:** MongoDB · Express.js · React (Vite) · Node.js (MERN)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no config file)
- **Icons:** lucide-react
- **Realtime:** socket.io (server) + socket.io-client (client)
- **Server Port:** 4000 (macOS Control Center occupies 5000)
- **Client Port:** 5173
- **Current Phase:** Phase 1 MVP (complete)
- **Locale / Currency:** Philippines — ₱ PHP. All budget/compensation figures are in Philippine Peso.

---

## Mission

Connect Event Organizers (Clients) with Musicians/Performers in the Philippines through a dual-view marketplace.
- Organizers post gigs, browse an artist directory, send invitations, review applications, manage bookings.
- Musicians browse open gigs, apply with their profile, receive planner invitations, and chat directly with organizers.

---

## Architecture Rules

1. **Monorepo layout:** `/server` (Express API) and `/client` (React + Vite). Root `package.json` orchestrates both via `concurrently`.
2. **API prefix:** All routes are namespaced under `/api/` (e.g., `/api/gigs`, `/api/applications`).
3. **Auth (Phase 1):** Mock auth context — `currentUser` is hardcoded in `App.jsx`. Toggle role via UI button. No real JWT until Phase 2.
4. **Auth (Phase 2+):** JWT stored in `httpOnly` cookies. Passwords hashed with `bcrypt`.
5. **No direct DB queries from frontend** — all data flows through the Express REST layer.
6. **Mongoose models live in** `server/models/`. Never mutate them without updating this file.
7. **React components** follow functional + hooks pattern. No class components.
8. **State management:** React Context for auth. React Query (or SWR) for server state — add in Phase 2.
9. **Realtime:** Socket.io rooms are keyed by `conversationId`. The server was refactored to use `http.createServer` so Express and Socket.io share the same port (4000).
10. **JavaScript only** — no TypeScript anywhere (server or client).

---

## Mock Auth Users (Phase 1 Hardcoded)

These IDs are printed by `seed.js` after running. Paste them into `App.jsx` constants.

| Role | Name | Note |
|------|------|------|
| Organizer | Maria Santos | `MOCK_ORGANIZER` in `App.jsx` |
| Musician | Carlo Reyes | `MOCK_MUSICIAN` in `App.jsx` |

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
| location    | String   | optional — city / area (PH cities)           |

### Gig
| Field            | Type     | Notes                                                    |
|------------------|----------|----------------------------------------------------------|
| organizerId      | ObjectId | ref: User                                                |
| title            | String   | required                                                 |
| description      | String   |                                                          |
| venueName        | String   | required — PH venue name                                 |
| date             | Date     | required                                                 |
| soundcheckTime   | String   | e.g. "18:00"                                             |
| setTime          | String   | e.g. "20:30"                                             |
| endTime          | String   | e.g. "23:00"                                             |
| budget           | Number   | required — ₱ PHP                                         |
| genres           | [String] | flat array, PH-context (OPM, Bisrock, P-pop, Kundiman…)  |
| instruments      | [String] | flat array                                               |
| backlineProvided | [String] | list of gear items                                       |
| status           | String   | enum: open \| filled \| in_progress \| completed \| cancelled |

### Application
| Field          | Type     | Notes                                                         |
|----------------|----------|---------------------------------------------------------------|
| gigId          | ObjectId | ref: Gig                                                      |
| musicianId     | ObjectId | ref: User                                                     |
| organizerId    | ObjectId | ref: User — the organizer who owns the gig                    |
| musicianName   | String   | denormalized for display                                      |
| musicianAvatar | String   | URL — denormalized for display                                |
| organizerName  | String   | denormalized for display                                      |
| instrument     | String   | instrument they'll play                                       |
| skills         | [String] | skill tags                                                    |
| sampleVideoUrl | String   | optional YouTube/video URL                                    |
| coverNote      | String   | cover letter from musician OR invitation note from organizer  |
| status         | String   | enum: pending \| approved \| rejected                         |
| initiatedBy    | String   | enum: musician \| organizer                                   |
| appliedAt      | Date     | default: Date.now                                             |

### Contract
| Field              | Type     | Notes                                                   |
|--------------------|----------|---------------------------------------------------------|
| gigId              | ObjectId | ref: Gig                                                |
| applicationId      | ObjectId | ref: Application                                        |
| musicianId         | ObjectId | ref: User                                               |
| organizerId        | ObjectId | ref: User                                               |
| gigTitle           | String   | denormalized                                            |
| venueName          | String   | denormalized                                            |
| date               | String   | ISO date string                                         |
| compensation       | Number   | ₱ PHP amount locked in escrow                           |
| organizerSignature | String   | typed legal name                                        |
| musicianSignature  | String   | typed legal name                                        |
| signedAt           | String   | date string                                             |
| status             | String   | enum: pending_signatures \| fully_signed \| completed   |

### Conversation *(new — Phase 1 Chat)*
| Field          | Type     | Notes                                                          |
|----------------|----------|----------------------------------------------------------------|
| applicationId  | ObjectId | ref: Application — 1 conversation per application (scoped)    |
| gigId          | ObjectId | ref: Gig                                                       |
| musicianId     | ObjectId | ref: User                                                      |
| organizerId    | ObjectId | ref: User                                                      |
| gigTitle       | String   | denormalized                                                   |
| venueName      | String   | denormalized                                                   |
| gigBudget      | Number   | denormalized ₱ PHP                                             |
| organizerName  | String   | denormalized                                                   |
| musicianName   | String   | denormalized                                                   |
| lastMessage    | String   | preview of the last message                                    |
| lastMessageAt  | Date     | for sorting conversation list                                  |
| unreadOrganizer| Number   | unread count for organizer side                                |
| unreadMusician | Number   | unread count for musician side                                 |

### Message *(new — Phase 1 Chat)*
| Field          | Type     | Notes                                              |
|----------------|----------|----------------------------------------------------|
| conversationId | ObjectId | ref: Conversation                                  |
| senderId       | ObjectId | ref: User                                          |
| senderRole     | String   | enum: organizer \| musician                        |
| senderName     | String   | denormalized for display                           |
| content        | String   | message body                                       |
| readBy         | [String] | array of roles that have read this message         |
| createdAt      | Date     | default: Date.now                                  |

---

## Current API Routes

### Core REST
| Method | Route                        | Description                                               |
|--------|------------------------------|-----------------------------------------------------------|
| GET    | /api/gigs                    | List gigs (filter: status, organizerId)                   |
| POST   | /api/gigs                    | Create a gig (organizer)                                  |
| GET    | /api/gigs/:id                | Single gig detail                                         |
| PATCH  | /api/gigs/:id/status         | Update gig status                                         |
| GET    | /api/applications            | List applications (filter: gigId, musicianId, organizerId)|
| POST   | /api/applications            | Apply (musician) OR invite (organizer) — auto-spawns a Conversation + seeds opening message from coverNote |
| PATCH  | /api/applications/:id/status | Accept / reject an application                            |
| GET    | /api/users                   | List users (filter: role=musician)                        |
| GET    | /api/users/:id               | Single user profile                                       |
| GET    | /api/contracts               | List contracts (filter: gigId, musicianId, organizerId)   |
| POST   | /api/contracts               | Create contract (auto-approves app + fills gig)           |
| PATCH  | /api/contracts/:id/sign      | Add a signature (role: organizer\|musician)               |

### Chat REST
| Method | Route                              | Description                                          |
|--------|------------------------------------|------------------------------------------------------|
| GET    | /api/conversations                 | List conversations (filter: musicianId, organizerId) |
| GET    | /api/conversations/:id             | Single conversation detail                           |
| POST   | /api/conversations                 | Create a conversation manually (rarely used directly)|
| PATCH  | /api/conversations/:id/read        | Mark conversation as read for a given role           |
| GET    | /api/messages/:conversationId      | Get all messages for a conversation                  |

### Socket.io Events
| Event (client → server) | Payload | Description |
|------------------------|---------|-------------|
| `chat:join`            | `conversationId` | Join a Socket.io room for a conversation |
| `chat:leave`           | `conversationId` | Leave a room |
| `chat:send`            | `{ conversationId, senderId, senderRole, senderName, content }` | Send a message; ACK returns `{ success, data: message }` |
| `chat:read`            | `{ conversationId, role }` | Mark messages as read |

| Event (server → client) | Payload | Description |
|------------------------|---------|-------------|
| `chat:receive`          | Message object | Broadcast new message to all in the room |
| `conversation:updated`  | `{ conversationId }` | Notifies clients to refresh conversation metadata |

---

## Client File Structure

```
client/src/
├── api/
│   ├── gigs.js
│   ├── applications.js
│   ├── contracts.js
│   ├── users.js
│   └── conversations.js        ← new (chat)
├── components/
│   ├── Header.jsx              ← chat bell + unread badge
│   ├── RoleToggle.jsx
│   ├── GigCreatorForm.jsx      ← PH genre/instrument presets, ₱ budget
│   ├── GigMarketplace.jsx      ← musician view: browse & apply
│   ├── ArtistMarketplace.jsx   ← organizer view: artist directory + invite + open chat
│   ├── OrganizerDashboard.jsx  ← gig management, applicant review, contracts list
│   ├── MusicianDashboard.jsx   ← invitation inbox + availability + bands + profile
│   ├── MoaContractModal.jsx    ← sign MoA, ₱ PHP escrow
│   ├── ChatDrawer.jsx          ← new: slide-in real-time chat panel
│   └── InvitationInbox.jsx     ← new: musician's planner invitation cards
└── App.jsx                     ← socket.io init, conversation state, all handlers
```

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Scaffold, schemas, dual-view marketplace, mock auth, MoA contracts, **chat + invitation inbox (Socket.io)**, PH locale (₱, venues, OPM genres) | ✅ Complete |
| 2 | Real JWT auth, login/signup pages, musician public profile pages, email notifications | 🔜 Next |
| 3 | Contract PDF generation, GCash / Stripe payment holding, refund logic, review system | Planned |
| 4 | Admin dashboard, analytics, availability calendar integration | Planned |

---

## Coding Conventions

- Use **async/await** with try/catch in all Express route handlers.
- Return consistent JSON shapes: `{ success: true, data: ... }` or `{ success: false, error: "..." }`.
- Frontend API calls live in `client/src/api/` (one file per resource, e.g., `gigs.js`).
- Use `import`/`export` (ESM) everywhere — both server (Node 18+ with `"type":"module"`) and client.
- Tailwind classes follow a **mobile-first** responsive approach.
- Component filenames: **PascalCase**. Utility/hook filenames: **camelCase**.
- Currency display: always use `₱` prefix + `.toLocaleString()` for comma formatting (e.g., `₱12,000`).
- Socket.io rooms: always use `conversationId` as the room key.

---

## Update Log

| Date       | Change |
|------------|--------|
| 2026-06-21 | Initial agents.md created for Phase 1 scaffold |
| 2026-06-21 | Philippines recontextualization (₱ PHP, PH venues, OPM/Bisrock genres) |
| 2026-06-21 | Marketplace made dual-view: organizers see artist directory + invite flow; User schema extended with musician profile fields; Application schema gets `initiatedBy` field; added `/api/users` route |
| 2026-06-24 | Full AI Studio frontend migration: Gig schema flattened (venueName, genres, instruments, backlineProvided as [String], soundcheckTime, setTime, filled status); Application enriched with musician display fields; new Contract model + `/api/contracts` routes; Tailwind v3→v4 upgrade; all components ported TSX→JSX; localStorage replaced with real API calls; server on port 4000 |
| 2026-06-26 | **Chat + Invitation Inbox system:** new Conversation + Message models; `/api/conversations` + `/api/messages` routes; server refactored to `http.createServer` for Socket.io on port 4000; `ChatDrawer.jsx` (real-time slide-in chat); `InvitationInbox.jsx` (musician receives organizer invites); `Header.jsx` unread badge; `ArtistMarketplace.jsx` "Open Chat" after invite; `App.jsx` socket.io client init + conversation state; POST `/api/applications` now auto-spawns a Conversation and seeds the opening message from `coverNote` |
| 2026-06-26 | **Rebranded to GigBag** (from GigBuddy); full PH recontextualization: Filipino mock users (Maria Santos / Carlo Reyes), PH venues (BGC, Tagaytay, Cebu, QC), OPM/Bisrock/P-pop/Kundiman genre presets, ₱ PHP budgets across all UI and seed data, GigCreatorForm presets updated |
