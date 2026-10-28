"""
PlantCare AI - Detection API Routes
Endpoint for leaf image upload, AI diagnosis, and Plant Health Report generation.
"""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..services.prediction_service import PredictionService
from ..ml.preprocessing import ImageValidationError

router = APIRouter(prefix="/api", tags=["Detection"])


@router.post("/predict")
async def predict_crop_disease(
    file: UploadFile = File(..., description="Leaf image file (JPG, JPEG, PNG, WEBP)"),
    crop: Optional[str] = Form(None, description="Optional selected crop or 'Auto Detect'"),
    location: Optional[str] = Form(None, description="Optional user farm location/region"),
    growth_stage: Optional[str] = Form(None, description="Optional crop growth stage"),
    notes: Optional[str] = Form(None, description="Optional farmer observations"),
    db: Session = Depends(get_db),
):
    """
    Receives leaf image, validates format, runs PyTorch inference, retrieves disease data,
    recommends treatments/products, logs history, and returns complete report.
    """
    try:
        file_bytes = await file.read()
        report = PredictionService.process_and_diagnose(
            file_bytes=file_bytes,
            filename=file.filename or "upload.jpg",
            db=db,
            crop_hint=crop,
            location=location,
            growth_stage=growth_stage,
            notes=notes,
        )
        return report
    except ImageValidationError as ive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_type": "ImageValidationError", "message": str(ive)},
        )
    except Exception as e:
        # Never expose raw python stack trace to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_type": "PredictionProcessingError",
                "message": "An unexpected error occurred while analyzing the leaf image. Please check image quality and try again.",
                "debug": str(e),
            },
        )
