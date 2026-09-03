"""
schemas/karma.py — Pydantic v2 models for karma endpoints.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class KarmaLedgerEntry(BaseModel):
    """A single karma transaction from the ledger."""
    id: UUID
    submission_id: Optional[UUID] = None
    points_awarded: int
    reason: str
    proof_verified: bool
    timestamp: datetime


class KarmaTotalResponse(BaseModel):
    """User's current total karma points."""
    user_id: UUID
    total_karma_points: int
    message: str


class KarmaLedgerResponse(BaseModel):
    """Full karma history for a user."""
    user_id: UUID
    total_karma_points: int
    entries: list[KarmaLedgerEntry]


class KarmaAwardResult(BaseModel):
    """Internal result of a karma award operation."""
    ledger_id: UUID
    user_id: UUID
    points_awarded: int
    new_total: int
    reason: str
    proof_verified: bool
