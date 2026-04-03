# Changelog

All notable changes to the Radiora-backend will be documented here.

---

## [0.2.0] - 2026-03-20

### Added
- HIS proxy module: `POST /api/his/patients` and `POST /api/his/orders` (**public** — no auth required)
- PACS upload module: `POST /api/pacs/upload` — streams DICOM files to Orthanc (**public**)
- `multer` for multipart file handling; `form-data` for Orthanc streaming
- Both modules read integration config from DB and validate active status before request
- Automatic PACS polling via `src/services/polling.service.js`
- Polls Orthanc every `pollIntervalSeconds` (default 30s) if PACS is active
- Extracts DICOM metadata: `studyInstanceUID`, `accessionNumber`, `patientId`, `modality`, `studyDate`, `bodyPart`
- HIS order matching by `accessionNumber` — retries on miss (no DB write)
- Patient name resolution via HIS `/patients/:id`
- `Case` model with full state tracking (`UNASSIGNED → PENDING_REVIEW → IN_REVIEW → COMPLETED`)
- Deduplication via `ProcessedStudy` — each study is processed exactly once
- Graceful error handling — PACS/HIS failures logged, polling never crashes server
- Polling starts automatically on server boot if PACS is active
- `stopPolling()` called on graceful shutdown (SIGINT)
- Case module: `GET /api/cases`, `GET /api/cases/:caseId`, `POST /api/cases/:caseId/assign`
- `pacsViewerUrl` constructed per case from Orthanc ID
- `CaseStatus` enum: `UNASSIGNED | PENDING_REVIEW | IN_REVIEW | COMPLETED`
- `AiStatus` enum: `NOT_REQUESTED | PROCESSING | COMPLETED | FAILED`



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
