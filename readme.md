# Radiora — Clinical Imaging Workstation

> An AI-powered medical imaging workflow platform that connects PACS (Orthanc), HIS, and diagnostic doctors in a seamless, real-time clinical pipeline.

Radiora automates the end-to-end radiology workflow: DICOM studies arrive in Orthanc → the backend polls and creates cases → doctors are auto-assigned → AI analysis is triggered → a doctor reviews and submits a report.

---

## What It Does

- **Auto Case Creation** — Polls Orthanc (PACS) in real time, links studies to HIS orders via AccessionNumber, and creates structured cases automatically
- **Doctor Assignment** — Cases are routed to available doctors based on concurrent case load
- **AI Analysis** — Async inference runs on each study; findings appear directly in the doctor workstation
- **DICOM Viewer** — Embedded Orthanc Stone Web Viewer for in-browser image viewing
- **Report System** — Doctors submit structured findings; admins track case lifecycle end-to-end
- **Multi-Tenant** — Each admin account is fully isolated with its own doctors, config, and data

---

## Actual Project Structure

```
Radiora/
├── backend/          — Node.js/Express API + Prisma ORM + polling service
├── frontend/         — Next.js 15 clinical workstation UI
├── ai_service/       — Python FastAPI AI inference server (PyTorch + DICOM)
├── services/         — Dockerised infrastructure: Orthanc PACS + HIS mock
│   ├── HIS/          — Mock Hospital Information System (Node.js)
│   ├── Orthanc/      — Orthanc config (orthanc.json)
│   ├── Proxy/        — Nginx reverse proxy configs
│   └── docker-compose.yml
└── .github/          — CI/CD workflows
```

→ See [`backend/README.md`](./backend/README.md) for backend setup  
→ See [`frontend/README.md`](./frontend/README.md) for frontend setup  
→ See [`ai_service/readme.md`](./ai_service/readme.md) for AI service setup

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.9+ (for AI service)
- **PostgreSQL** database (local or cloud e.g. Supabase, Neon)
- **Docker** (to run Orthanc PACS + HIS via `services/`)

---

## Local Setup

### Step 1 — Clone the repo

```bash
git clone https://github.com/your-org/radiora.git
cd radiora
```

### Step 2 — Start infrastructure (Orthanc + HIS)

```bash
cd services
docker compose up -d
```

This starts:
- **Orthanc** PACS at `http://localhost:8042` (login: `demo` / `demo`)
- **HIS** mock service at `http://localhost:3010`

### Step 3 — Set up and start the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000

# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/radiora"

# JWT
JWT_SECRET=any_long_random_secret
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000

# AI service (optional, leave blank to disable AI)
AI_BASE_URL=http://localhost:8000

# Email notifications (optional)
SENDGRID_API_KEY=
EMAIL_FROM=
```

Then run:

```bash
npm install
npm run prisma:migrate     # creates all DB tables
npm run dev                # starts on http://localhost:3000
```

### Step 4 — Set up and start the Frontend

```bash
cd frontend
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Then run:

```bash
npm install
npm run frontend           # starts on http://localhost:3001
```

### Step 5 — (Optional) Start the AI Service

```bash
cd ai_service
pip install -r requirements.txt
python server.py           # starts on http://localhost:8000
```

Set `AI_BASE_URL=http://localhost:8000` in `backend/.env` to enable AI analysis.

---

## Evaluation Credentials

These accounts are pre-registered in the hosted environment. Use them to log in and explore the full workflow:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `70001933arin@gmail.com` | `123456` |
| **Doctor** | `cs2022299@global.org.in` | `cb5b35adf59f` |

> You can also use the one-click credential presets on the Login page — click either card and the form auto-fills.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Node.js, Express, Prisma 5, PostgreSQL |
| PACS | Orthanc (DICOM server + Stone Web Viewer) |
| HIS | Mock Node.js HIS service (Dockerised) |
| AI | Python FastAPI, PyTorch, pydicom |
| Infra | Docker Compose, Nginx reverse proxy |

---

## Version

`v0.3.7` — See [`backend/changelog.md`](./backend/changelog.md) for full history.
