"""
PlantCare AI - Admin Management API Routes
Secured architecture for managing crops, diseases, and agricultural supplements.
"""

import os
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..database.models import Disease, Product, Crop

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

ADMIN_SECRET_KEY = os.getenv("ADMIN_API_KEY", "plantcare-admin-secret-2026")


def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    """Verifies that the caller has valid administrative privileges."""
    if not x_admin_key or x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Valid X-Admin-Key header required for administrative actions.",
        )
    return True


class DiseaseCreateUpdateSchema(BaseModel):
    id: str
    disease_name: str
    scientific_name: Optional[str] = None
    crop_id: str
    category: str
    severity: str
    description: str
    symptoms: str
    causes: str
    transmission: Optional[str] = None
    environmental_conditions: Optional[str] = None
    treatment: str
    prevention: str
    organic_treatment: Optional[str] = None
    chemical_treatment: Optional[str] = None
    recommended_supplements: Optional[str] = None
    recommended_fertilizers: Optional[str] = None
    active_ingredients: Optional[str] = None
    precautions: Optional[str] = None
    do_and_dont: Optional[str] = None
    image_url: Optional[str] = None
    references: Optional[str] = None


class ProductCreateUpdateSchema(BaseModel):
    id: str
    product_name: str
    category: str
    crop: Optional[str] = "All Crops"
    purpose: str
    description: str
    active_ingredient: Optional[str] = None
    usage_information: Optional[str] = None
    precaution: Optional[str] = None
    organic_or_chemical: Optional[str] = "Chemical"
    manufacturer: Optional[str] = None
    image_url: Optional[str] = None
    purchase_url: Optional[str] = None


@router.post("/diseases", dependencies=[Depends(verify_admin_key)])
def create_or_update_disease(data: DiseaseCreateUpdateSchema, db: Session = Depends(get_db)):
    """Add or update a disease profile in the knowledge base."""
    existing = db.query(Disease).filter(Disease.id == data.id).first()
    if existing:
        for k, v in data.dict().items():
            setattr(existing, k, v)
        db.commit()
        return {"success": True, "message": f"Updated disease {data.id}", "disease": existing.to_dict()}
    
    new_disease = Disease(**data.dict())
    db.add(new_disease)
    db.commit()
    return {"success": True, "message": f"Created disease {data.id}", "disease": new_disease.to_dict()}


@router.post("/products", dependencies=[Depends(verify_admin_key)])
def create_or_update_product(data: ProductCreateUpdateSchema, db: Session = Depends(get_db)):
    """Add or update an agricultural supplement or treatment product."""
    existing = db.query(Product).filter(Product.id == data.id).first()
    if existing:
        for k, v in data.dict().items():
            setattr(existing, k, v)
        db.commit()
        return {"success": True, "message": f"Updated product {data.id}", "product": existing.to_dict()}

    new_prod = Product(**data.dict())
    db.add(new_prod)
    db.commit()
    return {"success": True, "message": f"Created product {data.id}", "product": new_prod.to_dict()}
