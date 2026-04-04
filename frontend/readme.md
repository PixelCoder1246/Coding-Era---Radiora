# Radiora — Frontend

Next.js 15 clinical workstation interface for the Radiora medical imaging platform. Provides interfaces for Admin orchestration and Doctor diagnostic workflows.

---

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Lucide Icons, Vanilla CSS Modules
- **Auth**: JWT via HTTP-only cookies (server actions)
- **DICOM Viewer**: Orthanc Stone Web Viewer (embedded iframe)

---

## Local Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

> If `.env.example` doesn't exist, create `.env.local` manually:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

This tells the frontend where the backend API is running.

### 3. Start the dev server

```bash
npm run frontend
# Runs on http://localhost:3001
```

---

## Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing / homepage |
| `/auth/login` | Public | Login page with evaluation credential presets |
| `/auth/register` | Public | Admin account registration |
| `/admin/dashboard` | Admin | Full orchestration dashboard |
| `/doctor` | Doctor | Case list and assignment view |
| `/doctor/cases/[id]` | Doctor | Case detail with DICOM viewer and AI results |

---

## Admin Dashboard Features

- **Doctor Registry** — Register doctors with auto-generated credentials
- **PACS Config** — Connect and activate Orthanc integration with configurable poll interval
- **HIS Config** — Connect the Hospital Information System
- **Case Monitor** — View all cases, statuses, and assigned doctors
- **PACS Study Monitor** — See raw studies currently in Orthanc
- **Evaluation Panel** — Mock integration endpoints for demo/evaluation

## Doctor Workstation Features

- Case list with status badges and AI indicators
- DICOM image viewer (Orthanc Stone Web Viewer)
- AI analysis results panel
- Report submission form

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run frontend` | Start on port 3001 (recommended for local dev) |
| `npm run dev` | Start on default port 3000 |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

---

## Notes

- The frontend uses **Next.js Server Actions** for all API calls — no client-side fetch to the backend except where required.
- The DICOM viewer is loaded as an embedded iframe pointing at the configured Orthanc instance.
- Theme (dark/light) is toggled via the navbar and persists via a CSS class on `<html>`.
