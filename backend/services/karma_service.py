"""
services/karma_service.py — Module 5: Green Karma Points Engine

Responsibilities:
  1. Award karma points ONLY after verified proof (drop-off or DIY)
  2. Apply formula: Base (50) * Hazard Multiplier (1.0–3.0)
  3. Write to karma_ledger (immutable audit trail)
  4. Update users.karma_points running total
  5. Provide karma summary and ledger history

No AI calls — this module is purely deterministic.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import UUID, uuid4

from supabase import Client

from config import get_settings
from schemas.karma import KarmaAwardResult, KarmaLedgerResponse, KarmaTotalResponse

logger = logging.getLogger(__name__)
settings = get_settings()


# ──────────────────────────────────────────────────────────────────────────────
# Formula
# ──────────────────────────────────────────────────────────────────────────────

def calculate_karma_points(hazard_level: int) -> tuple[int, float]:
    """
    Calculate karma points for a submission.

    Formula: floor(BASE_POINTS * hazard_multiplier)

    Args:
        hazard_level: Integer 1–5 from waste_submissions.hazard_level

    Returns:
        Tuple of (points: int, multiplier: float)
    """
    multiplier = settings.karma_hazard_multipliers.get(hazard_level, 1.0)
    points = int(settings.karma_base_points * multiplier)
    return points, multiplier


# ──────────────────────────────────────────────────────────────────────────────
# Public: Award Karma
# ──────────────────────────────────────────────────────────────────────────────

async def award_karma(
    user_id: UUID,
    submission_id: UUID,
    proof_type: str,   # "drop_off" | "diy"
    db: Client,
) -> KarmaAwardResult:
    """
    Award karma points to a user after verified proof.

    Points are ONLY awarded when this function is called — callers must ensure
    proof has been verified before calling. No automatic award happens.

    Steps:
      1. Fetch hazard_level from waste_submissions
      2. Calculate points using formula
      3. Prevent duplicate awards (idempotency check on karma_ledger)
      4. Insert into karma_ledger
      5. Increment users.karma_points

    Args:
        user_id:       UUID of the user receiving karma.
        submission_id: UUID of the verified waste submission.
        proof_type:    "drop_off" or "diy" — determines ledger reason string.
        db:            Supabase client.

    Returns:
        KarmaAwardResult with ledger_id, points_awarded, and new_total.

    Raises:
        ValueError: If submission not found, or points already awarded for this proof type.
    """
    now = datetime.now(timezone.utc)

    # 1. Fetch submission for hazard level
    sub_result = (
        db.table("waste_submissions")
        .select("hazard_level, status")
        .eq("id", str(submission_id))
        .single()
        .execute()
    )
    if not sub_result.data:
        raise ValueError(f"Submission {submission_id} not found.")

    sub = sub_result.data
    if sub["status"] != "verified":
        raise ValueError(
            f"Karma can only be awarded for 'verified' submissions. "
            f"Current status: {sub['status']}"
        )

    hazard_level: int = sub.get("hazard_level") or 1
    points, multiplier = calculate_karma_points(hazard_level)

    # Build reason string
    reason = (
        f"Drop-off proof verified for submission {submission_id}"
        if proof_type == "drop_off"
        else f"DIY upcycling proof verified for submission {submission_id}"
    )

    # 2. Idempotency: check if karma already awarded for this submission + proof_type
    existing = (
        db.table("karma_ledger")
        .select("id")
        .eq("user_id", str(user_id))
        .eq("submission_id", str(submission_id))
        .ilike("reason", f"%{proof_type}%")
        .execute()
    )
    if existing.data:
        raise ValueError(
            f"Karma already awarded for {proof_type} proof on submission {submission_id}."
        )

    # 3. Insert karma_ledger entry
    ledger_row = {
        "user_id": str(user_id),
        "submission_id": str(submission_id),
        "points_awarded": points,
        "reason": reason,
        "proof_verified": True,
        "timestamp": now.isoformat(),
    }
    ledger_result = db.table("karma_ledger").insert(ledger_row).execute()
    ledger_id: str = ledger_result.data[0]["id"]

    # 4. Increment users.karma_points using RPC (atomic increment)
    # Using Supabase RPC for atomic update to prevent race conditions
    db.rpc(
        "increment_karma",
        {"p_user_id": str(user_id), "p_points": points},
    ).execute()

    # Fetch updated total
    user_result = (
        db.table("users")
        .select("karma_points")
        .eq("id", str(user_id))
        .single()
        .execute()
    )
    new_total: int = user_result.data["karma_points"] if user_result.data else points

    logger.info(
        "Karma awarded: user=%s points=%d multiplier=%.1f new_total=%d reason=%s",
        user_id, points, multiplier, new_total, proof_type,
    )

    return KarmaAwardResult(
        ledger_id=UUID(ledger_id),
        user_id=user_id,
        points_awarded=points,
        new_total=new_total,
        reason=reason,
        proof_verified=True,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Public: Get Karma Total
# ──────────────────────────────────────────────────────────────────────────────

async def get_karma_total(
    user_id: UUID,
    db: Client,
) -> KarmaTotalResponse:
    """Fetch the current total karma points for a user."""
    result = (
        db.table("users")
        .select("karma_points")
        .eq("id", str(user_id))
        .single()
        .execute()
    )
    if not result.data:
        raise ValueError(f"User {user_id} not found.")

    total: int = result.data["karma_points"]

    return KarmaTotalResponse(
        user_id=user_id,
        total_karma_points=total,
        message=f"You have {total} Green Karma Points. Keep recycling! 🌱",
    )


# ──────────────────────────────────────────────────────────────────────────────
# Public: Get Karma Ledger
# ──────────────────────────────────────────────────────────────────────────────

async def get_karma_ledger(
    user_id: UUID,
    db: Client,
) -> KarmaLedgerResponse:
    """Fetch the full karma transaction history for a user."""
    ledger_result = (
        db.table("karma_ledger")
        .select("*")
        .eq("user_id", str(user_id))
        .order("timestamp", desc=True)
        .execute()
    )

    user_result = (
        db.table("users")
        .select("karma_points")
        .eq("id", str(user_id))
        .single()
        .execute()
    )
    if not user_result.data:
        raise ValueError(f"User {user_id} not found.")

    total: int = user_result.data["karma_points"]
    entries = ledger_result.data or []

    return KarmaLedgerResponse(
        user_id=user_id,
        total_karma_points=total,
        entries=entries,
    )
