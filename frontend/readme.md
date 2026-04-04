# Radiora Frontend

The frontend application for **Radiora** — a medical imaging workflow platform. It provides the user interface for doctors and administrators to interact with PACS, HIS, and AI insights.

---

## Tech Stack

| Tool                 | Purpose                     |
| -------------------- | --------------------------- |
| Next.js (App Router) | React framework and routing |
| React 19             | UI Library                  |
| TypeScript           | Static typing               |
| CSS Modules          | Component-scoped styling    |
| Lucide React         | Iconography                 |
| ESLint + Prettier    | Code quality and formatting |

---

## Features (Phase 1 - Completed)

- **Authentication Layer**: Centralized middleware-based route protection and JWT validation.
- **Admin Dashboard**: Comprehensive workspace for managing clinicians and platform integrations.
- **Premium UI**: Custom-designed landing page with glassmorphism, curvy borders, and responsive layouts.
- **Integration Hub**: Real-time status tracking and configuration for HIS and PACS systems.
- **Modular Styling**: 100% CSS Modules architecture for clean, component-scoped styles.
- **SEO Ready**: Comprehensive metadata, OpenGraph tags, and semantic HTML optimization.
- **Rich Content**: Dedicated Features, About, and 10+ informational subpages.

---

## Project Structure

```
frontend/
  src/
    app/                ← Next.js App Router
      (marketing)/      ← Route group for platform, resources, and legal pages
      globals.css       ← Design system variables and global resets
    components/         ← Reusable UI (Navbar, Hero, Footer, ContentSection)
    public/             ← Static assets (images, fonts, etc.)

  public/               ← Static assets (images, fonts, etc.)

  eslint.config.mjs     ← ESLint Flat config
  .prettierrc           ← Prettier config
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

_(Environment variables configuration to be added when backend connection is established)_

### 3. Start dev server

```bash
npm run dev
# or with alias
npm run frontend
```

Server starts at `http://localhost:3000`.

---

## Formatting & Linting

```bash
# Run the linter
npm run lint

# Auto-fix linting errors (if configured in package.json)
npm run lint:fix
```

---

## Notes

- Backend connectivity is established for authentication and status checks.
- Middleware handles route-level security for `/admin` and `/auth`.
- Integration settings (HIS/PACS) are functional and persistent.

---

## Version

**Current Version: 0.3.0**
