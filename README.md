# AMDox ERP

A full-stack enterprise resource planning system: finance, HR, supply chain, projects, reporting and
administration in one web app.

- **Frontend:** React 19, Vite, Tailwind CSS, React Router (`frontend/`)
- **Backend:** Node.js, Express 5, MongoDB with Mongoose (`backend/`)
- **Auth:** JWT sessions, bcrypt password hashing, role-based permissions enforced on the server
- **Tests:** 49 backend integration tests and 33 frontend tests, run automatically on every pull request

## Modules

| Module | What it does |
|---|---|
| Dashboard | Live figures and a "needs attention" list, limited to what your role may see |
| Finance | General ledger, accounts payable and receivable (overdue worked out from due dates), monthly reports with CSV export |
| Human Resources | Employee directory, daily attendance, leave requests with approval, monthly payroll |
| Supply Chain | Inventory with stock status, vendors, purchase orders with a forward-only status flow, rule-based demand forecast |
| Projects | Projects with budgets and milestones, resource planning that caps each person at 100% |
| Settings | Company settings, integrations, roles and permissions, user accounts, audit log |

## Run it locally

You need Node.js 22+ and a MongoDB database (a free MongoDB Atlas cluster works).

```bash
# 1. Backend
cd backend
cp .env.example .env        # set MONGODB_URI and JWT_SECRET
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

Open the app and register. **The first account created becomes the Admin.** Everyone after that is
created by an Admin under Settings > User Management.

## Tests

```bash
cd backend  && npm test     # API tests against a temporary in-memory MongoDB, nothing to set up
cd frontend && npm test     # component, hook and API-client tests
```

## Deployment

| Part | Where | Notes |
|---|---|---|
| Frontend | Vercel, root directory `frontend` | Set `VITE_API_URL` to `https://<your-backend>/api` and redeploy |
| Backend | Render, root directory `backend`, start command `npm start` | Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS` (the frontend URL, no trailing slash) |
| Database | MongoDB Atlas | Add the backend's address to the IP Access List |

Production settings that matter:

- `JWT_SECRET` must be a long random value (the server refuses to start in production without one).
- `TRUST_PROXY` defaults to `1` in production so rate limits and the audit log see each visitor's real
  IP behind Render's proxy.
- Render's free plan sleeps after about 15 minutes idle, so the first request after a quiet period is
  slow. Pinging `https://<your-backend>/api/health` every 5 minutes (for example with UptimeRobot) keeps it awake.

## Backups

The free Atlas tier has no automatic backups. From `backend/`:

```bash
npm run backup                          # saves every collection to backups/<timestamp>/
npm run restore -- backups/<folder>     # loads a backup into EMPTY collections only
npm run restore -- backups/<folder> --replace --yes   # overwrites existing data
```

Backups contain real data and are git-ignored. Store them somewhere private.

## Security notes

- Permissions are checked on the server for every request; hiding a menu link is only a convenience.
- Changing or resetting a password signs out that user's other sessions.
- Login and registration are rate limited. The audit log records who created, changed or deleted
  records, never the data itself.
- The login token is kept in the browser's localStorage. That is simple and works across the Vercel and
  Render domains, but it can be read by injected scripts. Moving to httpOnly cookies needs the frontend
  and backend on the same site (or a shared parent domain), because browsers increasingly block
  cross-site cookies.

## Known limitations

- Integrations only record that a service is switched on; nothing is exchanged with the provider.
- No email is sent (there is no "forgot password" email). An Admin can reset a user's password.
- Forecasting is a rule-based projection (monthly demand x expected growth), not machine learning.
- Money is stored as numbers rounded to 2 decimals in a single currency (INR formatting).

## Project layout

```
backend/    routes -> controllers -> services -> models (+ middleware, utils, scripts, tests)
frontend/   pages, components, hooks, services (API calls), context (auth, notifications), utils
.github/    CI workflow
```
