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
- Activation timestamp filter — only post-activation studies are processed
- PACS viewer URL construction per case
- Case management endpoints (list, get, assign doctor)
- Polling auto-starts on server boot if PACS is active

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
      cases/            ← Case listing, detail, and assignment
      his/              ← HIS proxy (create patient, create order)
      pacs/             ← PACS upload (stream DICOM to Orthanc)

    middleware/
      auth.middleware.js ← Bearer token verification + requireRole guard

    utils/
      jwt.js            ← signToken / verifyToken helpers

    services/
      polling.service.js ← PACS polling loop, HIS matching, case creation

  prisma/
    schema.prisma       ← DB schema (User, Integration, Case, ProcessedStudy)
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

---

## Notes

- **PACS** uses [Orthanc](https://www.orthanc-server.com/) which must be running locally for activation to succeed.
- **HIS** is a mock service — activation points to a separately running HIS process.
- Activation endpoints make a live HTTP request to validate connectivity before marking an integration as active.
- Polling, case logic are **implemented in Phase 2**. AI integration and report handling are **not included yet**.

---

## Version

**Current Version: 0.2.0**
