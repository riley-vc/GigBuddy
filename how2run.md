# How to Run GigBag — Developer Setup Guide

> **For AI agents:** Read `agents.md` and `brd.md` first to get full project context before making any changes.

---

## Prerequisites

Make sure you have the following installed:
- **Node.js** v18+ (use [nvm](https://github.com/nvm-sh/nvm) — project uses v24)
- **MongoDB** running locally on port 27017
- **npm** (comes with Node)

To verify:
```bash
node -v        # should be v18+
mongod --version
```

---

## First-Time Setup

### 1. Install all dependencies
From the project root:
```bash
npm run install:all
```
This installs packages for root, `/server`, and `/client` in one command.

### 2. Create the server environment file
Create `/server/.env` with the following content:
```
MONGO_URI=mongodb://localhost:27017/gigbag
PORT=4000
JWT_SECRET=gigbag_dev_secret_2026
```

### 3. Seed the database
```bash
npm run seed
```
This creates all collections (Users, Gigs, Applications, Contracts, Conversations, Messages) with Philippine-flavored sample data.

---

## Running the App

From the **project root**, run a single command:
```bash
npm run dev
```
This uses `concurrently` to start both the server and client simultaneously.

| Service | URL |
|---------|-----|
| Client (Vite) | http://localhost:5173 |
| Server (Express) | http://localhost:4000 |

---

## Testing on a Real Phone (Mobile)

The app is mobile-first and can be tested on real devices over your local network.

1. Run `npm run dev` — look for the **Network** URL in the terminal:
   ```
   ➜  Network: http://192.168.x.x:5173/
   ```
2. Make sure your phone is on the **same Wi-Fi** as your Mac.
3. Open that URL in your phone's browser (Safari or Chrome).

> The server's CORS is configured to allow all local network addresses (192.168.x.x, 10.x.x.x, etc.), so API calls from your phone work automatically.

---

## Demo / Test Accounts

The seed script creates two primary test accounts. On the **Login page**, tap either account card to auto-fill the credentials.

| Role | Name | Email | Password |
|------|------|-------|----------|
| Event Planner | Maria Santos | maria@skydeck.com.ph | password123 |
| Musician | Carlo Reyes | carlo@gigbag.ph | password123 |

---

## Re-Seeding the Database

If you want to wipe and reset all data to the seeded defaults:
```bash
npm run seed
```
⚠️ This **deletes all existing data** and recreates from scratch.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `EPERM: uv_cwd` error | Open a **new terminal window** and navigate to the project folder again |
| `concurrently: command not found` | Run `npm install` from the project root |
| Server crashes — MongoDB URI undefined | Make sure `server/.env` exists with `MONGO_URI` set |
| `Invalid credentials` on login | Run `npm run seed` to populate the database |
| Phone can't reach the API | Both devices must be on the same Wi-Fi network |
| Network URL not showing in Vite | Restart `npm run dev` — `host: true` is set in `vite.config.js` |

---

## Project Structure

```
GigBuddy/
├── server/                 # Node.js + Express API (port 4000)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST route handlers + /api/auth
│   ├── index.js            # Entry point, Socket.io, CORS
│   ├── seed.js             # Database seeder
│   └── .env                # Local env vars (not committed)
├── client/                 # React + Vite + Tailwind CSS v4 (port 5173)
│   ├── src/
│   │   ├── api/            # Fetch wrappers per resource
│   │   ├── components/     # All UI components
│   │   ├── context/        # AuthContext (JWT Phase 2)
│   │   └── App.jsx         # Root — routing, socket.io, state
│   ├── vite.config.js      # host: true for LAN testing
│   └── index.html          # Mobile meta tags
├── agents.md               # AI agent master prompt
├── brd.md                  # Business requirements document
├── how2run.md              # This file
└── package.json            # Root — concurrently dev scripts
```