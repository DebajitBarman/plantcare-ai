"""
PlantCare AI - Treatment & Agricultural Products Routes
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..database.models import Product
from ..services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api", tags=["Supplements & Treatments"])


@router.get("/products")
def get_products(
    category: Optional[str] = Query(None, description="Fungicide, Bio-fertilizer, Micronutrient, etc."),
    crop: Optional[str] = Query(None, description="Target crop"),
    organic: Optional[str] = Query(None, description="Filter: 'Organic' or 'Chemical'"),
    search: Optional[str] = Query(None, description="Search name, active ingredient, or description"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Retrieve catalog of verified agricultural products and treatments."""
    return RecommendationService.get_all_products(
        db=db,
        category=category,
        crop=crop,
        organic_filter=organic,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/products/{product_id}")
def get_product_detail(product_id: str, db: Session = Depends(get_db)):
    """Retrieve specific product specifications and precautions."""
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")
    return prod.to_dict()


@router.get("/recommendations/disease/{disease_id}")
def get_recommendations_for_disease(
    disease_id: str,
    crop: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve treatment guidelines and linked commercial/organic products for a disease."""
    return RecommendationService.get_products_for_disease(db, disease_id, crop_name=crop)
