"""
PlantCare AI - Disease & Crop Knowledge Base Routes
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..services.disease_service import DiseaseService

router = APIRouter(prefix="/api", tags=["Disease Knowledge Base"])


@router.get("/crops")
def get_supported_crops(db: Session = Depends(get_db)):
    """List all supported crops with taxonomy and descriptions."""
    crops = DiseaseService.get_all_crops(db)
    return {"crops": crops, "total": len(crops)}


@router.get("/diseases")
def get_diseases(
    crop: Optional[str] = Query(None, description="Filter by crop name or id"),
    category: Optional[str] = Query(None, description="Filter by category (Fungal, Bacterial, Viral, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    search: Optional[str] = Query(None, description="Search keyword in disease name or symptoms"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Search and filter diseases in the knowledge base."""
    return DiseaseService.get_diseases(
        db=db,
        crop=crop,
        category=category,
        severity=severity,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/diseases/{disease_id}")
def get_disease_detail(disease_id: str, db: Session = Depends(get_db)):
    """Retrieve full agronomic profile and recommended products for a disease."""
    disease = DiseaseService.get_disease_by_id(db, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease profile not found.")
    return disease
