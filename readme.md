# Radiora — Medical Imaging Workflow Orchestrator

Radiora is a professional-grade medical imaging middleware designed to bridge the gap between PACS (Orthanc), HIS, and AI services. It provides a robust, multi-tenant backend for processing DICOM studies, auto-assigning doctors, and integrating AI-driven insights.

## Version 0.3.7

### Key Features
- **PACS Integration**: Real-time polling of Orthanc instances with automated metadata extraction.
- **HIS Connectivity**: Seamless linkage with Hospital Information Systems via Accession Number reconciliation.
- **AI-First Workflow**: Automated, non-blocking AI analysis triggers with dedicated callback handlers.
- **Multi-Tenant Architecture**: Each organization (Admin) is fully isolated with their own configuration and patient data.
- **Medical Workflow**: End-to-end case lifecycle from `UNASSIGNED` to `COMPLETED` reports.

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express, Prisma 5, PostgreSQL
- **PACS**: Orthanc (DICOM Server)
- **AI**: Non-blocking asynchronous integration
- **DevOps**: Docker, Nginx Reverse Proxy with `nip.io`

---

## 🚀 Environment Configuration

To enable AI analysis, ensure the following is set in your `backend/.env`:

```env
# AI Service Endpoint
AI_BASE_URL="http://ai-service-url:port"

# Public URL of this Backend (for AI callbacks)
BACKEND_URL="http://your-backend-ip.nip.io"
```

---

## 📘 Documentation
- [API Reference](file:///z:/Work%20Files/Projects/radiora/Radiora/docs/api.md)
- [System Architecture](file:///z:/Work%20Files/Projects/radiora/Radiora/docs/architecture.md)
- [Deployment Guide](file:///z:/Work%20Files/Projects/radiora/Radiora/services/docker-compose.yml)

---

## 📝 Recent Changes (v0.3.7)
- **Deep Metadata Extraction**: Optimized polling to fetch body part tags from individual DICOM series when study-level tags are sparse.
- **HIS Metadata Fallback**: Automatic use of HIS order details if DICOM files are missing critical metadata.
- **Normalization**: Standardized modality and body part naming across the system.
