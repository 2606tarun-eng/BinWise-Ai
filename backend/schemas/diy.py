"""
schemas/diy.py — Pydantic v2 models for DIY proof endpoints.
"""
from __future__ import annotations

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field


class DIYProofUploadResponse(BaseModel):
    """Response after user uploads a DIY proof image."""
    diy_project_id: UUID
    submission_id: UUID
    status: str = Field(description="'verified' | 'rejected'")
    proof_image_url: Optional[str] = None
    proof_hash: Optional[str] = None
    message: str
    updated_at: datetime


class DIYSkipResponse(BaseModel):
    """Response when user skips the DIY step."""
    diy_project_id: UUID
    submission_id: UUID
    status: str = "skipped"
    message: str = "DIY step skipped. Journey will continue to disposal/recycling."
    updated_at: datetime
