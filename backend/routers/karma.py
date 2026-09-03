"""
routers/karma.py — Green Karma Points endpoints

Endpoints:
  GET /api/v1/karma/{user_id}          — Get total karma points
  GET /api/v1/karma/{user_id}/ledger   — Get full karma history
  POST /api/v1/karma/award             — Award karma (internal/admin use)
"""

from __future__ import annotations

import logging
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from database import get_db
from schemas.karma import KarmaAwardResult, KarmaLedgerResponse, KarmaTotalResponse
from services.karma_service import award_karma, get_karma_ledger, get_karma_total

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/karma", tags=["Green Karma"])


# ─────────────────────────────────────────────────────────────────────────────
# GET /karma/{user_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{user_id}",
    response_model=KarmaTotalResponse,
    summary="Get user's total karma points",
)
async def get_total_karma(
    user_id: str,
    db=Depends(get_db),
) -> KarmaTotalResponse:
    """Return the current total karma score for a user."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format.",
        )

    try:
        return await get_karma_total(user_id=user_uuid, db=db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# GET /karma/{user_id}/ledger
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{user_id}/ledger",
    response_model=KarmaLedgerResponse,
    summary="Get user's full karma transaction history",
)
async def get_user_ledger(
    user_id: str,
    db=Depends(get_db),
) -> KarmaLedgerResponse:
    """Return full karma ledger (all transactions, newest first) for a user."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format.",
        )

    try:
        return await get_karma_ledger(user_id=user_uuid, db=db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# POST /karma/award  (internal/admin)
# ─────────────────────────────────────────────────────────────────────────────

class KarmaAwardRequest(BaseModel):
    user_id: str
    submission_id: str
    proof_type: Literal["drop_off", "diy"] = "drop_off"


@router.post(
    "/award",
    response_model=KarmaAwardResult,
    status_code=status.HTTP_201_CREATED,
    summary="Award karma points after verified proof (internal use)",
    description=(
        "Called by the system after drop-off or DIY proof is verified. "
        "Points are ONLY awarded once per proof type per submission (idempotent). "
        "Formula: 50 * hazard_level_multiplier (1.0×–3.0×)."
    ),
)
async def award_karma_points(
    body: KarmaAwardRequest,
    db=Depends(get_db),
) -> KarmaAwardResult:
    """
    Award karma to a user.
    This endpoint should be called by your backend logic, not directly by users.
    In production, secure this endpoint with admin authentication middleware.
    """
    try:
        user_uuid = uuid.UUID(body.user_id)
        sub_uuid = uuid.UUID(body.submission_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format in user_id or submission_id.",
        )

    try:
        result = await award_karma(
            user_id=user_uuid,
            submission_id=sub_uuid,
            proof_type=body.proof_type,
            db=db,
        )
        logger.info(
            "Karma awarded: user=%s points=%d proof_type=%s",
            body.user_id, result.points_awarded, body.proof_type,
        )
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
