"""
PlantCare AI - Agronomic Treatment & Supplement Recommendation Service
Connects Disease -> Agronomic Treatments -> Recommended Products (Commercial & Organic)
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database.models import Product, Disease


class RecommendationService:
    @staticmethod
    def get_products_for_disease(db: Session, disease_id: str, crop_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieves recommended products, dividing them into organic and chemical options.
        Maintains strict separation between treatment guidelines and commercial recommendations.
        """
        disease = db.query(Disease).filter(Disease.id == disease_id).first()
        linked_products: List[Product] = []

        if disease and disease.recommended_products:
            linked_products = disease.recommended_products
        else:
            # Fallback search by crop and category
            query = db.query(Product)
            if crop_name:
                query = query.filter(
                    or_(
                        Product.crop.ilike(f"%{crop_name}%"),
                        Product.crop.ilike("%all crops%"),
                        Product.crop.is_(None)
                    )
                )
            linked_products = query.limit(4).all()

        organic_options = [p.to_dict() for p in linked_products if p.organic_or_chemical.lower() == "organic"]
        chemical_options = [p.to_dict() for p in linked_products if p.organic_or_chemical.lower() != "organic"]

        # Ensure we always provide at least organic options if empty
        if not organic_options:
            general_organic = db.query(Product).filter(Product.organic_or_chemical == "Organic").limit(2).all()
            organic_options = [p.to_dict() for p in general_organic]

        return {
            "disclaimer": "Commercial product listings are informational recommendations only. Always verify local pesticide registrations, adhere strictly to product labels, and consult with a local agronomy extension service.",
            "total_recommended": len(linked_products),
            "organic_options": organic_options,
            "chemical_options": chemical_options,
            "all_products": [p.to_dict() for p in linked_products],
        }

    @staticmethod
    def get_all_products(
        db: Session,
        category: Optional[str] = None,
        crop: Optional[str] = None,
        organic_filter: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        query = db.query(Product)

        if category and category.lower() not in ["all", "any", ""]:
            query = query.filter(Product.category.ilike(f"%{category}%"))

        if crop and crop.lower() not in ["all", "any", ""]:
            query = query.filter(
                or_(
                    Product.crop.ilike(f"%{crop}%"),
                    Product.crop.ilike("%all crops%")
                )
            )

        if organic_filter and organic_filter.lower() not in ["all", "any", ""]:
            query = query.filter(Product.organic_or_chemical.ilike(f"%{organic_filter}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.product_name.ilike(term),
                    Product.active_ingredient.ilike(term),
                    Product.purpose.ilike(term),
                    Product.description.ilike(term),
                )
            )

        total = query.count()
        products = query.offset(offset).limit(limit).all()

        return {
            "total": total,
            "count": len(products),
            "offset": offset,
            "limit": limit,
            "products": [p.to_dict() for p in products],
        }
