# AMDox ERP Backend

Express 5 + MongoDB (Mongoose). JWT auth, bcrypt password hashing, and role permissions enforced on the server.

## Run

```bash
cp .env.example .env     # set MONGODB_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000
npm test                 # integration tests (in-memory MongoDB, no setup needed)
```

## API overview (all under `/api`)

Responses are `{ success, data }` or `{ success: false, message, details? }`.
Every route except `/health`, `/auth/register` and `/auth/login` needs `Authorization: Bearer <token>`.

| Area | Routes | Permission module |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | none (login) |
| Finance | `/finance/ledger`, `/finance/payables`, `/finance/receivables` | `finance` |
| Reports | `GET /finance/reports/summary` | `reports` |
| HR | `/hr/employees`, `/hr/attendance`, `/hr/leave`, `/hr/payroll` | `hr` |
| Supply chain | `/supply-chain/inventory`, `/vendors`, `/purchase-orders`, `/forecasting` | `supplyChain` |
| Projects | `/projects`, `/projects/:id/milestones`, `/projects/resources` | `projects` |
| Dashboard | `GET /dashboard/summary` | any signed-in user (filtered by role) |
| Notifications | `GET /notifications` | any signed-in user (filtered by role) |
| Self-service | `/me/profile`, `/me/attendance`, `/me/leave`, `/me/payslips` | any signed-in user (own record only) |
| Settings | `/settings/general`, `/settings/integrations`, `/settings/roles`, `/settings/users` | `settings` |

The first account registered becomes Admin and sign-up then closes (`GET /auth/registration` reports whether it is open).
Admins create further users and manage roles under Settings. A login is linked to its HR employee record by matching email.

## Protecting a route

```js
const { authenticate, authorize } = require("../middleware/auth.middleware");
router.post("/", authenticate, authorize("finance", "create"), controller.create);
```

Modules: `dashboard, finance, hr, supplyChain, projects, reports, settings`.
Actions: `view, create, edit, delete`. Built-in roles (Admin, Manager, Employee) are seeded on startup;
the Admin role always has full access. Roles are read on every request, so permission changes apply immediately.

## Code layout

`routes` (URLs + validation + permission) -> `controllers` (HTTP) -> `services` (business rules) -> `models` (MongoDB).
Shared helpers live in `src/utils`.

## Notes

- Dashboard figures and notifications are worked out from live data; nothing is cached or stored.
- Integrations only record that a service is switched on. No credentials are stored.
- Forecasting is rule-based (monthly demand x expected growth), not machine learning.
