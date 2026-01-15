"""
Crop Recommendation API
FastAPI router for crop recommendation based on soil and climate conditions
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import joblib
import numpy as np
import os

# ============================================================================
# ROUTER SETUP
# ============================================================================

router = APIRouter(
    prefix="/api",
    tags=["Crop Recommendation"]
)

# ============================================================================
# LOAD MODELS
# ============================================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Navigate up to project root, then into models directory
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)  # Go up from backend to project root
MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "crop_recommendation_model.pkl")
SCALER_PATH = os.path.join(PROJECT_ROOT, "models", "scaler2.pkl")

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Crop recommendation model loaded successfully")
    print(f"📁 Model path: {MODEL_PATH}")
    print(f"📁 Scaler path: {SCALER_PATH}")
    MODEL_LOADED = True
except Exception as e:
    print(f"⚠️ Warning: Could not load crop recommendation model - {e}")
    print(f"❌ Attempted model path: {MODEL_PATH}")
    print(f"❌ Attempted scaler path: {SCALER_PATH}")
    model = None
    scaler = None
    MODEL_LOADED = False
    
# ============================================================================
# CROP INFORMATION DATABASE
# ============================================================================

CROP_INFO = {
    "rice": {
        "name": "Rice",
        "season": "Kharif (June-November)",
        "ideal_temp": "20-37°C",
        "ideal_rainfall": "1000-2500mm",
        "soil_type": "Clayey loam, Loamy",
        "growth_period": "3-6 months",
        "tips": [
            "Requires high water availability",
            "Best grown in flooded conditions",
            "Needs warm and humid climate"
        ]
    },
    "wheat": {
        "name": "Wheat",
        "season": "Rabi (October-April)",
        "ideal_temp": "10-25°C",
        "ideal_rainfall": "300-800mm",
        "soil_type": "Loamy, Clay loam",
        "growth_period": "4-5 months",
        "tips": [
            "Requires cool climate during growth",
            "Moderate water requirement",
            "Well-drained soil is essential"
        ]
    },
    "maize": {
        "name": "Maize",
        "season": "Kharif and Rabi",
        "ideal_temp": "18-27°C",
        "ideal_rainfall": "500-900mm",
        "soil_type": "Well-drained loamy",
        "growth_period": "3-4 months",
        "tips": [
            "Requires warm weather",
            "Moderate water requirement",
            "Good drainage is important"
        ]
    },
    "cotton": {
        "name": "Cotton",
        "season": "Kharif (April-October)",
        "ideal_temp": "21-30°C",
        "ideal_rainfall": "500-1000mm",
        "soil_type": "Black cotton soil, Alluvial",
        "growth_period": "5-6 months",
        "tips": [
            "Requires warm temperature",
            "Needs 200+ frost-free days",
            "Deep black soil is ideal"
        ]
    },
    "jute": {
        "name": "Jute",
        "season": "Kharif (March-June)",
        "ideal_temp": "24-37°C",
        "ideal_rainfall": "1500-2000mm",
        "soil_type": "Alluvial soil",
        "growth_period": "4-5 months",
        "tips": [
            "Requires high humidity",
            "Needs plenty of water",
            "Warm and moist climate is ideal"
        ]
    },
    "coconut": {
        "name": "Coconut",
        "season": "Year-round",
        "ideal_temp": "20-32°C",
        "ideal_rainfall": "1500-2500mm",
        "soil_type": "Sandy loam, Laterite",
        "growth_period": "5-6 years to first yield",
        "tips": [
            "Requires tropical climate",
            "High humidity needed",
            "Well-distributed rainfall throughout year"
        ]
    },
    "papaya": {
        "name": "Papaya",
        "season": "Year-round (tropical)",
        "ideal_temp": "22-26°C",
        "ideal_rainfall": "1000-1500mm",
        "soil_type": "Well-drained sandy loam",
        "growth_period": "9-12 months",
        "tips": [
            "Cannot tolerate waterlogging",
            "Requires warm climate",
            "Good drainage is critical"
        ]
    },
    "apple": {
        "name": "Apple",
        "season": "Year-round (temperate)",
        "ideal_temp": "15-25°C",
        "ideal_rainfall": "1000-1250mm",
        "soil_type": "Well-drained loamy",
        "growth_period": "3-4 years to first yield",
        "tips": [
            "Requires cold winter for dormancy",
            "Needs chilling hours (800-1500)",
            "Well-drained soil essential"
        ]
    }
}

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class CropRecommendationRequest(BaseModel):
    """Request model for crop recommendation"""
    N: float = Field(..., ge=0, le=200, description="Nitrogen content (kg/ha)")
    P: float = Field(..., ge=0, le=200, description="Phosphorus content (kg/ha)")
    K: float = Field(..., ge=0, le=200, description="Potassium content (kg/ha)")
    temperature: float = Field(..., ge=0, le=50, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    rainfall: float = Field(..., ge=0, le=3000, description="Rainfall (mm)")

    class Config:
        json_schema_extra = {
            "example": {
                "N": 90,
                "P": 42,
                "K": 43,
                "temperature": 20.8,
                "humidity": 82.0,
                "ph": 6.5,
                "rainfall": 202.9
            }
        }


class CropDetails(BaseModel):
    """Detailed information about a recommended crop"""
    name: str
    season: str
    ideal_temp: str
    ideal_rainfall: str
    soil_type: str
    growth_period: str
    tips: List[str]


class CropRecommendationResponse(BaseModel):
    """Response model for crop recommendation"""
    success: bool
    recommended_crop: str
    confidence: float = Field(..., description="Model confidence (0-1)")
    crop_details: CropDetails
    soil_analysis: Dict[str, Any]
    alternative_crops: List[str]
    message: str


# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/recommend-crop", response_model=CropRecommendationResponse)
async def recommend_crop(request: CropRecommendationRequest):
    """
    Recommend the best crop based on soil and climate conditions
    
    This endpoint uses a trained Random Forest model to predict the most suitable
    crop based on:
    - Soil nutrients (N, P, K)
    - Climate conditions (temperature, humidity, rainfall)
    - Soil pH
    
    **Parameters:**
    - **N**: Nitrogen content in soil (kg/ha)
    - **P**: Phosphorus content in soil (kg/ha)
    - **K**: Potassium content in soil (kg/ha)
    - **temperature**: Average temperature (°C)
    - **humidity**: Average humidity (%)
    - **ph**: Soil pH value
    - **rainfall**: Annual rainfall (mm)
    
    **Returns:**
    - Recommended crop
    - Model confidence score
    - Detailed crop information
    - Soil analysis
    - Alternative crop suggestions
    """
    
    if not MODEL_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation model not available. Please train the model first."
        )
    
    try:
        # Prepare input features
        features = np.array([[
            request.N,
            request.P,
            request.K,
            request.temperature,
            request.humidity,
            request.ph,
            request.rainfall
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Get prediction probabilities for confidence and alternatives
        probabilities = model.predict_proba(features_scaled)[0]
        confidence = float(np.max(probabilities))
        
        # Get top 3 alternative crops
        top_indices = np.argsort(probabilities)[-4:-1][::-1]  # Top 3 excluding the best
        alternative_crops = [model.classes_[i] for i in top_indices]
        
        # Get crop details
        crop_key = prediction.lower()
        crop_details = CROP_INFO.get(crop_key, {
            "name": prediction,
            "season": "Varies",
            "ideal_temp": "Check local agricultural guidelines",
            "ideal_rainfall": "Check local agricultural guidelines",
            "soil_type": "Suitable soil required",
            "growth_period": "Varies",
            "tips": ["Consult local agricultural extension officer"]
        })
        
        # Soil analysis
        soil_analysis = {
            "nitrogen_level": "High" if request.N > 100 else "Medium" if request.N > 50 else "Low",
            "phosphorus_level": "High" if request.P > 60 else "Medium" if request.P > 30 else "Low",
            "potassium_level": "High" if request.K > 60 else "Medium" if request.K > 30 else "Low",
            "ph_status": "Alkaline" if request.ph > 7.5 else "Neutral" if request.ph > 6.5 else "Acidic",
            "ph_suitability": "Suitable" if 6.0 <= request.ph <= 7.5 else "Needs adjustment",
            "moisture_level": "High" if request.rainfall > 1500 else "Medium" if request.rainfall > 500 else "Low"
        }
        
        # Generate message
        message = f"Based on your soil and climate conditions, {prediction} is highly recommended with {confidence*100:.1f}% confidence."
        
        return CropRecommendationResponse(
            success=True,
            recommended_crop=prediction,
            confidence=confidence,
            crop_details=CropDetails(**crop_details),
            soil_analysis=soil_analysis,
            alternative_crops=alternative_crops,
            message=message
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during prediction: {str(e)}"
        )


@router.get("/crop-info/{crop_name}")
async def get_crop_info(crop_name: str):
    """
    Get detailed information about a specific crop
    
    **Parameters:**
    - **crop_name**: Name of the crop (case-insensitive)
    
    **Returns:**
    - Detailed crop information including season, temperature, rainfall, etc.
    """
    
    crop_key = crop_name.lower()
    
    if crop_key in CROP_INFO:
        return {
            "success": True,
            "crop": crop_name,
            "details": CROP_INFO[crop_key]
        }
    else:
        available_crops = list(CROP_INFO.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Crop '{crop_name}' not found. Available crops: {available_crops}"
        )


@router.get("/all-crops")
async def get_all_crops():
    """
    Get information about all available crops
    
    **Returns:**
    - List of all crops with their basic information
    """
    
    crops_list = [
        {
            "name": info["name"],
            "season": info["season"],
            "key": key
        }
        for key, info in CROP_INFO.items()
    ]
    
    return {
        "success": True,
        "total_crops": len(crops_list),
        "crops": crops_list
    }


@router.get("/model-status")
async def get_model_status():
    """
    Check the status of the crop recommendation model
    
    **Returns:**
    - Model loaded status
    - Model information if available
    """
    
    if MODEL_LOADED:
        return {
            "status": "operational",
            "model_loaded": True,
            "model_type": "Random Forest Classifier",
            "features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
            "message": "Crop recommendation model is ready"
        }
    else:
        return {
            "status": "unavailable",
            "model_loaded": False,
            "message": "Model not loaded. Please train the model first by running: python ml/train_model.py"
        }