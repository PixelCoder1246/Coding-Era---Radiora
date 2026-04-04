# Radiora Backend

The backend service for **Radiora** — a medical imaging workflow platform. It handles authentication, integration configuration, and system orchestration for connecting PACS (Orthanc), HIS, and the frontend application.

---

## Tech Stack

| Tool                 | Purpose                        |
| -------------------- | ------------------------------ |
| Node.js + Express.js | HTTP server and routing        |
| PostgreSQL           | Primary database               |
| Prisma ORM           | Database access and migrations |
| JWT                  | Stateless authentication       |
| bcrypt               | Password hashing               |

---

## Features (Phase 1)

- User authentication for Admin and Doctor roles
- JWT-based authorization with role-based access control
- PACS integration configuration storage
- HIS integration configuration storage
- Integration activation with live connectivity validation
- Secure route protection via auth middleware
- **Code quality:** ESLint + Prettier setup for consistent linting and formatting

## Features (Phase 2)

- Automatic PACS polling with configurable interval
- Study metadata extraction from Orthanc
- HIS order matching by `accessionNumber`
- Automatic `Case` creation on successful match
- Deduplication via `ProcessedStudy` — each study processed exactly once
- PACS viewer URL construction per case
- Case management endpoints (list, get, assign doctor)
- Polling auto-starts on server boot if PACS is active

## Features (Phase 3)

- Admin doctor creation via `POST /api/admin/doctors` — auto-generates password + configurable capacity
- Admin doctor list via `GET /api/admin/doctors` — returns only this admin's doctors
- Auto-assignment: cases assigned to least-loaded eligible doctor on creation
- Patient contact storage: `patientEmail` and `patientPhone` pulled from HIS and stored on `Case`
- Doctor report submission: `POST /api/cases/:caseId/report`
- Report access token: unique token generated per report
- Patient email notification via SendGrid on report submission
- WhatsApp notification simulated via log
- AI trigger: non-blocking `POST {AI_BASE_URL}/analyze` with `callbackUrl`
- AI callback: `POST /api/cases/:caseId/ai-result` stores findings, confidence, and bounding box annotations
- Patient portal: `GET /api/portal/report/:token` — public, no auth required
- Auth status: `GET /api/auth/status` — returns current user identity + `adminId` for frontend auth checks
- **Multi-tenancy**: each admin is a fully isolated organization; data scoped by `adminId` across `Integration`, `Case`, `ProcessedStudy`; doctors bound to their admin via `createdByAdminId`; polling spawns one interval per admin; `adminId` embedded in JWT payload

## Fixes & Patches (v0.3.1)

- **Polling crash recovery**: `ProcessedStudy` marker saved before `Case` creation — prevents crash-retry loop on mid-poll server restart
- **`USE_FALLBACK_ACCESSION` env flag**: `true` = allow DICOMs with no `AccessionNumber` to use `FALLBACK_ACCESSION_NUMBER`; `false` (production default) = skip such DICOMs entirely

## Fixes & Patches (v0.3.2)

- **Portal response refactored**: `GET /api/portal/report/:token` now returns `orthancBaseUrl`, `orthancId`, and `studyInstanceUID` — frontend builds the viewer URL it needs
- **AI trigger fixed**: `orthancUrl` now included in AI payload so AI server knows which admin's PACS to connect to
- **Root `docs/` updated**: `docs/api.md` and `docs/workflow.md` fully rewritten to match current backend — correct endpoints, roles, multi-tenancy, portal response shape, AI payload, and system flowchart

## Fixes & Patches (v0.3.3)

- **Status Updates**: New `PATCH /api/cases/:id/status` endpoint for `IN_REVIEW` tracking
- **Resend Notification**: New endpoint for doctors to resend patient report links
- **Frontend Portal Links**: Emails now point to the correct frontend UI instead of backend API
- **Stability**: Hardened polling service to prevent crashes on connection timeouts or PACS errors
- **Terminal Cleanup**: Removed redundant WhatsApp console logs

---

## Project Structure

```
backend/
  src/
    app.js              ← Express app: middleware, routes, error handlers
    server.js           ← Entry point: DB connect → listen

    config/
      db.js             ← Prisma client singleton

    modules/
      auth/             ← Register, login, JWT issuance
      integration/      ← PACS + HIS config and activation
      cases/            ← Case listing, detail, assignment, AI callback
      his/              ← HIS proxy (create patient, create order)
      pacs/             ← PACS upload (stream DICOM to Orthanc)
      admin/            ← Admin: doctor creation
      report/           ← Doctor report submission
      portal/           ← Public patient portal (token-based report access)

    middleware/
      auth.middleware.js ← Bearer token verification + requireRole guard

    utils/
      jwt.js            ← signToken / verifyToken helpers
      ai.js             ← non-blocking AI trigger with orthancUrl forwarding
      email.js          ← SendGrid email sender

    services/
      polling.service.js  ← per-admin PACS polling, HIS matching, case creation
      assignment.service.js ← least-loaded doctor auto-assignment

  prisma/
    schema.prisma       ← DB schema (User, Integration, Case, ProcessedStudy, Report, AiResult)

  docs/
    api.md              ← Full API reference (endpoints, workflows, env vars)
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Fill in `.env` with your values:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/radiora
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000

# SendGrid (Phase 3 — email notifications)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@radiora.app

# AI Service (Phase 3 — optional)
AI_BASE_URL=
```

### 3. Run database migration

```bash
npx prisma migrate dev --name init
```

### 4. Start dev server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

---

## API Endpoints (Phase 1)

### Auth

| Method | Route                | Access |
| ------ | -------------------- | ------ |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login`    | Public |

### Integrations

| Method | Route                             | Access        |
| ------ | --------------------------------- | ------------- |
| `POST` | `/api/integrations/pacs`          | Admin         |
| `POST` | `/api/integrations/his`           | Admin         |
| `GET`  | `/api/integrations/status`        | Authenticated |
| `POST` | `/api/integrations/pacs/activate` | Admin         |
| `POST` | `/api/integrations/his/activate`  | Admin         |

### Health

| Method | Route     | Access |
| ------ | --------- | ------ |
| `GET`  | `/health` | Public |

### Cases

| Method | Route | Access |
|---|---|---|
| `GET` | `/api/cases` | Authenticated |
| `GET` | `/api/cases/:caseId` | Authenticated |
| `POST` | `/api/cases/:caseId/assign` | Admin |

### HIS Proxy (Demo/Testing)

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/his/patients` | Public |
| `POST` | `/api/his/orders` | Public |

### PACS Upload (Demo/Testing)

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/pacs/upload` | Public |

### Admin (Phase 3)

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/admin/doctors` | Admin |

### Cases — Phase 3 additions

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/cases/:caseId/report` | Doctor |
| `POST` | `/api/cases/:caseId/ai-result` | Public (AI callback) |

### Patient Portal (Phase 3)

| Method | Route | Access |
|---|---|---|
| `GET` | `/api/portal/report/:token` | Public |

---

## Notes

- **PACS** uses [Orthanc](https://www.orthanc-server.com/) which must be running locally for activation to succeed.
- **HIS** is a mock service — activation points to a separately running HIS process.
- Activation endpoints make a live HTTP request to validate connectivity before marking an integration as active.
- Polling, case logic are **implemented in Phase 2**. AI integration and report handling are **not included yet**.

---

## Version

**Current Version: 0.3.0**
