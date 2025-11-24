from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from google import genai
import io
from PIL import Image
import torch

app = FastAPI()
API_KEY = "YOUR_GEMINI_API_KEY_HERE"  #add your API key here

# 2. Frontend (React) 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---load models ---
print("Loading AI Models...")

# 1. Standard Model 
try:
    model_standard = YOLO('yolov8s.pt') 
    print("✅ Standard Model (yolov8s) Loaded!")
except Exception as e:
    print(f"❌ Error loading standard model: {e}")

# 2. Custom Model 
try:
    model_custom = YOLO('best.pt') 
    print("✅ Custom Model (best.pt) Loaded!")
except Exception as e:
    print(f"⚠️ Custom model not found! Make sure 'best.pt' is in the folder.")
    model_custom = None

# 3. Gemini Client
client = genai.Client(api_key=API_KEY)


# --- 🛠️ Helper Function: IoU Calculation ---
def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    
    if (area1 + area2 - intersection) == 0: return 0
    return intersection / float(area1 + area2 - intersection)


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    final_detections = [] 
    custom_boxes = []     

    # --- 1. Custom Model Analysis ---
    if model_custom:
        # take detections from custom model
        results_cst = model_custom(image, conf=0.25) 
        for r in results_cst:
            for box in r.boxes:
                name = model_custom.names[int(box.cls[0])]
                coords = box.xyxy[0].tolist()
                
                final_detections.append(name)
                custom_boxes.append(coords)
        
    print(f"Custom Detected: {final_detections}")

    # --- 2. Standard Model Analysis (With Conflict Resolution) ---
    if model_standard:
        results_std = model_standard(image, conf=0.25)
        for r in results_std:
            for box in r.boxes:
                name = model_standard.names[int(box.cls[0])]
                std_coords = box.xyxy[0].tolist()

                # Conflict: If Standard says 'orange', we check against custom boxes
                if name == "orange":
                    is_conflict = False
                    for c_box in custom_boxes:
                        # If the two boxes overlap more than 50% (Overlap > 0.5)
                        if calculate_iou(std_coords, c_box) > 0.5:
                            is_conflict = True
                            print("⚠️ Conflict Detected! Ignoring Standard Model's 'Orange' (Trusted Custom Model)")
                            break
                    
                    if is_conflict:
                        continue # Ignore this Orange

                # If no conflict, add to the list
                final_detections.append(name)

    # --- Cleaning & Filtering ---
    unique_items = list(set(final_detections))
    
    exclude_items = [
        'person', 'bottle', 'cup', 'knife', 'fork', 'spoon', 'bowl', 
        'dining table', 'chair', 'cell phone', 'laptop', 'book', 
        'tv', 'remote', 'keyboard', 'mouse', 'vase', 'potted plant', 
        'wine glass', 'sink', 'refrigerator'
    ]

    final_items = [item for item in unique_items if item.lower() not in exclude_items]
    print(f"✅ Final List: {final_items}")

    if not final_items:
        return {"ingredients": [], "recipe": "Sorry, I couldn't detect any recognizable food items."}

    # --- 🧠 3. Gemini Logic (Professional Prompt) ---
   
    prompt = f"""
    Act as a professional gourmet chef. 
    I have these primary ingredients: {', '.join(final_items)}.
    
    You can assume I also have basic pantry staples like salt, pepper, oil, sugar, and water.
    
    Create a delicious and creative recipe using these ingredients. 
    Please format the response strictly as follows using Markdown:

    🍳 **Recipe Name:** [Insert Creative Name]
    
    ⏱️ **Prep time:** [e.g., 15 mins] | 📊 **Difficulty:** [Easy/Medium/Hard]
    
    🛒 **Ingredients Needed:**
    - [List the detected ingredients]
    - [List any additional basic staples used]

    👩‍🍳 **Instructions:**
    1. [Step 1]
    2. [Step 2]
    ...

    💡 **Chef's Tip:**
    [A short, secret tip to make this dish taste better]
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        recipe_text = response.text
    except Exception as e:
        recipe_text = f"Error generating recipe: {str(e)}"

    return {
        "ingredients": final_items,
        "recipe": recipe_text
    }