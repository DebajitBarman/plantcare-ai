"""
PlantCare AI - Database ORM Models (SQLAlchemy)
PostgreSQL-compatible, SQLite-supported schema.
"""

from datetime import datetime
import json
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Association table for Many-to-Many relationship between Diseases and Recommended Products
disease_product_association = Table(
    "disease_product_association",
    Base.metadata,
    Column("disease_id", String(100), ForeignKey("diseases.id", ondelete="CASCADE"), primary_key=True),
    Column("product_id", String(100), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
)


class Crop(Base):
    __tablename__ = "crops"

    id = Column(String(50), primary_key=True)  # e.g., "tomato", "potato"
    name = Column(String(100), nullable=False, unique=True)
    scientific_name = Column(String(150), nullable=True)
    family = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="Sprout")

    diseases = relationship("Disease", back_populates="crop_rel", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "scientific_name": self.scientific_name,
            "family": self.family,
            "description": self.description,
            "icon_name": self.icon_name,
        }


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(String(100), primary_key=True)  # matches class_id or slug e.g. "Tomato___Early_blight"
    disease_name = Column(String(150), nullable=False)
    scientific_name = Column(String(150), nullable=True)
    crop_id = Column(String(50), ForeignKey("crops.id"), nullable=False)
    category = Column(String(50), nullable=False)  # Fungal, Bacterial, Viral, Pest, Oomycete, Healthy
    severity = Column(String(30), nullable=False)  # None, Low, Moderate, High, Severe, Critical
    is_healthy = Column(Boolean, default=False)
    
    description = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=False)  # JSON or newline-separated strings
    causes = Column(Text, nullable=False)
    transmission = Column(Text, nullable=True)
    environmental_conditions = Column(Text, nullable=True)
    
    treatment = Column(Text, nullable=False)
    prevention = Column(Text, nullable=False)
    organic_treatment = Column(Text, nullable=True)
    chemical_treatment = Column(Text, nullable=True)
    
    recommended_supplements = Column(Text, nullable=True)
    recommended_fertilizers = Column(Text, nullable=True)
    active_ingredients = Column(Text, nullable=True)
    precautions = Column(Text, nullable=True)
    do_and_dont = Column(Text, nullable=True)  # JSON string with "dos" and "donts" lists
    image_url = Column(String(300), nullable=True)
    references = Column(Text, nullable=True)

    crop_rel = relationship("Crop", back_populates="diseases")
    recommended_products = relationship(
        "Product",
        secondary=disease_product_association,
        back_populates="recommended_for_diseases",
    )

    def to_dict(self):
        # Parse JSON fields safely
        try:
            symptoms_list = json.loads(self.symptoms) if self.symptoms.startswith("[") else [s.strip("- ") for s in self.symptoms.split("\n") if s.strip()]
        except Exception:
            symptoms_list = [self.symptoms]

        try:
            do_dont_dict = json.loads(self.do_and_dont) if self.do_and_dont and self.do_and_dont.startswith("{") else {"dos": [], "donts": []}
        except Exception:
            do_dont_dict = {"dos": [], "donts": []}

        return {
            "id": self.id,
            "disease_name": self.disease_name,
            "scientific_name": self.scientific_name,
            "crop": self.crop_rel.name if self.crop_rel else self.crop_id,
            "crop_id": self.crop_id,
            "category": self.category,
            "severity": self.severity,
            "is_healthy": self.is_healthy,
            "description": self.description,
            "symptoms": symptoms_list,
            "causes": self.causes,
            "transmission": self.transmission,
            "environmental_conditions": self.environmental_conditions,
            "treatment": self.treatment,
            "prevention": self.prevention,
            "organic_treatment": self.organic_treatment,
            "chemical_treatment": self.chemical_treatment,
            "recommended_supplements": self.recommended_supplements,
            "recommended_fertilizers": self.recommended_fertilizers,
            "active_ingredients": self.active_ingredients,
            "precautions": self.precautions,
            "do_and_dont": do_dont_dict,
            "image_url": self.image_url,
            "references": self.references,
        }


class Product(Base):
    __tablename__ = "products"

    id = Column(String(100), primary_key=True)  # e.g., "prod-copper-fungicide-50"
    product_name = Column(String(150), nullable=False)
    category = Column(String(60), nullable=False)  # Fungicide, Bio-fertilizer, Micronutrient, Insecticide, etc.
    crop = Column(String(100), nullable=True)  # Targeted crop or "All Crops"
    purpose = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    active_ingredient = Column(String(150), nullable=True)
    usage_information = Column(Text, nullable=True)
    precaution = Column(Text, nullable=True)
    organic_or_chemical = Column(String(30), default="Chemical")  # "Organic" or "Chemical" or "Biological"
    manufacturer = Column(String(120), nullable=True)
    image_url = Column(String(300), nullable=True)
    purchase_url = Column(String(300), nullable=True)

    recommended_for_diseases = relationship(
        "Disease",
        secondary=disease_product_association,
        back_populates="recommended_products",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "product_name": self.product_name,
            "category": self.category,
            "crop": self.crop,
            "purpose": self.purpose,
            "description": self.description,
            "active_ingredient": self.active_ingredient,
            "usage_information": self.usage_information,
            "precaution": self.precaution,
            "organic_or_chemical": self.organic_or_chemical,
            "manufacturer": self.manufacturer,
            "image_url": self.image_url,
            "purchase_url": self.purchase_url,
        }


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    image_path = Column(String(300), nullable=False)
    image_filename = Column(String(150), nullable=False)
    detected_crop = Column(String(100), nullable=False)
    detected_disease = Column(String(150), nullable=False)
    class_id = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    confidence_level = Column(String(30), nullable=False)
    severity = Column(String(30), nullable=False)
    is_demo_mode = Column(Boolean, default=False)
    location = Column(String(150), nullable=True)
    growth_stage = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    top_predictions_json = Column(Text, nullable=True)

    def to_dict(self):
        try:
            top_preds = json.loads(self.top_predictions_json) if self.top_predictions_json else []
        except Exception:
            top_preds = []

        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "image_path": self.image_path,
            "image_filename": self.image_filename,
            "crop": self.detected_crop,
            "disease": self.detected_disease,
            "class_id": self.class_id,
            "confidence": round(self.confidence, 4),
            "confidence_percent": f"{self.confidence * 100:.1f}%",
            "confidence_level": self.confidence_level,
            "severity": self.severity,
            "is_demo_mode": self.is_demo_mode,
            "location": self.location,
            "growth_stage": self.growth_stage,
            "notes": self.notes,
            "top_predictions": top_preds,
        }


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(30), default="farmer")  # "farmer", "agronomist", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
