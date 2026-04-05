import os
import json
import torch
import pydicom
import numpy as np
import re
from PIL import Image, ImageDraw
from transformers import AutoProcessor, AutoModelForCausalLM, AutoModel
from pydicom.pixel_data_handlers.util import apply_voi_lut

def create_gif_from_outputs(output_dir):
    """Compiles all processed .png files into an animated GIF."""
    print(f"\nCompiling Volumetric Animation...")
    
    if not os.path.exists(output_dir):
        print("Output directory does not exist. No GIF created.")
        return

    image_files = [f for f in os.listdir(output_dir) if f.lower().endswith(".png")]
    image_files.sort()  # Sort alphanumerically to maintain layer sequence
    
    if not image_files:
        print("No output PNGs found to compile.")
        return
        
    frames = []
    for image_name in image_files:
        img_path = os.path.join(output_dir, image_name)
        frames.append(Image.open(img_path))
        
    gif_path = os.path.join(output_dir, "brain_scan_volume.gif")
    
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=250,
        loop=0
    )
    print(f"Animated GIF saved successfully at {gif_path}")


def extract_and_draw_boxes(image, response_text, output_path):
    draw = ImageDraw.Draw(image)
    width, height = image.size
    extracted_boxes = []
    findings = ""
    
    try:
        # Fallback to isolate the JSON block if the model response still contains prompt artifacts
        if "model\n{" in response_text:
            response_text = "{" + response_text.split("model\n{", 1)[-1]
        elif "\nmodel\n" in response_text:
            response_text = response_text.split("\nmodel\n")[-1]

        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            findings = data.get("findings", "")
            annotations = data.get("annotations", [])
            for ann in annotations:
                x, y = ann.get("x", 0), ann.get("y", 0)
                w, h = ann.get("width", 0), ann.get("height", 0)
                label = ann.get("label", "anomaly")
                conf = ann.get("confidence", 0.0)
                
                if max(x, y, w, h) <= 1.0 and (w > 0 or h > 0):
                    x *= width
                    y *= height
                    w *= width
                    h *= height
                    
                if w > 0 and h > 0:
                    extracted_boxes.append({
                        "x": int(x), "y": int(y), 
                        "width": int(w), "height": int(h),
                        "label": label, "confidence": conf
                    })
                    
                    x1, y1 = x, y
                    x2, y2 = x + w, y + h
                    draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
                    conf_text = f"{label} ({int(conf*100)}%)" if conf else label
                    draw.text((x1, y1 - 15), conf_text, fill="red")
            
            image.save(output_path)
            return extracted_boxes, findings, len(extracted_boxes) > 0
    except Exception as e:
        pass # Suppress parsing errors to stop showing random stuff
        
    image.save(output_path)
    return extracted_boxes, findings, False

def extract_heatmap_volume(all_detections, width, height, min_heat=2):
    if not all_detections:
        return None, None
        
    heatmap = np.zeros((height, width), dtype=np.int32)
    
    for det in all_detections:
        x, y = det['x'], det['y']
        w, h = det['width'], det['height']
        x2, y2 = x + w, y + h
        x = max(0, x); y = max(0, y)
        x2 = min(width, x2); y2 = min(height, y2)
        
        if x2 > x and y2 > y:
            heatmap[y:y2, x:x2] += 1
            
    y_idx, x_idx = np.where(heatmap >= min_heat)
    
    if len(y_idx) == 0:
        y_idx, x_idx = np.where(heatmap >= 1)
        if len(y_idx) == 0:
            return None, heatmap

    x_min, x_max = int(np.min(x_idx)), int(np.max(x_idx))
    y_min, y_max = int(np.min(y_idx)), int(np.max(y_idx))
    
    z_coords = []
    core_confidences = []
    for det in all_detections:
        dx, dy = det['x'], det['y']
        dx2, dy2 = dx + det['width'], dy + det['height']
        
        if not (dx2 < x_min or dx > x_max or dy2 < y_min or dy > y_max):
            z_coords.append(det['z'])
            if 'confidence' in det:
                core_confidences.append(det['confidence'])
            
    if not z_coords:
        z_min_idx, z_max_idx = 0, 0
    else:
        z_min_idx, z_max_idx = min(z_coords), max(z_coords)
        
    core_confidence = float(max(core_confidences)) if core_confidences else 0.0
        
    volume_stats = {
        'x': x_min, 'y': y_min,
        'width': x_max - x_min, 'height': y_max - y_min,
        'z_min': z_min_idx, 'z_max': z_max_idx,
        'slice_count': z_max_idx - z_min_idx + 1,
        'max_layer_overlap': int(np.max(heatmap)),
        'confidence': core_confidence
    }
    
    return volume_stats, heatmap


def load_dcm_as_pil(dcm_path):
    dicom = pydicom.dcmread(dcm_path)
    
    try:
        image_array = apply_voi_lut(dicom.pixel_array, dicom)
    except Exception:
        image_array = dicom.pixel_array
    
    if len(image_array.shape) > 2:
        image_array = image_array[image_array.shape[0] // 2]
        
    image_array = image_array.astype(float)
    image_array = image_array - np.min(image_array)
    if np.max(image_array) != 0:
        image_array = image_array / np.max(image_array)
    image_array = (image_array * 255).astype(np.uint8)
    
    image = Image.fromarray(image_array)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    return image

def scan_mri(model_id, dcm_dir, body_part="brain"):
    print(f"Loading model: {model_id} ...")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    try:
        processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
        # Optimized for GPU and Low Memory
        model_kwargs = {
            "device_map": "auto",
            "dtype": "auto",
            "low_cpu_mem_usage": True,
            "trust_remote_code": True,
            "attn_implementation": "eager"
        }
        
        try:
            model = AutoModelForCausalLM.from_pretrained(model_id, **model_kwargs)
        except Exception:
            model = AutoModel.from_pretrained(model_id, **model_kwargs)
            
    except Exception as e:
        print(f"Error loading model weights or processor: {e}")
        print("Please ensure you have access to this model on Hugging Face (it may require an access token).")
        return

    model.eval()

    all_detections = []
    
    raw_files = [f for f in os.listdir(dcm_dir) if f.lower().endswith(".dcm") or f.lower().endswith(".dicom")]
    dcm_file_info = []
    
    for f in raw_files:
        path = os.path.join(dcm_dir, f)
        try:
            ds = pydicom.dcmread(path, stop_before_pixels=True)
            instance_num = int(getattr(ds, 'InstanceNumber', 0))
            dcm_file_info.append((instance_num, f))
        except:
            dcm_file_info.append((9999, f))
            
    dcm_file_info.sort(key=lambda x: x[0])
    dcm_files = [x[1] for x in dcm_file_info]
    
    for z_index, filename in enumerate(dcm_files):
        dcm_path = os.path.join(dcm_dir, filename)
        print(f"\nProcessing Slice {z_index}: {filename}...")
        
        try:
            img = load_dcm_as_pil(dcm_path)
            
            prompt = (
                "Context: Academic research dataset analysis. "
                f"Task: Perform technical image analysis on this {body_part} MRI scan. Identify the main pathology or anomaly. "
                "Respond ONLY with a JSON object in the exact following structure, with no extra text or markdown:\n"
                "{\n"
                f"  \"body_part\": \"{body_part}\",\n"
                "  \"findings\": \"<description>\",\n"
                "  \"confidence\": <float>,\n"
                "  \"annotations\": [\n"
                "    {\n"
                "      \"x\": <int>, \"y\": <int>, \"width\": <int>, \"height\": <int>,\n"
                "      \"label\": \"<string>\", \"confidence\": <float>\n"
                "    }\n"
                "  ]\n"
                "}"
            )
            
            messages = [
                {"role": "user", "content": [{"type": "image"}, {"type": "text", "text": prompt}]}
            ]
            
            try:
                text_input = processor.apply_chat_template(messages, add_generation_prompt=True)
            except Exception:
                text_input = prompt
            
            inputs = processor(
                text=text_input, 
                images=img, 
                return_tensors="pt"
            ).to(device)

            with torch.no_grad():
                outputs = model.generate(**inputs, max_new_tokens=200)
                
            input_len = inputs["input_ids"].shape[1]
            generated_tokens = outputs[0][input_len:]
            
            decoded_output = processor.decode(generated_tokens, skip_special_tokens=True)
            
            print(f"--- Diagnosis for {filename} ---")
            result_text = decoded_output.strip()
            
            output_dir = os.path.join(os.path.dirname(dcm_dir), "output")
            os.makedirs(output_dir, exist_ok=True)
            out_path = os.path.join(output_dir, filename.replace(".dcm", ".png"))
            
            extracted_boxes, slice_findings, boxes_drawn = extract_and_draw_boxes(img, result_text, out_path)
            
            if slice_findings:
                print(f"Findings: {slice_findings}")
            
            if boxes_drawn:
                print(f"Found {len(extracted_boxes)} bounding boxes. Saved to {out_path}")
                for b in extracted_boxes:
                    b['z'] = z_index
                    b['filename'] = filename
                    b['findings'] = slice_findings
                    all_detections.append(b)
            else:
                print(f"Image saved to {out_path} (no boxes found)")
            print("-" * 30)
            
        except Exception as e:
            print(f"Failed to process {filename}: {e}")

    vol_stats = None
    unique_findings = set()
    if all_detections:
        ref_img = load_dcm_as_pil(os.path.join(dcm_dir, dcm_files[0]))
        vol_width, vol_height = ref_img.size
        
        vol_stats, heatmap = extract_heatmap_volume(all_detections, vol_width, vol_height, min_heat=2)
        
        print("\n" + "="*40)
        print("HEATMAP 3D VOLUME SUMMARY")
        print("="*40)
        if vol_stats:
            print(f"Detected core pathology area with Max Overlap: {vol_stats['max_layer_overlap']} slices")
            print(f"  Z-Index Range : {vol_stats['z_min']} to {vol_stats['z_max']} ({vol_stats['slice_count']} slices contiguous bounds)")
            print(f"  3D Box (X, Y, Z): [{vol_stats['x']}, {vol_stats['y']}, {vol_stats['z_min']}]")
            print(f"  Dimensions (W, H, D): [{vol_stats['width']}, {vol_stats['height']}, {vol_stats['slice_count']}]")
            
            output_dir = os.path.join(os.path.dirname(dcm_dir), "output")
            os.makedirs(output_dir, exist_ok=True)
            if heatmap is not None:
                max_h = np.max(heatmap)
                norm_heat = (heatmap / (max_h if max_h > 0 else 1) * 255).astype(np.uint8)
                heat_img = Image.fromarray(norm_heat, mode='L')
                heat_path = os.path.join(output_dir, "heatmap_projection.png")
                heat_img.save(heat_path)
                print(f"  Heatmap saved to {heat_path}!")
        else:
             print("No major clustered anomalies found via heatmap overlapping.")
        print("="*40 + "\n")

        print("="*40)
        print("OVERALL DIAGNOSTIC RESULT")
        print("="*40)
        
        for set_det in all_detections:
            if set_det.get('findings'):
                unique_findings.add(set_det['findings'])
                
        if vol_stats:
            print(f"Pathology confirmed across {vol_stats['slice_count']} slices (Z-Range: {vol_stats['z_min']} to {vol_stats['z_max']}).")
        
        if unique_findings:
            print("\nKey Model Observations:")
            for idx, finding in enumerate(unique_findings, start=1):
                print(f" {idx}. {finding}")
        else:
            print("No specific observations aggregated.")
            
        print("="*40 + "\n")

    output_dir = os.path.join(os.path.dirname(dcm_dir), "output")
    create_gif_from_outputs(output_dir)

    return {
        "findings": list(unique_findings),
        "detections": all_detections,
        "volume_stats": vol_stats
    }

if __name__ == "__main__":
    MODEL_ID = "google/medgemma-1.5-4b-it"
    DCM_FOLDER = "./dataset"
    BODY_PART = "brain"
    
    scan_mri(MODEL_ID, DCM_FOLDER, body_part=BODY_PART)

