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
      admin/            ← Admin: doctor creation, listing, deletion, password reset
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

### Admin

| Method | Route | Access |
|---|---|---|
| `POST`  | `/api/admin/doctors` | Admin |
| `GET`   | `/api/admin/doctors` | Admin |
| `DELETE` | `/api/admin/doctors/:doctorId` | Admin |
| `PATCH` | `/api/admin/doctors/:doctorId/reset-password` | Admin |

### Integrations — full config retrieval

| Method | Route | Access |
|---|---|---|
| `GET` | `/api/integrations/pacs` | Admin |
| `GET` | `/api/integrations/his` | Admin |

### Cases

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/cases/:caseId/report` | Doctor |
| `PATCH` | `/api/cases/:caseId/status` | Admin / Doctor |
| `POST` | `/api/cases/:caseId/resend-notification` | Doctor |
| `POST` | `/api/cases/:caseId/ai-result` | Public (AI callback) |

### Patient Portal

| Method | Route | Access |
|---|---|---|
| `GET` | `/api/portal/report/:token` | Public |

---

## Notes

- **PACS** uses [Orthanc](https://www.orthanc-server.com/) which must be running locally for activation to succeed.
- **HIS** is a mock service — activation points to a separately running HIS process.
- Activation endpoints make a live HTTP request to validate connectivity before marking an integration as active.
- Deleting a doctor is blocked (`409`) if they have submitted reports — medical records are permanent.

---

## Version

**Current Version: 0.3.5**
