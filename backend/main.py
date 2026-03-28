from fastapi import FastAPI, HTTPException
from ultralytics import YOLO
from pathlib import Path
import cv2
import base64
from pydantic import BaseModel, Field
import random 
app = FastAPI()

# Load model once 
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = (BASE_DIR / "../train8/weights/best.pt").resolve()
NAMES = ["Baton", "Pliers", "Hammer", "Powerbank", "Scissors", "Wrench", "Gun", "Bullet", "Sprayer", "HandCuffs", "Knife", "Lighter"]

model = YOLO(str(MODEL_PATH))   

@app.get("/")
def root():
    return {"Hello": "World"}


# This route returns a random image from the eval dataset 
@app.get("/image")
def image_route():
    img_path = random.choice(list((BASE_DIR / "../data/images/val").iterdir()))
    
    # Read and encode image to base64
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    return {
        "img_id": img_path.stem,  # "PID_xray_00001" (filename without extension)
        "image": base64.b64encode(img_bytes).decode("utf-8")
    }


# This route delivers the model prediction to the client based on the image id the client wants

class PredictRequest(BaseModel):
    img_id: str
    confidence: float = Field(default=0.4, gt=0, le=1) # Make sure confidence is in a valid range

# Get ground truth boxes so the client can add them to the image when we send em back
# Because I don't want to send a super long response with 2 images' worth of bytes
# And the client already has the image
def get_ground_truth(img_id):
    label_path = BASE_DIR / f"../data/labels/val/{img_id}.txt"
    
    if not label_path.exists():
        raise HTTPException(status_code=404, detail=f"Label file for {img_id} not found")

    image_path = BASE_DIR / f"../data/images/val/{img_id}.jpg"
    img = cv2.imread(str(image_path))
    img_h, img_w = img.shape[:2]

    boxes = []
    with open(label_path, "r") as f:
        for line in f.readlines():
            cls, x_c, y_c, w, h = [float(i) for i in line.split()]
            x1 = int((x_c - w / 2) * img_w)
            y1 = int((y_c - h / 2) * img_h)
            x2 = int((x_c + w / 2) * img_w)
            y2 = int((y_c + h / 2) * img_h)
            boxes.append({
                "label": NAMES[int(cls)],  
                "bbox": [x1, y1, x2, y2]
            })
    return boxes

@app.post("/predict")
def predict_route(request: PredictRequest):

    image_path = BASE_DIR / f"../data/images/val/{request.img_id}.jpg"

    # Checks
    # Image ID exists
    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"Image {request.img_id} not found in eval dataset")

    model = YOLO(MODEL_PATH)
    results = model.predict(source=str(image_path), conf=request.confidence)

    # Model didn't return any results
    if not results or len(results) == 0:
        raise HTTPException(status_code=500, detail="Model returned no results")
    
    annotated_frame = results[0].plot()
    _, buffer = cv2.imencode(".jpg", annotated_frame)

    # Image encoding failed
    if buffer is None:
        raise HTTPException(status_code=500, detail="Failed to encode annotated image")

    jpg_bytes = buffer.tobytes()
    result = results[0]

    detections = []
    for box in result.boxes:
        detections.append({
            "label": result.names[int(box.cls)],
            "confidence": float(box.conf),
            "bbox": box.xyxy[0].tolist()
        })


    # Need the bbox label to return as well so we can see the correct answer
    # simple dict return that auto gets jsonified
    return {
        "image": base64.b64encode(jpg_bytes).decode("utf-8"),
        "detections": detections,
        "ground_truth": get_ground_truth(request.img_id)
    }

    # JSONResponse in case of status headers, but for testing we'll use the first one for now
    return JSONResponse(content={
        "image": base64.b64encode(jpg_bytes).decode("utf-8"),
        "detections": detections
    }, status_code=200)
