# Job Application Tracker

A full-stack web app for tracking job applications and interviews during a job search.

**Demo credentials:** username: `demoUser` · password: `Passw0rd!` _(available once deployed)_

---

## Tech Stack

**Backend:** Node.js · Express 5 · TypeScript · PostgreSQL  
**Frontend:** React 19 · React Router 7 · TypeScript · Vite  
**Auth:** JWT · bcrypt

---

## Technical Decisions

### React Compiler (client)

The client uses the React 19 compiler, which handles memoization automatically. Manual use of `useMemo` and `useCallback` is therefore generally unnecessary and has been omitted — their absence is intentional, not an oversight.

### JWT Strategy

Two choices here differ from common production patterns, both accepted as complexity tradeoffs given the project's scope:

- **Token duration:** Tokens are issued with a day-long expiry rather than a short lifespan backed by a refresh token. A refresh token flow adds meaningful implementation surface (rotation, storage, race conditions) that isn't warranted at this scale.
- **Logout:** Logout clears the client-side cookie rather than blacklisting the token server-side. True token invalidation requires a shared revocation store (e.g., Redis), which is out of scope here. The day-long expiry limits the practical exposure window.

---

## API

All position routes require `Authorization: Bearer <token>` obtained from `POST /auth/login`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Returns JWT |
| POST | `/auth/logout` | Invalidates session |
| POST | `/users/:userId/positions` | Add position |
| GET | `/users/:userId/positions/:positionId` | Get position |
| PUT | `/users/:userId/positions/:positionId` | Replace position |
| PATCH | `/users/:userId/positions/:positionId` | Update fields |
| DELETE | `/users/:userId/positions/:positionId` | Remove position |

---

## Local Setup

### Prerequisites
- Node.js 20+
- A PostgreSQL 17 database (project was built against [Neon](https://neon.tech))

### Connection String Note

Due to how PostgreSQL search path resolution works, the `DATABASE_URL` in both `migrations/.env` and `server/.env` **must specify the search path explicitly** and **must not use a pooled connection**. Append `&options=--search_path%3Dpublic` to your connection string and use the direct (non-pooled) URL from your Neon dashboard.

### Setup

```bash
git clone https://github.com/Schommer475/job-applications.git
cd job-applications

# Install dependencies
cd migrations && npm install
cd ../server && npm install
```

Rename `.env.example` → `.env` in both `migrations/` and `server/`, then fill in your values.

```bash
# Initialize the database (from migrations/)
cd migrations
npm run init           # full setup: schema + demo user
# or run separately:
npm run init:database
npm run init:user

# Start the server (from server/)
cd ../server
npm run launch         # build + start
```

> **Note:** The migration scripts have not been re-validated against the latest schema. If `npm run init` fails, run `init:database` and `init:user` separately to isolate the issue.

> **Note:** The frontend is not yet functional — client development is in progress.

---

## Project Structure

```
job-applications/
├── client/          # React + TypeScript (Vite) — in progress
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── api/
│       └── types/
├── migrations/      # DB schema + user initialization
├── server/          # Express + TypeScript
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── db/
│       └── middleware/
```

---

## Roadmap

- [ ] List positions endpoint with filtering
- [ ] Statuses endpoint
- [ ] PATCH endpoint implementation
- [ ] Frontend: connect to API, build out views
- [ ] Caching on read endpoints
