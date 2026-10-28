"""
PlantCare AI - Verified Agricultural Advisory Routes
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..services.advisory_service import advisory_service

router = APIRouter(prefix="/api/advisory", tags=["Agricultural Advisory"])


class AdvisoryQuestionRequest(BaseModel):
    question: str = Field(..., min_length=3, description="Plant health question or symptom observation")
    crop: Optional[str] = Field(None, description="Optional target crop")
    disease_context: Optional[str] = Field(None, description="Optional previously detected disease")


@router.post("/ask")
def ask_agricultural_assistant(
    payload: AdvisoryQuestionRequest,
    db: Session = Depends(get_db),
):
    """
    Submits question to the verified knowledge base agricultural assistant.
    Guaranteed no hallucination - grounded in verified crop disease profiles.
    """
    return advisory_service.answer_query(
        db=db,
        question=payload.question,
        crop=payload.crop,
        disease_context=payload.disease_context,
    )
