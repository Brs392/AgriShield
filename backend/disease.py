from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import numpy as np
import tensorflow as tf
import io

router = APIRouter(
    prefix="/api",
    tags=["Disease Detection"]
)

# Load model once
model = tf.keras.models.load_model("../models/final_cnn_plant_disease.h5")

CLASS_NAMES = [
    'Pepper__bell___Bacterial_spot',
    'Pepper__bell___healthy',
    'Potato___Early_blight',
    'Potato___healthy',
    'Potato___Late_blight',
    'Tomato__Target_Spot',
    'Tomato__Tomato_mosaic_virus',
    'Tomato__Tomato_YellowLeaf__Curl_Virus',
    'Tomato_Bacterial_spot',
    'Tomato_Early_blight',
    'Tomato_healthy',
    'Tomato_Late_blight',
    'Tomato_Leaf_Mold',
    'Tomato_Septoria_leaf_spot',
    'Tomato_Spider_mites_Two_spotted_spider_mite'
]

def preprocess_image(image):
    image = image.resize((128, 128))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@router.post("/detect-disease")
async def detect_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")

    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    img = preprocess_image(image)

    preds = model.predict(img)
    idx = int(np.argmax(preds))
    confidence = float(np.max(preds))

    return {
        "disease": CLASS_NAMES[idx],
        "confidence": f"{confidence * 100:.2f}%"
    }
