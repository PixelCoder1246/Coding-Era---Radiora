# Changelog

All notable changes to the Radiora-backend will be documented here.

---

## [0.3.0] - 2026-03-23

### Added
- `POST /api/admin/doctors` — ADMIN creates doctors with auto-generated password and configurable `maxConcurrentCases`
- `GET /api/admin/doctors` — ADMIN lists their own doctors only
- Auto-assignment service: newly created cases are automatically assigned to the least-loaded eligible doctor
- `patientEmail` and `patientPhone` fields on `Case` — extracted from HIS patient record during polling
- `POST /api/his/patients` now accepts `email` and `phone`, forwarded to HIS and stored
- `Report` model: doctor submits report via `POST /api/cases/:caseId/report` (DOCTOR only)
- `AiResult` model: AI service posts results to `POST /api/cases/:caseId/ai-result` (public callback)
- `GET /api/portal/report/:token` — public patient portal returns report by access token
- `GET /api/auth/status` — returns current user identity + `adminId` from JWT (for frontend auth checks)
- SendGrid email notification sent to patient when report is submitted
- WhatsApp notification simulated via `console.log` when `patientPhone` is present
- `src/utils/ai.js` — non-blocking AI trigger with `callbackUrl` support
- `src/utils/email.js` — SendGrid email utility
- `src/services/assignment.service.js` — auto-assignment logic
- `@sendgrid/mail` dependency
- **Multi-tenancy**: each admin is a fully isolated organization
  - `adminId` added to `Integration`, `Case`, `ProcessedStudy` — all data scoped per admin
  - `createdByAdminId` added to `User` — doctors bound to the admin who created them
  - `Integration` unique constraint changed from `type` to `[adminId, type]` — each admin has their own PACS + HIS config
  - `ProcessedStudy` unique constraint changed to `[adminId, studyInstanceUID]` — dedup is per admin
  - `adminId` embedded in JWT payload — `ADMIN` token has `adminId = userId`; `DOCTOR` token has `adminId = createdByAdminId`
  - Polling spawns one interval per active admin — fully isolated cycles
  - `POST /api/his/patients`, `POST /api/his/orders`, `POST /api/pacs/upload` now require authentication

### Changed
- `getCaseById` now includes `aiResult` and `report` in response
- Polling service extracts `patientEmail` and `patientPhone` from HIS and auto-assigns doctor after case creation
- All integration, case, and doctor queries scoped by `adminId` — complete org isolation
- `integration.service.js` upserts by `[adminId, type]` instead of `type` alone

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
