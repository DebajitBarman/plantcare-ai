"""
PlantCare AI - Disease Knowledge Base Service
Handles queries, searches, and filters for diseases and crops.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database.models import Disease, Crop
from ..ml.labels import parse_class_name


class DiseaseService:
    @staticmethod
    def get_all_crops(db: Session) -> List[Dict[str, Any]]:
        crops = db.query(Crop).order_by(Crop.name).all()
        return [c.to_dict() for c in crops]

    @staticmethod
    def get_diseases(
        db: Session,
        crop: Optional[str] = None,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        query = db.query(Disease)

        if crop and crop.lower() not in ["all", "any", ""]:
            query = query.join(Disease.crop_rel).filter(
                or_(Crop.id == crop.lower(), Crop.name.ilike(f"%{crop}%"))
            )

        if category and category.lower() not in ["all", "any", ""]:
            query = query.filter(Disease.category.ilike(f"%{category}%"))

        if severity and severity.lower() not in ["all", "any", ""]:
            query = query.filter(Disease.severity.ilike(f"%{severity}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Disease.disease_name.ilike(term),
                    Disease.scientific_name.ilike(term),
                    Disease.description.ilike(term),
                    Disease.symptoms.ilike(term),
                )
            )

        total_count = query.count()
        results = query.offset(offset).limit(limit).all()

        return {
            "total": total_count,
            "count": len(results),
            "offset": offset,
            "limit": limit,
            "diseases": [d.to_dict() for d in results],
        }

    @staticmethod
    def get_disease_by_id(db: Session, disease_id: str) -> Optional[Dict[str, Any]]:
        # Try direct match
        disease = db.query(Disease).filter(Disease.id == disease_id).first()
        if not disease:
            # Try by case insensitive or name match
            disease = db.query(Disease).filter(
                or_(
                    Disease.disease_name.ilike(disease_id.replace("_", " ")),
                    Disease.id.ilike(disease_id)
                )
            ).first()

        if disease:
            data = disease.to_dict()
            data["recommended_products"] = [p.to_dict() for p in disease.recommended_products]
            return data

        # If not in database, generate a fallback dictionary using labels mapping
        info = parse_class_name(disease_id)
        return {
            "id": disease_id,
            "disease_name": info["disease"],
            "scientific_name": info["scientific_name"],
            "crop": info["crop"],
            "crop_id": info["crop"].lower(),
            "category": info["category"],
            "severity": info["severity"],
            "is_healthy": info["is_healthy"],
            "description": f"Common agricultural plant health condition observed in {info['crop']}.",
            "symptoms": ["Visible discoloration or lesions on foliage", "Reduced vigor"],
            "causes": "Environmental stress or pathogenic inoculation.",
            "transmission": "Spreads through ambient moisture, wind, or soil contact.",
            "environmental_conditions": "Favorable temperature and humidity.",
            "treatment": "Prune affected leaves, ensure air circulation, and apply appropriate protective sprays.",
            "prevention": "Crop rotation, sanitized tools, and balanced watering.",
            "organic_treatment": "Copper or sulfur formulations, neem oil, or bio-fungicides.",
            "chemical_treatment": "Broad-spectrum contact or systemic fungicides.",
            "recommended_supplements": "Calcium and micronutrient balance.",
            "recommended_fertilizers": "Balanced NPK.",
            "active_ingredients": "Copper oxychloride, Mancozeb, Neem extract",
            "precautions": "Follow local agronomic extension guidelines.",
            "do_and_dont": {
                "dos": ["Inspect foliage weekly", "Sanitize pruning gear"],
                "donts": ["Avoid working in wet foliage", "Do not over-fertilize with nitrogen"]
            },
            "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80",
            "references": "General Plant Pathology Compendium.",
            "recommended_products": []
        }
