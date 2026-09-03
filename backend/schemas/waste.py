"""
schemas/waste.py — Pydantic v2 models for waste submission endpoints.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ─── Gemini Analysis Result (internal) ───────────────────────────────────────

class GeminiAnalysisResult(BaseModel):
    """Structured output returned by Gemini Vision analysis."""
    waste_type: str = Field(description="Detected waste category, e.g. 'E-Waste', 'Plastic'")
    hazard_level: int = Field(ge=1, le=5, description="Toxicity level 1 (safe) to 5 (highly hazardous)")
    confidence: float = Field(ge=0.0, le=1.0, description="Gemini analysis confidence score")
    is_stock_photo: bool = Field(description="True if Gemini suspects a stock/internet image")
    notes: Optional[str] = Field(default=None, description="Any additional Gemini observations")


# ─── Request Models ───────────────────────────────────────────────────────────

class TextInputRequest(BaseModel):
    """
    Sent by client when Gemini confidence < threshold.
    User provides manual description to help classification.
    """
    submission_id: UUID
    description: str = Field(
        min_length=10,
        max_length=1000,
        description="User's text description of the waste item",
    )

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Description cannot be blank.")
        return v.strip()


# ─── Response Models ──────────────────────────────────────────────────────────

class EnvironmentalImpact(BaseModel):
    current_burden: dict[str, Any] = Field(
        description="Current environmental burden metrics (soil toxicity, landfill, etc.)"
    )
    future_risk: dict[str, Any] = Field(
        description="50-year future risk projections (microplastics, decay, etc.)"
    )


class WasteSubmitResponse(BaseModel):
    """Full response returned after processing a waste image submission."""
    submission_id: UUID
    status: str = Field(description="'pending_text_input' | 'verified' | 'rejected'")
    waste_type: Optional[str] = None
    hazard_level: Optional[int] = None
    gemini_confidence: Optional[float] = None
    is_stock_photo: bool = False
    perceptual_hash: str
    image_url: str
    environmental_impact: Optional[EnvironmentalImpact] = None
    industrial_workflow: Optional[list[str]] = None
    diy_guide: Optional[list[str]] = None
    message: str = Field(description="Human-readable status message")
    created_at: datetime


class TextInputResponse(BaseModel):
    """Response after user provides fallback text input."""
    submission_id: UUID
    status: str
    message: str
