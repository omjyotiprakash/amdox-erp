# AMDox ERP Backend

Express 5 + MongoDB (Mongoose). JWT auth, bcrypt password hashing, server-side role permissions.

## Run

```bash
cp .env.example .env     # set JWT_SECRET; MongoDB must be running (or use Atlas via MONGODB_URI)
npm install
npm run dev              # http://localhost:5000
npm test                 # integration tests (in-memory MongoDB, no setup needed)
```

## Auth API (`/api`)

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | no | First account becomes Admin; later ones are Employee |
| POST | `/auth/login` | no | Returns `{ user, token }` |
| GET | `/auth/me` | Bearer token | Current user with role and permissions |
| GET | `/health` | no | Liveness check |

Responses are `{ success, data }` or `{ success: false, message, details? }`.

## Protecting a route

```js
const { authenticate, authorize } = require("../middleware/auth.middleware");
router.post("/", authenticate, authorize("finance", "create"), controller.create);
```

Modules: `dashboard, finance, hr, supplyChain, projects, reports, settings`.
Actions: `view, create, edit, delete`. Default roles (Admin, Manager, Employee) are seeded on startup.
