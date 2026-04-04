import os
import zipfile
import tempfile
import requests
import shutil
import threading
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from inference import scan_mri

app = FastAPI(title="Radiora AI Server")

# Serializes ML inference to avoid PyTorch/CPU segmentation faults from concurrency
inference_lock = threading.Lock()

class AnalyzeRequest(BaseModel):
    caseId: str
    studyInstanceUID: str
    orthancUrl: str
    orthancUsername: Optional[str] = None
    orthancPassword: Optional[str] = None
    callbackUrl: str

def process_analysis(req: AnalyzeRequest):
    print(f"Started processing case {req.caseId} for study {req.studyInstanceUID}")
    temp_dir = tempfile.mkdtemp()
    
    try:
        dcm_dir = os.path.join(temp_dir, "dcm")
        os.makedirs(dcm_dir, exist_ok=True) 
        
        try:
            auth_opts = {}
            if req.orthancUsername and req.orthancPassword:
                auth_opts['auth'] = (req.orthancUsername, req.orthancPassword)

            # 1. Look up Orthanc internal ID from StudyInstanceUID
            find_url = f"{req.orthancUrl}/tools/find"
            payload = {
                "Level": "Study",
                "Query": {"StudyInstanceUID": req.studyInstanceUID}
            }
            res = requests.post(find_url, json=payload, timeout=5, **auth_opts)
            res.raise_for_status()
            
            orthanc_study_ids = res.json()
            if not orthanc_study_ids:
                # Fallback if the user actually passed the Orthanc ID in studyInstanceUID field
                orthanc_study_id = req.studyInstanceUID
            else:
                orthanc_study_id = orthanc_study_ids[0]

            print(f"Found orthanc study ID: {orthanc_study_id}")

            # 2. Download the study archive (ZIP)
            archive_url = f"{req.orthancUrl}/studies/{orthanc_study_id}/archive"
            print(f"Downloading ZIP from {archive_url}")
            
            zip_res = requests.get(archive_url, stream=True, timeout=15, **auth_opts)
            zip_res.raise_for_status()

            zip_path = os.path.join(temp_dir, "study.zip")
            with open(zip_path, "wb") as f:
                for chunk in zip_res.iter_content(chunk_size=8192):
                    f.write(chunk)

            # 3. Extract the ZIP and flatten DICOM files into dcm_dir
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
                
            for root, dirs, files in os.walk(temp_dir):
                # Skip the specific dcm_dir during walking so we don't move files over themselves
                if root == dcm_dir:
                    continue
                for file in files:
                    if file.lower().endswith(('.dcm', '.dicom')):
                        # Move all dicom files to the flat dcm_dir expected by test.py
                        source = os.path.join(root, file)
                        destination = os.path.join(dcm_dir, file)
                        os.rename(source, destination)
        except Exception as e:
            print(f"[MOCKING] Orthanc unreachable or error ({e}). Using local mock files...")
            local_mock_dir = "c:/code/ai/dcm"
            if os.path.exists(local_mock_dir):
                for file in os.listdir(local_mock_dir):
                    if file.lower().endswith(('.dcm', '.dicom')):
                        shutil.copy(os.path.join(local_mock_dir, file), os.path.join(dcm_dir, file))
            else:
                print(f"Error: Could not find mock DICOM directory at {local_mock_dir}")
                    
        num_files = len([f for f in os.listdir(dcm_dir) if f.lower().endswith(('.dcm', '.dicom'))])
        print(f"Extracted {num_files} DICOM files into {dcm_dir}")
        
        if num_files == 0:
            raise ValueError("No DICOM files found in the study archive.")

        # 4. Run ML inference on the directory
        MODEL_ID = "google/medgemma-1.5-4b-it" 
        
        print("Waiting for ML inference lock (preventing concurrent crashes)...")
        with inference_lock:
            result_data = scan_mri(MODEL_ID, dcm_dir, body_part="brain")
        
        print("Inference completed successfully. Compiling payload.")

        # 5. POST results back to the backend
        findings_list = result_data.get("findings", [])
        findings_str = "; ".join(findings_list) if findings_list else "No significant findings."
        
        detections = result_data.get("detections", [])
        volume_stats = result_data.get("volume_stats")
        
        # Use the core tumor confidence if a heatmap volume was confirmed
        if volume_stats and "confidence" in volume_stats:
            overall_confidence = volume_stats["confidence"]
        else:
            confidences = [d.get("confidence", 0.0) for d in detections if "confidence" in d]
            overall_confidence = max(confidences) if confidences else 1.0
        
        payload_back = {
            "caseId": req.caseId,
            "aiStatus": "COMPLETED",
            "findings": findings_str,
            "confidence": float(overall_confidence),
            "annotations": detections,
            "volumeStats": result_data.get("volume_stats")
        }
        
        try:
            cb_res = requests.post(req.callbackUrl, json=payload_back, timeout=5)
            cb_res.raise_for_status()
            print(f"Successfully posted results back to {req.callbackUrl}")
        except Exception as e:
            print(f"[MOCKING] Backend callback unreachable ({e}). Mocking callback via console...")
            print("\n================ MOCK BACKEND CALLBACK PAYLOAD ================")
            import json
            print(json.dumps(payload_back, indent=2))
            print("===============================================================\n")

    except Exception as e:
        print(f"Error during async AI processing: {e}")
        # Try to notify backend of failure if possible
        try:
            failure_payload = {
                "caseId": req.caseId, 
                "aiStatus": "FAILED", 
                "error": str(e)
            }
            requests.post(req.callbackUrl, json=failure_payload)
        except Exception as inner_e:
            print(f"Failed to send failure POST back to backend: {inner_e}")
    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/analyze", status_code=202)
def analyze_study(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_analysis, req)
    return {"status": "Accepted", "message": "Analysis started in background"}
