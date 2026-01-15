"""
AgriShield FastAPI Backend
Crop Failure Risk Prediction API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import pickle
from disease import router as disease_router
from crop_recommendation_api import router as crop_recommendation_router    


# Import prediction function from predict.py
from predict import predict_crop_failure, crop_list, state_list, district_list

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="AgriShield API",
    description="Crop Failure Risk Prediction System using Machine Learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================================
# CORS MIDDLEWARE
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # React default
        "http://localhost:8000",  # FastAPI default
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(disease_router)
app.include_router(crop_recommendation_router)
# ============================================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================

class RiskPredictionRequest(BaseModel):
    """Request model for crop failure risk prediction"""
    crop: str = Field(..., description="Crop name (e.g., Rice, Wheat, Cotton)")
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    season: str = Field(..., description="Season (Kharif, Rabi, Summer, Whole Year)")
    temperature: float = Field(..., description="Average temperature in Celsius", ge=-10, le=50)
    rainfall: float = Field(..., description="Total expected rainfall in mm", ge=0, le=5000)
    humidity: float = Field(..., description="Average humidity percentage", ge=0, le=100)
    disaster_occurred: int = Field(0, description="Disaster occurrence (0=No, 1=Yes)", ge=0, le=1)
    
    class Config:
        schema_extra = {
            "example": {
                "crop": "Rice",
                "state": "Punjab",
                "district": "Punjab",
                "season": "Kharif",
                "temperature": 28.0,
                "rainfall": 1200.0,
                "humidity": 75.0,
                "disaster_occurred": 0
            }
        }


class DistrictInfo(BaseModel):
    """District information model"""
    soil_type: str
    soil_quality: float
    state: str
    district: str


class RiskPredictionResponse(BaseModel):
    """Response model for crop failure risk prediction"""
    risk_score: float = Field(..., description="Risk score percentage (0-100)")
    risk_level: str = Field(..., description="Risk level (Low, Medium, High)")
    color: str = Field(..., description="Color code (green, orange, red)")
    explanation: str = Field(..., description="Detailed explanation of risk factors")
    recommendations: list = Field(..., description="List of actionable recommendations")
    district_info: DistrictInfo = Field(..., description="District soil information")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to AgriShield API",
        "description": "Crop Failure Risk Prediction System",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "prediction": "POST /api/predict-risk",
            "health": "GET /api/health",
            "crops": "GET /api/crops",
            "states": "GET /api/states",
            "districts": "GET /api/districts",
            "documentation": "GET /docs"
        }
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AgriShield Risk Prediction API",
        "version": "1.0.0",
        "model_loaded": True
    }


@app.get("/api/crops", tags=["Data"])
def get_crops():
    """Get list of available crops"""
    return {
        "crops": crop_list,
        "count": len(crop_list),
        "message": "Available crops for prediction"
    }


@app.get("/api/states", tags=["Data"])
def get_states():
    """Get list of available states"""
    return {
        "states": state_list,
        "count": len(state_list),
        "message": "Available states for prediction"
    }


@app.get("/api/districts", tags=["Data"])
def get_districts(limit: Optional[int] = 100):
    """Get list of available districts"""
    return {
        "districts": district_list[:limit],
        "total_count": len(district_list),
        "showing": min(limit, len(district_list)),
        "message": "Available districts for prediction"
    }


@app.post("/api/predict-risk", response_model=RiskPredictionResponse, tags=["Prediction"])
def predict_risk(request: RiskPredictionRequest):
    """
    Predict crop failure risk based on input parameters
    
    This endpoint accepts crop, location, season, and weather data to predict
    the risk of crop failure using a trained machine learning model.
    
    **Parameters:**
    - **crop**: Name of the crop (must be from available crops list)
    - **state**: State name (must be from available states list)
    - **district**: District name
    - **season**: Growing season (Kharif, Rabi, Summer, Whole Year)
    - **temperature**: Average expected temperature in Celsius
    - **rainfall**: Total expected rainfall in mm
    - **humidity**: Average expected humidity percentage
    - **disaster_occurred**: Whether a disaster occurred (0=No, 1=Yes)
    
    **Returns:**
    - Risk score (0-100%)
    - Risk level (Low/Medium/High)
    - Detailed explanation
    - Actionable recommendations
    - District soil information
    """
    
    try:
        # Call prediction function
        result = predict_crop_failure(
            crop=request.crop,
            state=request.state,
            district=request.district,
            season=request.season,
            temperature=request.temperature,
            rainfall=request.rainfall,
            humidity=request.humidity,
            disaster_occurred=request.disaster_occurred
        )
        
        # Check for errors
        if 'error' in result:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": result['error'],
                    "available_crops": result.get('available_crops', []),
                    "available_states": result.get('available_states', [])
                }
            )
        
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Validation error: {str(e)}"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/info", tags=["Information"])
def get_api_info():
    """Get detailed API information"""
    return {
        "api_name": "AgriShield Crop Failure Risk Prediction API",
        "version": "1.0.0",
        "description": "AI-powered crop failure risk assessment system",
        "features": [
            "Crop failure risk prediction",
            "Multi-crop support",
            "State and district level predictions",
            "Weather-based risk assessment",
            "Disaster impact analysis",
            "Actionable recommendations"
        ],
        "technology": {
            "framework": "FastAPI",
            "ml_library": "scikit-learn",
            "model_type": "Classification",
            "python_version": "3.8+"
        },
        "data_sources": [
            "Government crop production data",
            "Historical weather data",
            "Disaster records",
            "Soil quality data"
        ],
        "supported_crops": len(crop_list),
        "supported_states": len(state_list),
        "supported_districts": len(district_list)
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return {
        "error": "Endpoint not found",
        "message": f"The endpoint {request.url.path} does not exist",
        "available_endpoints": [
            "/",
            "/api/health",
            "/api/predict-risk",
            "/api/crops",
            "/api/states",
            "/api/districts",
            "/docs"
        ]
    }


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    return {
        "error": "Internal server error",
        "message": "An unexpected error occurred. Please try again later.",
        "contact": "support@agrishield.com"
    }


# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("\n" + "="*80)
    print(" "*25 + "AGRISHIELD API SERVER")
    print(" "*30 + "Starting...")
    print("="*80)
    print(f"\n✅ API Version: 1.0.0")
    print(f"✅ Models loaded successfully")
    print(f"✅ Supported Crops: {len(crop_list)}")
    print(f"✅ Supported States: {len(state_list)}")
    print(f"✅ Supported Districts: {len(district_list)}")
    print(f"\n📖 API Documentation: http://localhost:8000/docs")
    print(f"🔗 API Base URL: http://localhost:8000")
    print("\n" + "="*80 + "\n")


# ============================================================================
# MAIN (for running with uvicorn directly)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )