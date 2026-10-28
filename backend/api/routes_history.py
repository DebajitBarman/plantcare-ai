"""
PlantCare AI - Scan History & Analytics Dashboard Routes
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from ..database.connection import get_db
from ..database.models import PredictionRecord
from ..services.disease_service import DiseaseService
from ..services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/history", tags=["History & Analytics"])


@router.get("")
def get_scan_history(
    crop: Optional[str] = Query(None, description="Filter by crop"),
    disease: Optional[str] = Query(None, description="Filter by disease"),
    search: Optional[str] = Query(None, description="Search term"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Retrieve history of past leaf diagnoses."""
    query = db.query(PredictionRecord)

    if crop and crop.lower() not in ["all", "any", ""]:
        query = query.filter(PredictionRecord.detected_crop.ilike(f"%{crop}%"))

    if disease and disease.lower() not in ["all", "any", ""]:
        query = query.filter(PredictionRecord.detected_disease.ilike(f"%{disease}%"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PredictionRecord.detected_crop.ilike(term),
                PredictionRecord.detected_disease.ilike(term),
                PredictionRecord.location.ilike(term),
                PredictionRecord.notes.ilike(term),
            )
        )

    total = query.count()
    records = query.order_by(desc(PredictionRecord.created_at)).offset(offset).limit(limit).all()

    return {
        "total": total,
        "count": len(records),
        "offset": offset,
        "limit": limit,
        "history": [r.to_dict() for r in records],
    }


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Aggregate analytics for farm health monitoring dashboard."""
    total_scans = db.query(PredictionRecord).count()
    healthy_scans = db.query(PredictionRecord).filter(PredictionRecord.detected_disease.ilike("%healthy%")).count()
    diseased_scans = total_scans - healthy_scans

    # Most detected crop
    top_crop_row = (
        db.query(PredictionRecord.detected_crop, func.count(PredictionRecord.id).label("count"))
        .group_by(PredictionRecord.detected_crop)
        .order_by(desc("count"))
        .first()
    )
    most_detected_crop = top_crop_row[0] if top_crop_row else "None"

    # Crop distribution
    crop_dist = (
        db.query(PredictionRecord.detected_crop, func.count(PredictionRecord.id))
        .group_by(PredictionRecord.detected_crop)
        .all()
    )
    crop_chart_data = [{"name": c[0], "value": c[1]} for c in crop_dist]

    # Disease distribution
    disease_dist = (
        db.query(PredictionRecord.detected_disease, func.count(PredictionRecord.id))
        .group_by(PredictionRecord.detected_disease)
        .order_by(desc(func.count(PredictionRecord.id)))
        .limit(8)
        .all()
    )
    disease_chart_data = [{"name": d[0], "count": d[1]} for d in disease_dist]

    # Severity distribution
    severity_dist = (
        db.query(PredictionRecord.severity, func.count(PredictionRecord.id))
        .group_by(PredictionRecord.severity)
        .all()
    )
    severity_chart_data = [{"severity": s[0], "count": s[1]} for s in severity_dist]

    # Recent scans
    recent = (
        db.query(PredictionRecord)
        .order_by(desc(PredictionRecord.created_at))
        .limit(5)
        .all()
    )

    return {
        "total_scans": total_scans,
        "diseases_detected": diseased_scans,
        "healthy_plants": healthy_scans,
        "most_detected_crop": most_detected_crop,
        "crop_distribution": crop_chart_data,
        "disease_distribution": disease_chart_data,
        "severity_distribution": severity_chart_data,
        "recent_scans": [r.to_dict() for r in recent],
    }


@router.get("/{record_id}")
def get_history_detail(record_id: int, db: Session = Depends(get_db)):
    """Retrieve full report for an individual previous scan."""
    record = db.query(PredictionRecord).filter(PredictionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    rec_data = record.to_dict()
    # Enrich with latest disease details and product recommendations
    disease_info = DiseaseService.get_disease_by_id(db, record.class_id)
    recommendations = RecommendationService.get_products_for_disease(db, record.class_id, record.detected_crop)

    return {
        "record": rec_data,
        "disease_info": disease_info,
        "recommendations": recommendations,
    }


@router.delete("/{record_id}")
def delete_history_record(record_id: int, db: Session = Depends(get_db)):
    """Remove a scan record from history."""
    record = db.query(PredictionRecord).filter(PredictionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Scan record {record_id} deleted."}
