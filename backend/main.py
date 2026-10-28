"""
PlantCare AI – Plant Disease Detection & Crop Health Assistant
Main FastAPI Application Entrypoint
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database.connection import init_db
from .database.seed import seed_database
from .ml.model_loader import get_model_engine
from .api import (
    routes_detection,
    routes_disease,
    routes_products,
    routes_history,
    routes_weather,
    routes_advisory,
    routes_admin,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("plantcare.app")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager:
    Initializes DB, seeds baseline agronomic data, and loads the PyTorch model once on startup.
    """
    logger.info("Initializing PlantCare AI platform...")
    init_db()
    seed_database()

    # Pre-load ML model once
    engine = get_model_engine()
    status_info = engine.get_status()
    logger.info(f"ML Model Engine Status: {status_info}")

    yield

    logger.info("PlantCare AI server shutting down...")


app = FastAPI(
    title="PlantCare AI API",
    description="Deep-Learning Plant Disease Detection & Agronomic Health Advisory Platform",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Add the deployed frontend URL through Render environment variables
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    ALLOWED_ORIGINS.append(frontend_url.rstrip("/"))


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded leaf images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Modular API Routers
app.include_router(routes_detection.router)
app.include_router(routes_disease.router)
app.include_router(routes_products.router)
app.include_router(routes_history.router)
app.include_router(routes_weather.router)
app.include_router(routes_advisory.router)
app.include_router(routes_admin.router)


@app.get("/api/health", tags=["System"])
def health_check():
    """Returns system status, active ML engine configuration, and DB health."""
    engine = get_model_engine()
    return {
        "status": "online",
        "service": "PlantCare AI Backend",
        "version": "1.0.0",
        "ml_engine": engine.get_status(),
        "database": "connected",
        "features": {
            "pytorch_inference": True,
            "explainability_heatmaps": True,
            "weather_risk_analysis": True,
            "agricultural_advisory": True,
            "multilingual_ready": True,
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure raw Python stack traces are never exposed to normal users."""
    logger.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_type": "InternalServerError",
            "message": "A server-side error occurred. Please try again or contact agricultural support.",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
