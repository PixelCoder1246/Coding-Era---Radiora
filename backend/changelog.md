# Changelog

All notable changes to the Radiora-backend will be documented here.

---

## [0.1.1] - 2026-03-19

### Added

- ESLint (v10) setup with Flat Config (`eslint.config.js`)
- Prettier setup for consistent code formatting
- `npm run lint` and `npm run format` scripts
- Automatic formatting with `lint:fix`
- Configured ESLint to ignore unused variables starting with `_` (useful for Express middleware)
- Added `package-lock.json` to ignore lists for linting and formatting

## [0.1.0] - 2026-03-19

### Added

- Express server setup with modular feature-based architecture
- Prisma ORM with PostgreSQL integration (User + Integration models)
- User authentication — register and login endpoints
- JWT-based authorization system (sign + verify)
- Auth middleware with role-based access control (`requireRole`)
- Integration module — PACS configuration storage
- Integration module — HIS configuration storage
- Integration activation endpoints with live connectivity validation
- `activatedAt` timestamp recorded on successful integration activation
- Environment configuration support via `.env`
- Graceful server shutdown on SIGINT
- `/health` endpoint for liveness checks

### Notes

- No polling or study ingestion logic implemented in this phase
- Case, Report, AiResult, and ProcessedStudy models not yet added
- AI integration not included in this phase
- HIS mock service not yet implemented (to be added separately)

---

## [0.0.0] - 2026-03-19

### Added

- Initial project repository and folder structure
- Full system documentation (`/docs`):
  - `overview.md` — project summary, problem statement, constraints
  - `architecture.md` — service breakdown, Mermaid architecture diagram
  - `api.md` — all planned API endpoints with request/response examples
  - `database.md` — schema design, ER diagram, Prisma reference
  - `workflow.md` — end-to-end system workflow with Mermaid flowchart
  - `integrations.md` — PACS/Orthanc, HIS mock, polling, deduplication logic

### Notes

- No code implemented at this stage
- Documentation serves as the implementation blueprint for all subsequent phases
- Case, Report, AiResult, and ProcessedStudy models not yet added
- AI integration not included in this phase
- HIS mock service not yet implemented (to be added separately)
