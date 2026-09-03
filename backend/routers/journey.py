"""
routers/journey.py — Waste journey tracking endpoints

Endpoints:
  GET /api/v1/journey/track/{submission_id} — Get full journey timeline
"""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from database import get_db
from schemas.journey import JourneyResponse
from services.journey_service import get_journey

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/journey", tags=["Waste Journey"])


# ─────────────────────────────────────────────────────────────────────────────
# GET /journey/track/{submission_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/track/{submission_id}",
    response_model=JourneyResponse,
    summary="Track waste journey",
    description=(
        "Returns the full lifecycle timeline for a waste submission. "
        "Timeline includes: Collected → In Transit → DIY (Completed/Skipped/Pending) "
        "→ Facility Received → Recycled or Disposed. "
        "Estimated completion time is dynamically calculated based on hazard level."
    ),
)
async def track_journey(
    submission_id: str,
    db=Depends(get_db),
) -> JourneyResponse:
    """
    Retrieve the dynamic waste journey timeline for a submission.

    The journey record is created automatically when a submission is verified.
    DIY status and final status are updated by their respective services.
    """
    try:
        sub_uuid = uuid.UUID(submission_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid submission_id format. Must be a valid UUID.",
        )

    try:
        journey = await get_journey(submission_id=sub_uuid, db=db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    logger.info("Journey tracked for submission=%s", submission_id)
    return journey
