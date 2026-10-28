"""
PlantCare AI - Complete Prediction & Diagnostic Orchestration Service
Orchestrates image validation, ML inference, DB enrichment, recommendations, and persistence.
"""

import json
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from ..ml.preprocessing import validate_image_bytes, load_image_rgb, ImageValidationError
from ..ml.predictor import predict_leaf_image
from ..database.models import PredictionRecord
from .storage_service import storage_service
from .disease_service import DiseaseService
from .recommendation_service import RecommendationService
from .weather_service import weather_service

logger = logging.getLogger("plantcare.services.prediction")


class PredictionService:
    @staticmethod
    def process_and_diagnose(
        file_bytes: bytes,
        filename: str,
        db: Session,
        crop_hint: Optional[str] = None,
        location: Optional[str] = None,
        growth_stage: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        End-to-end processing pipeline:
        1. Validate format & integrity
        2. Preprocess & run PyTorch inference
        3. Persist image safely
        4. Query database for scientific disease profile
        5. Query treatment & supplement recommendations
        6. Calculate environmental risk context
        7. Persist to scan history
        8. Return comprehensive Plant Health Report
        """
        # Step 1: Validate image
        validate_image_bytes(file_bytes, filename)

        # Step 2: Load PIL image (RGB)
        pil_image = load_image_rgb(file_bytes)

        # Step 3: Run PyTorch inference
        prediction_result = predict_leaf_image(
            image=pil_image,
            crop_hint=crop_hint,
            generate_heatmap=True,
        )

        # Step 4: Save image locally
        image_url, local_path, saved_filename = storage_service.save_image(pil_image, filename)

        # Step 5: Retrieve disease details from database
        class_id = prediction_result["class_id"]
        crop_name = prediction_result["crop"]
        disease_info = DiseaseService.get_disease_by_id(db, class_id)

        # Step 6: Retrieve treatment & product recommendations
        recommendations = RecommendationService.get_products_for_disease(db, class_id, crop_name)

        # Step 7: Calculate environmental risk context (weather integration)
        weather_risk = weather_service.get_risk_for_location(location or "Default Region", crop=crop_name)

        # Step 8: Persist prediction to database
        history_record = PredictionRecord(
            image_path=image_url,
            image_filename=saved_filename,
            detected_crop=crop_name,
            detected_disease=prediction_result["disease"],
            class_id=class_id,
            confidence=prediction_result["confidence"],
            confidence_level=prediction_result["confidence_level"],
            severity=prediction_result["severity"],
            is_demo_mode=prediction_result["is_demo_mode"],
            location=location,
            growth_stage=growth_stage,
            notes=notes,
            top_predictions_json=json.dumps(prediction_result["top_predictions"]),
        )
        db.add(history_record)
        db.commit()
        db.refresh(history_record)

        # Step 9: Assemble final Plant Health Report
        return {
            "success": True,
            "report_id": history_record.id,
            "created_at": history_record.created_at.isoformat(),
            "image": {
                "url": image_url,
                "filename": saved_filename,
                "heatmap_overlay": prediction_result["heatmap_overlay"],
            },
            "meta": {
                "location": location,
                "growth_stage": growth_stage,
                "notes": notes,
                "crop_hint": crop_hint,
            },
            "prediction": {
                "crop": crop_name,
                "disease": prediction_result["disease"],
                "scientific_name": prediction_result["scientific_name"],
                "class_id": class_id,
                "category": prediction_result["category"],
                "severity": prediction_result["severity"],
                "is_healthy": prediction_result["is_healthy"],
                "confidence": prediction_result["confidence"],
                "confidence_percent": prediction_result["confidence_percent"],
                "confidence_level": prediction_result["confidence_level"],
                "confidence_message": prediction_result["confidence_message"],
                "is_demo_mode": prediction_result["is_demo_mode"],
                "model_architecture": prediction_result["model_architecture"],
            },
            "top_predictions": prediction_result["top_predictions"],
            "disease_info": disease_info,
            "recommendations": recommendations,
            "weather_risk": weather_risk,
        }
