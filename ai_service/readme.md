# Radiora AI Service

This service provides an asynchronous, FastAPI-based AI worker that connects to an Orthanc PACS server to automatically download DICOM MRI studies, reconstructs them into continuous 3D topological slices, runs advanced Multi-Modal LLM inference (MedGemma) to locate core tumors using heatmap projections, and posts the results back to the primary backend.

## Prerequisites
- **Python 3.9+** (ensure `python` and `pip` are available in your PATH)
- **Hugging Face Model Cache**: The inference engine looks for `google/medgemma-1.5-4b-it` locally. If it's your first time, ensure the model is downloaded via Hugging Face.

## 1. Setup & Installation

1. **Navigate to the AI Service directory**:
   ```bash
   cd c:\code\radiora\ai_service
   ```

2. **Create a Virtual Environment** (Recommended):
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   *(This will install FastAPI, Uvicorn, PyTorch, Transformers, Pydicom, Pillow, numpy, requests, etc.)*

## 2. Running the Server

Start the AI worker process using Uvicorn. The server runs on port `8000` by default.

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

You should see logs indicating the FastAPI application has started. The Swagger UI will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

## 3. How to Use / Test

### Method A: Integrated via Backend
If you are running the full `Radiora-backend`, the backend's poller automatically triggers the AI Service through the `AI_BASE_URL` env variable whenever a new MRI case is detected in Orthanc.

### Method B: Manual Testing (Without Backend)
We provided a standalone Python script that mocks a backend webhook trigger, effectively allowing you to run end-to-end AI analysis manually targeting any local Orthanc configuration.

1. Ensure your Orthanc server is running (default `http://localhost:8042`) and contains your test study.
2. Open a new terminal in the `ai_service` folder.
3. Run the test script:
   ```bash
   python test_trigger.py
   ```
This will send a mock payload with `orthancUsername` and `orthancPassword` to securely download the ZIP, extract it, and begin slice-by-slice diagnostic inference. The final coordinates, confidence level, and findings will be printed directly in the Uvicorn terminal running the server.

---

## 4. API Reference

### Triggering the AI
**Endpoint:** `POST /analyze`

The backend triggers the AI Service using this payload structure. 

**Request Payload:**
```json
{
  "caseId": "12345",
  "studyInstanceUID": "1.2.840.113619.2.1.2411.1031152382348",
  "orthancUrl": "http://localhost:8042",
  "orthancUsername": "orthanc", 
  "orthancPassword": "orthanc", 
  "callbackUrl": "http://localhost:3000/api/cases/12345/ai-result"
}
```
*(Note: `orthancUsername` and `orthancPassword` are optional fields, but `test_trigger.py` injects them so the local server can authorize successfully).*

**Immediate Response (HTTP 202):**
```json
{
  "status": "Accepted",
  "message": "Analysis started in background"
}
```

### The Webhook Callback
Once the AI finishes processing, it will construct the final detection results and send a `POST` request back to the `callbackUrl` that was provided in the initial trigger.

**Callback Payload Structure:**
```json
{
  "caseId": "12345",
  "aiStatus": "COMPLETED",
  "findings": "Hyperintense focal lesion identified in T2 fluid attenuated inversion recovery.",
  "confidence": 0.96,
  "annotations": [
    {
      "x": 140, "y": 80, "width": 45, "height": 30, "z": 8,
      "label": "anomaly", "confidence": 0.94, "filename": "IM-0001-0008.dcm", "findings": "Hyperintense focal lesion..."
    }
  ],
  "volumeStats": {
    "x": 135,
    "y": 75,
    "width": 55,
    "height": 40,
    "z_min": 6,
    "z_max": 12,
    "slice_count": 7,
    "max_layer_overlap": 5,
    "confidence": 0.96
  }
}
```

---

## Technical Features

- **Concurrency Security**: The AI server uses a strict `threading.Lock` to enforce serial ML inference. Even if many scans are uploaded simultaneously, the Heavy CPU/GPU operations queue up cleanly preventing segmentation faults and out-of-memory crashes.
- **Topological Mapping**: Extracts `InstanceNumber` from DICOM metadata and guarantees correct 3D volumetric stacking.
- **Heatmap Core Engine**: Maps all detected potential anomalies into a spatial heatmap and exclusively isolates bounding boxes that persist dynamically across the Z-axis, drastically reducing false positives.
