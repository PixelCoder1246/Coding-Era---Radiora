# Radiora — Project Overview

## What Is Radiora?

Radiora is a **medical imaging workflow platform** designed to bridge the gap between imaging centers (PACS), hospital information systems (HIS), and radiologists. It orchestrates the complete lifecycle of a medical scan — from patient registration and imaging order creation, through scan upload, case assignment, AI-assisted analysis, to final report delivery.

The platform is built for hackathon-grade demonstration of a realistic clinical workflow using real tools and protocols (DICOM/PACS via Orthanc, REST-based HIS integration) without simulating fake data or overcomplicating infrastructure.

---

## The Problem Being Solved

In most clinical environments, imaging workflows are fragmented:

- **PACS and HIS are siloed** — scans sit in PACS but nothing automatically ties them to a patient order.
- **Radiologists have no unified inbox** — they manually check modality worklists or receive phone calls.
- **Patients receive paper reports** — no digital delivery or access portal.
- **AI tools exist but aren't integrated** — they run in isolation with no feedback loop into reporting.

Radiora solves these by acting as the **central orchestrator** that listens for new studies, matches them to orders, routes them to doctors, collects reports, and delivers results to patients.

---

## System Capabilities

| Capability | Description |
|---|---|
| Patient Registration | Admin registers patients via HIS, which stores demographics and generates patient IDs |
| Imaging Orders | HIS creates orders with AccessionNumbers tied to patients |
| Scan Ingestion | System detects new DICOM studies pushed to Orthanc via polling |
| Case Creation | Backend matches study to HIS order, creates a case automatically |
| Doctor Assignment | Admin assigns a radiologist to a case |
| Report Submission | Doctor views scan in Orthanc viewer, writes and submits report |
| AI Analysis (Optional) | AI service processes study; output attached to case for doctor review |
| Patient Portal | Patient accesses their report via a secure link (token-based URL, no login required) |

---

## Key Constraints

These constraints are intentional design choices — not limitations to work around:

- **Orthanc is the PACS.** We do not build PACS from scratch. Orthanc handles all DICOM storage, retrieval, and viewing.
- **HIS is a minimal mock service.** It only stores patients and imaging orders. No scheduling, billing, or clinical records.
- **Images are never stored in our database.** The backend only stores `studyInstanceUID` as a reference to the PACS record. All image retrieval goes through Orthanc.
- **No OTP or complex auth.** Authentication is email + password with bcrypt hashing and JWT tokens.
- **AI is optional and last.** The core pipeline (patient → scan → case → report → delivery) must work completely without the AI service. AI is a plug-in enhancement.
- **Polling-based ingestion.** The backend polls Orthanc for new studies at a configured interval. No webhooks or DICOM push listeners are required.
- **Admin-configured integrations.** PACS and HIS connections are configured by an admin through the backend API and stored in the database. Nothing is hardcoded.
- **No fake case generation.** Cases are ONLY created when a real study appears in Orthanc and matches a real HIS order.

---

## System Interfaces

Radiora consists of three user-facing interfaces, all served by a single React frontend application:

- **Admin Interface** — for system configuration (PACS + HIS integrations), doctor management, and monitoring/assigning cases
- **Doctor Interface** — for reviewing assigned cases, opening scans in the Orthanc viewer, requesting AI analysis, and submitting reports
- **Patient Interface** — for viewing completed reports via a secure token-based link; no authentication required

The frontend is responsible only for UI presentation and API interaction. All core business logic resides in the backend.

---

## Frontend Technology

The frontend is built using **Next.js**.

Next.js provides:
- Server-side rendering (SSR) for fast initial page loads
- API routes for lightweight server-side logic
- Improved routing and page structure

It acts as a **UI layer** and a **thin backend-for-frontend (BFF)**, handling UI state and optionally proxying or formatting backend responses. All core system logic — polling, case creation, integration management, AI orchestration — remains in the main backend.

---

## Who Uses the System

| Role | Responsibilities |
|---|---|
| **Admin** | Configures integrations, creates doctors, monitors cases |
| **Doctor (Radiologist)** | Reviews assigned cases, views scans, submits reports |
| **Patient** | Accesses their report via a secure patient portal link |
