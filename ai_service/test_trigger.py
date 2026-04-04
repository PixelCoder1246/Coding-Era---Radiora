import requests
import json
import uuid

AI_SERVER_URL = "http://localhost:8000/analyze"
ORTHANC_URL = "http://localhost:8042" # Change if your Orthanc instance is on a different port
CALLBACK_URL = "http://localhost:3000/api/ai/callback" # Where the AI server will send the results

def test_ai_server():
    payload = {
        "caseId": f"test_case_{uuid.uuid4().hex[:8]}",
        "studyInstanceUID": "test_study_uid", 
        "orthancUrl": ORTHANC_URL,
        "orthancUsername": "orthanc",
        "orthancPassword": "orthanc",
        "callbackUrl": CALLBACK_URL
    }
    
    print(f"=== Testing AI Server ===")
    print(f"Sending POST request to {AI_SERVER_URL}")
    print(f"Payload:\n{json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(AI_SERVER_URL, json=payload)
        print(f"\n[HTTP {response.status_code}] Response received:")
        try:
            print(json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print(response.text)
            
        if response.status_code == 202:
            print("\nSuccess! The AI Server accepted the request and is processing it in the background.")
            print("Check the terminal where your AI Server (uvicorn) is running to see the processing logs.")
            print(f"Once finished, the AI server will POST the results to: {CALLBACK_URL}")
        else:
            print(f"\nWarning: Expected status code 202, but got {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"\n[ERROR] Failed to connect to {AI_SERVER_URL}.")
        print("Please ensure the AI server is running (e.g., 'uvicorn server:app --reload' in the ai_service folder).")

if __name__ == "__main__":
    test_ai_server()
