# Radiora — Integrations

---

> **Boundary Rule:** Next.js does not communicate directly with PACS (Orthanc) or the HIS service. All integration calls — polling, study metadata fetching, patient lookup, order lookup — are handled exclusively by the backend. Next.js only calls backend APIs.

---

## 1. PACS — Orthanc

### What We Use Orthanc For

Orthanc is an open-source, lightweight DICOM server. We use it as our PACS (Picture Archiving and Communication System). We do **not** build our own DICOM storage or viewer.

**Orthanc's responsibilities in Radiora:**
- Store DICOM studies pushed from imaging modalities
- Expose a REST API for study discovery and metadata retrieval
- Serve a built-in DICOM web viewer (Stone of Orthanc / OHIF) for doctors

### Orthanc REST API — Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/studies` | List Orthanc internal study IDs currently stored (not DICOM StudyInstanceUIDs) |
| `GET` | `/studies/:uid` | Get DICOM metadata for a specific study |
| `GET` | `/studies/:uid/series` | (Optional) List series within a study |
| `GET` | `/app/explorer.html` | Orthanc built-in viewer |

### Metadata Extracted from Orthanc

When backend polls and finds a new study, it extracts these DICOM tags from the study metadata (`/studies/:uid`):

```json
{
  "MainDicomTags": {
    "StudyInstanceUID": "1.2.840.10008.5.1.4.1.2.1",
    "AccessionNumber": "ACC-001",
    "StudyDate": "20250110",
    "Modality": "CT"
  },
  "PatientMainDicomTags": {
    "PatientID": "P-00123",
    "PatientName": "DOE^JOHN"
  }
}
```

> **Important:** The `AccessionNumber` in the DICOM metadata must match the AccessionNumber in the HIS order. This is the link between PACS and HIS.

### Orthanc Authentication

Orthanc supports HTTP Basic Auth. The backend passes `username:password` credentials on every API call. These are stored in the `Integration` table and loaded at runtime.

### DICOM Viewer Link Format

The backend constructs the viewer URL and includes it in the case API response:

```
http://localhost:8042/app/explorer.html#study?uuid={orthanc-study-id}
```

The `orthanc-study-id` is the internal Orthanc UUID for the study (not the DICOM StudyInstanceUID). The mapping is returned by the `/studies` endpoint.

> **Note:** `StudyInstanceUID` must be extracted from DICOM metadata by calling `GET /studies/:id` on each study. The list returned by `GET /studies` contains Orthanc internal IDs only.

---

## 2. HIS Mock Service

### Design

The HIS mock is a lightweight Express service that simulates the minimal functionality of a Hospital Information System. It runs independently on port `3001` and is called by the backend — never directly by the frontend.

### Data Model (In-Memory or SQLite)

**Patients:**
```js
{
  patientId: "P-00123",
  name: "John Doe",
  dob: "1985-04-22",
  gender: "M"
}
```

**Orders:**
```js
{
  accessionNumber: "ACC-001",
  patientId: "P-00123",
  modality: "CT",
  bodyPart: "CHEST",
  requestedAt: "2025-01-10T08:00:00Z"
}
```

### HIS API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/patients` | Register a new patient |
| `GET` | `/patients/:patientId` | Get patient by ID |
| `POST` | `/orders` | Create an imaging order |
| `GET` | `/orders?accessionNumber=` | Get order by AccessionNumber |

### Authentication

The HIS mock accepts an `x-api-key` header. The key is stored in the `Integration` table and sent by the backend on every HIS request.

### HIS Seeding (For Demo)

For the hackathon demo, the HIS can be pre-seeded with:
- 3–5 sample patients
- Corresponding imaging orders with AccessionNumbers that match the DICOM files being pushed to Orthanc

---

## 3. Integration Activation Logic

Integrations are stored in the `Integration` table and must be explicitly activated by the admin.

### Activation Flow

1. Admin saves config (URL, credentials) → stored in DB with `active: false`
2. Admin clicks "Activate":
   - For PACS: backend calls a test request to Orthanc (`GET /studies?limit=1`). If successful, marks integration as `active: true` and starts the polling service.
   - For HIS: backend calls `GET /his/patients/test` or similar health check. If successful, marks as `active: true`.
3. On backend restart: if integration is `active: true` in DB, polling auto-resumes.

### Deactivation

Admin can deactivate integrations. Polling stops immediately. No new cases are created until reactivated.

---

## 4. Polling Mechanism

### How It Works

The backend runs a polling loop using `setInterval` (or a cron-like scheduler):

```js
setInterval(async () => {
  await pollOrthancForNewStudies();
}, pollIntervalSeconds * 1000);
```

### `pollOrthancForNewStudies()` — Logic

```
1. Fetch recent or limited studies from Orthanc: GET /studies
   (Avoid fetching unbounded lists to prevent unnecessary load)
2. For each Orthanc internal study ID in the list:
   a. Check if `studyInstanceUID` (extracted from metadata) exists in `ProcessedStudy` table
      → If yes: skip (already handled)
      → If no: proceed
   b. Fetch study metadata: GET /studies/:id
   c. Extract `studyInstanceUID`, AccessionNumber, PatientID, Modality, StudyDate
   d. Query HIS for order: GET /orders?accessionNumber=...
      → If no match: do NOT add to ProcessedStudy → retry on next polling cycle
   e. Query HIS for patient: GET /patients/:patientId
   f. Create Case record in DB (status: UNASSIGNED)
   g. Insert `studyInstanceUID` into ProcessedStudy
3. Log summary: N new studies processed, M skipped
```

### Poll Interval

- Default: `30` seconds
- Configured per PACS integration in the admin panel
- Minimum enforced: `10` seconds

> **Activation filtering:** Only studies created **after** the integration `activatedAt` timestamp should be processed. Any studies created before activation must be ignored to prevent ingestion of historical data. The backend compares each study's `StudyDate` against `activatedAt` before proceeding.

---

## 5. Deduplication Logic

### Why Deduplication Is Needed

Orthanc returns all stored studies on every poll. Without deduplication, the backend would attempt to create duplicate cases on every polling cycle.

### Mechanism

The `ProcessedStudy` table acts as a permanent ledger of every `studyInstanceUID` that has already been ingested:

```sql
studyInstanceUID (UNIQUE) | processedAt
--------------------------+------------
1.2.840.10008.5.1.4.1.2.1 | 2025-01-10T09:30:00Z
```

Before processing any study, the backend does:

```js
const exists = await prisma.processedStudy.findUnique({
  where: { studyInstanceUID: uid }
});
if (exists) return; // skip
```

After successfully creating a case:

```js
await prisma.processedStudy.create({
  data: { studyInstanceUID: uid }
});
```

### Edge Cases

| Scenario | Behavior |
|---|---|
| Study uploaded but HIS order not found | Do NOT mark as processed. Retry in subsequent polling cycles until a matching HIS order is found or an optional timeout threshold is reached. |
| Orthanc temporarily unreachable | Poll cycle fails gracefully with error log. Retried on next interval. |
| Same `studyInstanceUID` from different series | Treated as one study. Only the study-level UID is checked. |
