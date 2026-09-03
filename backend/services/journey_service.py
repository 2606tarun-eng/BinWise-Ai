"""
services/journey_service.py — Module 4: Waste Journey & API Tracker

Responsibilities:
  1. Build a dynamic journey timeline for a waste submission
  2. Calculate transit durations and estimated completion date
  3. Incorporate DIY step status (completed / skipped / pending)
  4. Determine and return final status (Recycled / Disposed)

No AI calls are made here — journey data is assembled from Supabase state.
Timeline durations are calculated based on hazard level (mock REST API logic).
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta
from uuid import UUID

from supabase import Client

from schemas.journey import JourneyResponse, JourneyStep

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Transit duration lookup (mock — replace with real logistics API if available)
# ──────────────────────────────────────────────────────────────────────────────

# Estimated total days from collection to disposal/recycling based on hazard level
_HAZARD_TRANSIT_DAYS: dict[int, int] = {
    1: 7,
    2: 10,
    3: 14,
    4: 21,   # Hazardous waste requires specialised handling
    5: 30,   # Extremely hazardous — certified disposal facilities
}


def _get_transit_days(hazard_level: int) -> int:
    return _HAZARD_TRANSIT_DAYS.get(hazard_level, 14)


# ──────────────────────────────────────────────────────────────────────────────
# Timeline builder
# ──────────────────────────────────────────────────────────────────────────────

def _build_timeline(
    transit_start: datetime,
    diy_status: str | None,
    final_status: str | None,
    transit_days: int,
) -> list[JourneyStep]:
    """
    Build an ordered list of JourneyStep objects representing the waste lifecycle.

    Timeline structure:
      1. Collected         → always Completed (submission exists)
      2. In Transit        → In Progress or Completed
      3. DIY Upcycling     → Completed | Skipped | Pending
      4. Facility Received → Completed if final_status is set
      5. Recycled/Disposed → final step mirroring final_status
    """
    now = datetime.now(timezone.utc)
    steps: list[JourneyStep] = []

    # Step 1: Collected
    steps.append(JourneyStep(
        step="Collected",
        status="Completed",
        timestamp=transit_start,
        notes="Waste item submitted and verified by BinWise AI.",
    ))

    # Step 2: In Transit
    transit_eta = transit_start + timedelta(days=transit_days // 2)
    transit_done = now >= transit_eta
    steps.append(JourneyStep(
        step="In Transit",
        status="Completed" if transit_done else "In Progress",
        timestamp=transit_eta if transit_done else None,
        notes=f"Expected at facility within {transit_days // 2} days of collection.",
    ))

    # Step 3: DIY Upcycling
    if diy_status == "completed":
        steps.append(JourneyStep(
            step="DIY Upcycling",
            status="Completed",
            timestamp=now,
            notes="User completed a DIY upcycling project. Bonus karma awarded.",
        ))
    elif diy_status == "skipped":
        steps.append(JourneyStep(
            step="DIY Upcycling",
            status="Skipped",
            timestamp=None,
            notes="User opted to skip the DIY step.",
        ))
    else:
        steps.append(JourneyStep(
            step="DIY Upcycling",
            status="Pending",
            timestamp=None,
            notes="Awaiting user's DIY proof upload or skip decision.",
        ))

    # Step 4: Facility Received
    facility_eta = transit_start + timedelta(days=transit_days)
    facility_done = now >= facility_eta and final_status is not None
    steps.append(JourneyStep(
        step="Facility Received",
        status="Completed" if facility_done else "Pending",
        timestamp=facility_eta if facility_done else None,
        notes="Item received at certified recycling/disposal facility.",
    ))

    # Step 5: Final step
    if final_status:
        steps.append(JourneyStep(
            step=final_status,   # "Recycled" or "Disposed"
            status="Completed" if facility_done else "Pending",
            timestamp=facility_eta if facility_done else None,
            notes=(
                "Item successfully recycled and repurposed."
                if final_status == "Recycled"
                else "Item safely disposed of per hazardous waste regulations."
            ),
        ))
    else:
        steps.append(JourneyStep(
            step="Awaiting Final Status",
            status="Pending",
            timestamp=None,
            notes="Journey will end with either Recycled or Disposed status.",
        ))

    return steps


# ──────────────────────────────────────────────────────────────────────────────
# Public: Get Journey
# ──────────────────────────────────────────────────────────────────────────────

async def get_journey(
    submission_id: UUID,
    db: Client,
) -> JourneyResponse:
    """
    Retrieve and build the complete waste journey for a submission.

    Fetches journey + submission data from Supabase, then constructs
    a dynamic timeline with transit durations, DIY step, and final status.

    Args:
        submission_id: UUID of the waste submission.
        db:            Supabase client.

    Returns:
        JourneyResponse with full timeline.

    Raises:
        ValueError: If no journey record exists for the submission.
    """
    # Fetch journey record
    journey_result = (
        db.table("waste_journeys")
        .select("*")
        .eq("submission_id", str(submission_id))
        .single()
        .execute()
    )
    if not journey_result.data:
        raise ValueError(
            f"No journey found for submission {submission_id}. "
            "The journey is created automatically when a submission is verified."
        )

    journey = journey_result.data

    # Fetch submission for hazard level + waste type
    sub_result = (
        db.table("waste_submissions")
        .select("waste_type, hazard_level")
        .eq("id", str(submission_id))
        .single()
        .execute()
    )
    sub = sub_result.data or {}
    hazard_level: int = sub.get("hazard_level") or 2
    waste_type: str | None = sub.get("waste_type")

    # Parse timestamps
    transit_start = datetime.fromisoformat(
        journey["transit_start_time"].replace("Z", "+00:00")
    )

    estimated_completion_str: str | None = journey.get("estimated_completion_time")
    estimated_completion = (
        datetime.fromisoformat(estimated_completion_str.replace("Z", "+00:00"))
        if estimated_completion_str
        else None
    )

    diy_status: str | None = journey.get("diy_status")
    final_status: str | None = journey.get("final_status")

    transit_days = _get_transit_days(hazard_level)

    # Build dynamic timeline
    timeline = _build_timeline(
        transit_start=transit_start,
        diy_status=diy_status,
        final_status=final_status,
        transit_days=transit_days,
    )

    # Calculate days remaining
    completion_dt = estimated_completion or (
        transit_start + timedelta(days=transit_days)
    )
    now = datetime.now(timezone.utc)
    days_remaining = max(0, (completion_dt - now).days) if completion_dt > now else 0

    logger.info(
        "Journey fetched: submission=%s diy=%s final=%s days_remaining=%d",
        submission_id, diy_status, final_status, days_remaining,
    )

    return JourneyResponse(
        journey_id=journey["id"],
        submission_id=submission_id,
        waste_type=waste_type,
        transit_start_time=transit_start,
        estimated_completion_time=estimated_completion or completion_dt,
        final_status=final_status,
        diy_status=diy_status,
        timeline=timeline,
        days_remaining=days_remaining,
    )
