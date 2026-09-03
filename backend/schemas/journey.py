"""
schemas/journey.py — Pydantic v2 models for waste journey tracking.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class JourneyStep(BaseModel):
    """A single step in the waste journey timeline."""
    step: str = Field(description="Step name, e.g. 'Collected', 'In Transit', 'DIY', 'Recycled'")
    status: str = Field(description="'Completed' | 'Skipped' | 'Pending' | 'In Progress'")
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None


class JourneyResponse(BaseModel):
    """Full journey timeline for a waste submission."""
    journey_id: UUID
    submission_id: UUID
    waste_type: Optional[str] = None
    transit_start_time: datetime
    estimated_completion_time: Optional[datetime] = None
    final_status: Optional[str] = Field(
        default=None,
        description="'Recycled' | 'Disposed' — set when journey ends",
    )
    diy_status: Optional[str] = Field(
        default=None,
        description="'completed' | 'skipped'",
    )
    timeline: list[JourneyStep] = Field(
        description="Ordered list of journey steps with status"
    )
    days_remaining: Optional[int] = Field(
        default=None,
        description="Estimated days until disposal/recycling completes",
    )
