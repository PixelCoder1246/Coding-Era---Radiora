# Radiora — Backend

Node.js/Express API server powering the Radiora clinical workflow. Handles authentication, case management, PACS polling, HIS integration, and AI callbacks.

---

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (HTTP-only cookies)
- **PACS**: Orthanc REST API integration
- **Email**: SendGrid (optional, for notifications)

---

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/radiora"
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000

# Optional: AI inference service
AI_BASE_URL=http://localhost:8000

# Optional: Email notifications
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Set up the database

```bash
npm run prisma:migrate
# Applies all migrations and generates the Prisma client
```

### 4. Start the server

```bash
npm run dev
# Development mode with hot reload — http://localhost:3000
```

---

## Key API Routes

| Method | Route                             | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| `POST` | `/api/auth/register`              | Create admin account              |
| `POST` | `/api/auth/login`                 | Login (returns JWT cookie)        |
| `GET`  | `/api/cases`                      | List all cases for the admin      |
| `POST` | `/api/integrations/pacs`          | Save PACS (Orthanc) config        |
| `POST` | `/api/integrations/pacs/activate` | Start polling Orthanc             |
| `POST` | `/api/integrations/his`           | Save HIS config                   |
| `POST` | `/api/integrations/his/activate`  | Activate HIS connectivity         |
| `GET`  | `/api/pacs/studies`               | List studies currently in Orthanc |
| `POST` | `/api/cases/:id/report`           | Doctor submits a report           |
| `POST` | `/api/cases/:id/ai-result`        | AI service posts back results     |

---

## PACS Polling

Once PACS is activated via the admin dashboard:

1. The server polls Orthanc every N seconds (configurable per admin).
2. Each new study is matched to a HIS order via `AccessionNumber`.
3. A case is created and auto-assigned to an available doctor.
4. AI analysis is triggered if `AI_BASE_URL` is set.

> **Note:** Both HIS and PACS must be active for polling to create cases.

---

## Scripts

| Script                    | Description                     |
| ------------------------- | ------------------------------- |
| `npm run dev`             | Start with nodemon (hot reload) |
| `npm start`               | Start in production mode        |
| `npm run prisma:migrate`  | Run DB migrations               |
| `npm run prisma:generate` | Regenerate Prisma client        |
| `npm run lint`            | Run ESLint                      |
| `npm run format`          | Run Prettier                    |
