# Radiora — API Reference

> Version: **0.3.4** | Base URL: `http://localhost:3000`  
> All protected endpoints require `Authorization: Bearer <token>` **or** the `radiora_token` httpOnly cookie set on login.

---

## API Consumption

All APIs are consumed by the **Next.js frontend**. Next.js may lightly proxy or format responses but must never re-implement backend logic. The backend is the source of truth.

---

## Roles & Auth

| Role | What they can do |
|---|---|
| `ADMIN` | Register org, create/list/delete doctors, reset doctor passwords, view **all** org cases, manually assign doctors, configure PACS/HIS |
| `DOCTOR` | View **only their assigned** cases (any status including COMPLETED), submit reports, update case status |
| `PUBLIC` | Access patient portal by one-time secure token only — no login |

> **Multi-tenancy:** Every admin is a fully isolated organisation. All data is scoped by `adminId` embedded in the JWT. Doctors are bound to the admin who created them via `createdByAdminId`.

---

## Auth — `/api/auth`

### `POST /api/auth/register`
Create a new **ADMIN** account (onboard a new clinic/org).

**Request:**
```json
{ "name": "Clinic Admin", "email": "admin@clinic.com", "password": "securepass", "role": "ADMIN" }
```
**Response `201`:**
```json
{ "id": "...", "name": "...", "email": "...", "role": "ADMIN", "createdAt": "..." }
```

---

### `POST /api/auth/login`
Login as ADMIN or DOCTOR. Sets `radiora_token` httpOnly cookie and returns JWT.

**Request:**
```json
{ "email": "admin@clinic.com", "password": "securepass" }
```
**Response `200`:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "...", "role": "ADMIN", "adminId": "..." }
}
```
> `adminId` = own ID for ADMINs. For DOCTORs = their creating admin's ID.

---

### `GET /api/auth/status` 🔒
Check current session — used by frontend navbar/auth guard.

**Response `200`:**
```json
{ "id": "...", "name": "...", "email": "...", "role": "DOCTOR", "maxConcurrentCases": 5, "adminId": "..." }
```

---

### `POST /api/auth/logout` 🔒
Clears the `radiora_token` cookie.

**Response `200`:** `{ "message": "Logged out successfully." }`

---

## Admin — `/api/admin` 🔒 ADMIN only

### `POST /api/admin/doctors`
Create a DOCTOR under this admin's org. Auto-generates a secure password.

**Request:**
```json
{ "name": "Dr. Smith", "email": "doctor@clinic.com", "maxConcurrentCases": 5 }
```
**Response `201`:**
```json
{
  "id": "...", "name": "...", "email": "...", "role": "DOCTOR",
  "maxConcurrentCases": 5, "generatedPassword": "auto-generated-secure-pass"
}
```

---

### `GET /api/admin/doctors`
List all doctors belonging to this admin's org only.

**Response `200`:** Array of `{ id, name, email, maxConcurrentCases, createdAt }`

---

### `DELETE /api/admin/doctors/:doctorId`
Remove a doctor from the org.

- Active (non-completed) cases are automatically unassigned → back to `UNASSIGNED`
- **Blocked** (`409`) if the doctor has submitted any reports — medical records must be preserved

**Response `200`:** `{ "message": "Doctor removed successfully." }`  
**Response `409`:** `{ "error": "Cannot remove a doctor who has submitted reports. Medical records must be preserved." }`

---

### `PATCH /api/admin/doctors/:doctorId/reset-password`
Generate a new secure random password for a doctor. The old password is immediately invalidated. Returned **one time only** — admin must copy and hand it to the doctor.

**Response `200`:** `{ "generatedPassword": "a1b2c3d4e5f6" }`

---

## Integrations — `/api/integrations` 🔒

### `POST /api/integrations/pacs` ADMIN only
Save or update PACS (Orthanc) config for this admin's org.

**Request:**
```json
{ "url": "http://localhost:8042", "username": "orthanc", "password": "orthanc", "pollIntervalSeconds": 30 }
```

---

### `POST /api/integrations/his` ADMIN only
Save or update HIS config for this admin's org.

**Request:**
```json
{ "url": "http://localhost:4000", "apiKey": "optional-api-key" }
```

---

### `GET /api/integrations/status` 🔒 ADMIN or DOCTOR
Current PACS + HIS status for this admin's org.

**Response `200`:**
```json
{
  "pacs": { "url": "...", "active": true, "activatedAt": "...", "pollIntervalSeconds": 30 },
  "his":  { "url": "...", "active": true, "activatedAt": "..." }
}
```

---

### `GET /api/integrations/pacs` ADMIN only
Retrieve the full saved PACS configuration for pre-filling the admin settings form.

**Response `200`:**
```json
{ "url": "http://localhost:8042", "username": "orthanc", "password": "orthanc", "pollIntervalSeconds": 30, "active": true, "activatedAt": "..." }
```
**Response `404`:** `{ "error": "PACS configuration not found. Save it first." }`

---

### `GET /api/integrations/his` ADMIN only
Retrieve the full saved HIS configuration for pre-filling the admin settings form.

**Response `200`:**
```json
{ "url": "http://localhost:4000", "apiKey": "...", "active": true, "activatedAt": "..." }
```
**Response `404`:** `{ "error": "HIS configuration not found. Save it first." }`

---

### `POST /api/integrations/pacs/activate` ADMIN only
Verifies Orthanc connectivity and starts per-admin polling loop.

### `POST /api/integrations/his/activate` ADMIN only
Verifies HIS connectivity and marks HIS as active.

---

## HIS Proxy — `/api/his` 🔒

These proxy to the configured HIS server.

### `POST /api/his/patients`
Create a patient in HIS.

**Request:**
```json
{ "name": "John Doe", "dob": "1990-01-01", "gender": "M", "email": "john@example.com", "phone": "+91..." }
```
**Response `201`:** `{ "patientId": "P-1234567890-ABCDE", "name": "...", ... }`

---

### `POST /api/his/orders`
Create a radiology order. HIS auto-generates `accessionNumber`.

**Request:**
```json
{ "patientId": "P-1234567890-ABCDE", "modality": "CT", "bodyPart": "CHEST" }
```
**Response `201`:** `{ "accessionNumber": "ACC-...", "patientId": "...", "modality": "CT", ... }`

---

## PACS Upload — `/api/pacs` 🔒

### `POST /api/pacs/upload`
Upload a DICOM file to this admin's Orthanc.  
Content-Type: `multipart/form-data`, field: `file`.

---

## Cases — `/api/cases` 🔒

### `GET /api/cases`
List cases scoped by caller's role:
- **ADMIN** → all cases in org (all statuses, all doctors)
- **DOCTOR** → only cases assigned to them (all statuses, including `COMPLETED`)

**Response `200`:**
```json
[
  {
    "id": "...", "adminId": "...", "orthancId": "...",
    "studyInstanceUID": "...", "accessionNumber": "...",
    "patientId": "...", "patientName": "John Doe",
    "patientEmail": "...", "patientPhone": "...",
    "modality": "CT", "bodyPart": "CHEST", "studyDate": "...",
    "status": "PENDING_REVIEW", "aiStatus": "NOT_REQUESTED",
    "assignedDoctor": { "id": "...", "name": "...", "email": "..." },
    "createdAt": "...", "updatedAt": "..."
  }
]
```

---

#### `GET /api/cases/:caseId`
Returns full case details (patient info, modality, etc.) including current `status` and `aiResult`.

**Response `200`:**
```json
{
  "id": "...", "adminId": "...", "orthancId": "...",
  "studyInstanceUID": "...", "accessionNumber": "...",
  "patientId": "...", "patientName": "John Doe",
  "patientEmail": "...", "patientPhone": "...",
  "modality": "CT", "bodyPart": "CHEST", "studyDate": "...",
  "status": "PENDING_REVIEW", "aiStatus": "COMPLETED",
  "assignedDoctor": { "id": "...", "name": "...", "email": "..." },
  "aiResult": {
    "findings": "Nodule in right lower lobe.",
    "confidence": 0.94,
    "annotations": { "boxes": [ ... ] },
    "analyzedAt": "..."
  },
  "report": {
    "reportText": "...", "impression": "...",
    "submittedAt": "...", "accessToken": "radiora_rep_..."
  },
  "pacsViewerUrl": "http://orthanc:8042/app/explorer.html#study?uuid=..."
}
```

---

### `POST /api/cases/:caseId/assign` 🔒 ADMIN only
Manually assign or reassign a doctor to a case.

**Request:** `{ "doctorId": "..." }`  
**Effect:** Case status → `PENDING_REVIEW`

---

#### `POST /api/cases/:caseId/report` 🔒 DOCTOR only
Submit a radiology report for a case. Automatically:
- Sets case status to `COMPLETED`
- Generates a unique access token
- Emails the patient via SendGrid
- Logs a WhatsApp notification

**Body:**
```json
{
  "reportText": "The CT scan shows...",
  "impression": "No acute findings."
}
```

#### `POST /api/cases/:caseId/resend-notification` 🔒 DOCTOR only
Resends the report notification (Email/WhatsApp) to the patient for a completed case. Use this if the patient lost their email.

**Response `200`:**
```json
{
  "message": "Notification resent successfully.",
  "accessToken": "radiora_rep_..."
}
```

#### `POST /api/cases/:caseId/ai-result` PUBLIC (AI callback)
Called by the AI server when analysis is complete. No auth required.

**Body:**
```json
{
  "findings": "Nodule detected in right lower lobe",
  "confidence": 0.91,
  "annotations": { "boxes": [ ... ] }
}
```

---

## Patient Portal — `/api/portal` PUBLIC

All routes in this section are **public** (no authentication required). Reports are accessed via a secure token generated at report submission time.

#### `GET /api/portal/report/:token`
Returns the full report content and PACS connection details for the given secure token.

**Response `200`:**
```json
{
  "patientName": "John Doe",
  "modality": "CT",
  "bodyPart": "CHEST",
  "studyDate": "...",
  "studyInstanceUID": "1.2.3.4.5...",
  "orthancId": "abc-123-def",
  "orthancBaseUrl": "http://orthanc:8042",
  "reportText": "CT scan shows...",
  "impression": "No acute findings.",
  "doctorName": "Dr. Smith",
  "submittedAt": "..."
}
```
> **Frontend Implementation:**
> 1. Use `orthancBaseUrl` + `orthancId` to build the Orthanc viewer link:  
>    `${orthancBaseUrl}/app/explorer.html#study?uuid=${orthancId}`
> 2. Use `studyInstanceUID` if embedding a custom OHIF or Cornerstone viewer.

---

## Automated Workflows

### PACS Polling (per admin, runs on activation)
```
Every {pollIntervalSeconds}:
  1. Fetch study list from this admin's Orthanc
  2. For each study not in ProcessedStudy:
     a. Mark as ProcessedStudy FIRST (prevents retry crash)
     b. Read DICOM metadata → studyInstanceUID, accessionNumber, modality...
     c. Look up HIS order by accessionNumber
     d. Fetch patient name, email, phone from HIS
     e. Create Case (status: UNASSIGNED)
     f. Auto-assign to least-loaded eligible doctor → PENDING_REVIEW
     g. Trigger AI analysis (non-blocking, fire-and-forget)
```

> If DICOM lacks `AccessionNumber`: controlled by `USE_FALLBACK_ACCESSION` env flag.

### AI Analysis (non-blocking callback)
```
Backend → POST {AI_BASE_URL}/analyze:
  { caseId, studyInstanceUID, orthancUrl, callbackUrl }

AI Server:
  → Fetches DICOM from orthancUrl using studyInstanceUID
  → Runs ML inference (takes seconds to minutes)
  → POST callbackUrl → backend stores AiResult, sets aiStatus: COMPLETED

Backend does NOT wait — polling continues immediately.
```

### Report → Patient Notification
```
Doctor submits report →
  Case.status → COMPLETED
  Unique accessToken generated
  Email → patient via SendGrid (link to /portal/report/:token)
  WhatsApp → logged (simulated, ready for Twilio)
```

---

## Case Status Lifecycle
```
UNASSIGNED
  → (auto-assign or POST /assign) → PENDING_REVIEW
  → (doctor opens case, PATCH /status) → IN_REVIEW
  → (report submitted) → COMPLETED
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `FRONTEND_URL` | Yes | Allowed CORS origin |
| `BACKEND_URL` | Yes | Used in AI callback URL construction |
| `SENDGRID_API_KEY` | Yes | SendGrid API key for email |
| `EMAIL_FROM` | Yes | Sender email address |
| `AI_BASE_URL` | No | AI server base URL (empty = AI disabled) |
| `USE_FALLBACK_ACCESSION` | No | `true` = use fallback accession for DICOMs without one |
| `FALLBACK_ACCESSION_NUMBER` | No | Fallback accession number when above is `true` |
