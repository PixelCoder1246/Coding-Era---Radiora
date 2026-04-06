# Changelog

All notable changes to the Radiora-backend will be documented here.

---

## [0.3.8] - 2026-04-05

### Fixed

- **Polling Interval Hotreload**: `activatePacs` controller now calls `stopPolling()` followed by `startPolling()` immediately after PACS activation. Previously, updating `pollIntervalSeconds` in the UI had no effect because the original `setInterval` (set at server boot) was never cleared. Config changes now take effect the moment the admin clicks Activate.

---

## [0.3.7] - 2026-04-03

### Fixed

- **Deep Metadata Extraction**: Polling now fetches `BodyPartExamined` from the first DICOM series if study-level tags are missing in Orthanc.
- **HIS Metadata Fallback**: Implemented a robust fallback mechanism that uses HIS order details (modality/body part) when DICOM metadata is unavailable or incomplete.
- **Modality/BodyPart Normalization**: Improved handling of multi-value DICOM tags (e.g., dual modality scans) by automatically joining them with `/` for database consistency.

### Added

- **AI Service Configuration Documentation**: Clarified the use of `AI_BASE_URL` and `BACKEND_URL` for non-blocking analysis triggers.

---

## [0.3.6] - 2026-04-03

### Added

- **Unified Deployment Stack**: Consolidated HIS, Orthanc, and Nginx into a single `services/docker-compose.yml` for streamlined EC2 deployments.
- **Nginx Reverse Proxy**: Implemented hostname-based routing using `nip.io` virtual hosts (e.g., `his-ip.nip.io`). This allows multiple services on one IP with internal-only port security.
- **Advanced DICOM Upload**: Added support for `.zip` archive uploads with automatic recursive extraction and `AccessionNumber` injection into every slice.
- **HIS Dockerization**: Created a production-ready `Dockerfile` for the HIS service.

### Fixed

- **Stable Polling (Quiet Period)**: Implemented a 15-second "Stability Check" using Orthanc's `LastUpdate` metadata. This prevents the poller from creating "incomplete" cases while large studies are still uploading.

---

## [0.3.5] - 2026-04-03

### Fixed

- **Multi-Tenancy Study Deduplication**: Updated `Case` and `ProcessedStudy` models to use composite uniqueness (`adminId` + `studyInstanceUID`). This allows different clinics to process the same study from a shared PACS without skipping or clashing.
- **Per-Admin Polling**: The polling service now generates isolated cycles for each active admin, preventing state leakage and ensuring reliable metadata extraction for all organizations.
- **DICOM Metadata Injection**: Added `dicom.utils.js` (using `dcmjs`) to inject/fix the `AccessionNumber` in DICOM files during manual upload. This ensures seamless linkage between the PACS and HIS even when the original file is missing identifiers.

### Added

- **Modality & BodyPart Extraction**: Polling now automatically extracts `Modality` and `BodyPartExamined` from DICOM tags and persists them to the `Case` record for dashboard visibility and AI routing.

---

## [0.3.4] - 2026-03-28

### Added

- `GET /api/integrations/pacs` (ADMIN only) — retrieves the full saved PACS config (`url`, `username`, `password`, `pollIntervalSeconds`, `active`, `activatedAt`) so the frontend can pre-fill the PACS settings form on load
- `GET /api/integrations/his` (ADMIN only) — retrieves the full saved HIS config (`url`, `apiKey`, `active`, `activatedAt`) so the frontend can pre-fill the HIS settings form on load
- `DELETE /api/admin/doctors/:doctorId` (ADMIN only) — removes a doctor from the org; automatically unassigns any active (non-completed) cases back to `UNASSIGNED`; blocked with `409` if the doctor has submitted reports (medical records must be preserved)
- `PATCH /api/admin/doctors/:doctorId/reset-password` (ADMIN only) — generates a new secure random password for a doctor and returns it one-time in the response (`{ generatedPassword }`) — same pattern as doctor creation; old password is immediately invalidated

---

## [0.3.3] - 2026-03-26

### Added

- `POST /api/cases/:caseId/resend-notification` — endpoint for doctors to resend report notifications to patients.
- `PATCH /api/cases/:caseId/status` — endpoint for doctors to mark cases as `IN_REVIEW` (completes the medical workflow).

### Fixed

- **Email Portal URLs**: Patient notification emails now correctly point to the **frontend** portal UI (`/portal/report/:token`) instead of the backend API.
- **Polling Hardening**: Added top-level safety wrappers to the polling service to prevent unhandled promise rejections from crashing the entire server if a PACS cycle fails.
- **WhatsApp Logs**: Removed temporary `[WHATSAPP]` console logs to keep terminal output clean until a real SMS provider is integrated.

---

## [0.3.2] - 2026-03-26

### Changed

- `GET /api/portal/report/:token` — response now returns `orthancBaseUrl`, `orthancId`, and `studyInstanceUID` instead of a pre-built `pacsViewerUrl`. Frontend constructs the viewer URL it needs from these three raw values (Orthanc explorer, OHIF, DICOMweb, etc.)
- AI trigger payload now includes `orthancUrl` — AI server no longer needs to know Orthanc config separately; the correct admin's PACS URL is forwarded with every analysis request

### Added

- `docs/api.md` (root) — fully rewritten API reference: all endpoints, roles, auth, multi-tenancy, workflows (polling, AI callback, notifications), case lifecycle, portal viewer data, and env vars
- `docs/workflow.md` (root) — fully rewritten step-by-step system workflow with updated mermaid flowchart

---

## [0.3.1] - 2026-03-26

### Fixed

- Polling crash loop: `processedStudy` is now created **before** `case.create` — prevents a retry-crash cycle when the server restarts mid-poll and the case already exists in DB but the processed marker doesn't
- Added `P2002` catch on `case.create` — duplicate `studyInstanceUID` now logs a warning and skips gracefully instead of throwing an unhandled error

### Added

- `USE_FALLBACK_ACCESSION` env flag — controls whether DICOMs missing an `AccessionNumber` use the fallback value (`true`) or are skipped entirely (`false`, default for production)
- `FALLBACK_ACCESSION_NUMBER` env var — the accession number used when `USE_FALLBACK_ACCESSION=true` and the DICOM has no embedded accession number

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
