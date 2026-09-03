"""
routers/waste.py — Waste submission REST endpoints

Endpoints:
  POST /api/v1/waste/submit        — Upload image, run verification + analysis
  PATCH /api/v1/waste/{id}/text-input — Provide fallback text for low-confidence submissions
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from config import get_settings
from database import get_db, upload_image
from schemas.waste import TextInputRequest, TextInputResponse, WasteSubmitResponse, EnvironmentalImpact
from services.verification_service import verify_waste_image
from services.workflow_service import (
    get_environmental_impact,
    get_industrial_workflow,
    get_diy_guide,
    determine_final_status,
)

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/waste", tags=["Waste Submissions"])

# ── Allowed image MIME types ───────────────────────────────────────────────────
_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


# ─────────────────────────────────────────────────────────────────────────────
# POST /waste/submit
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/submit",
    response_model=WasteSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a waste image for AI analysis",
    description=(
        "Upload a waste photo. The system computes a perceptual hash "
        "(duplicate detection), extracts EXIF metadata, and runs Gemini Vision "
        "analysis to classify the waste type and hazard level. "
        "If Gemini confidence < 0.75, status is set to `pending_text_input`."
    ),
)
async def submit_waste(
    user_id: str = Form(..., description="UUID of the submitting user"),
    image: UploadFile = File(..., description="Waste photo (JPEG/PNG/WebP, max 10 MB)"),
    db=Depends(get_db),
) -> WasteSubmitResponse:
    """
    Full waste submission pipeline:
      1. Validate image type + size
      2. Run verification (phash + Gemini)
      3. Upload image to Supabase Storage
      4. Run impact + workflow analysis (if verified)
      5. Persist submission + journey records to Supabase
      6. Return full analysis response
    """
    # ── 1. Validate inputs ────────────────────────────────────────────────────
    if image.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {image.content_type}. Use JPEG, PNG, or WebP.",
        )

    image_bytes = await image.read()
    if len(image_bytes) > _MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds maximum size of 10 MB.",
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format. Must be a valid UUID.",
        )

    # ── 2. Verify image (phash + Gemini Vision) ───────────────────────────────
    try:
        phash, gemini_result, exif_data = await verify_waste_image(image_bytes, db)
    except ValueError as exc:
        # Duplicate image or bad input
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except RuntimeError as exc:
        # Gemini API failure
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI analysis service unavailable: {exc}",
        )

    # ── 3. Determine submission status ────────────────────────────────────────
    is_low_confidence = (
        gemini_result.confidence < settings.gemini_confidence_threshold
    )
    sub_status = "pending_text_input" if is_low_confidence else "verified"

    # ── 4. Upload image to Supabase Storage ───────────────────────────────────
    file_ext = image.filename.rsplit(".", 1)[-1] if image.filename else "jpg"
    file_name = f"{uuid.uuid4()}.{file_ext}"
    image_url = await upload_image(
        image_bytes=image_bytes,
        file_name=file_name,
        content_type=image.content_type or "image/jpeg",
    )

    # ── 5a. Run workflow analysis (only for verified submissions) ─────────────
    impact: EnvironmentalImpact | None = None
    industrial_workflow: list[str] | None = None
    diy_guide: list[str] | None = None

    if sub_status == "verified":
        try:
            impact_data = await get_environmental_impact(
                gemini_result.waste_type, gemini_result.hazard_level
            )
            impact = EnvironmentalImpact(
                current_burden=impact_data.get("current_burden", {}),
                future_risk=impact_data.get("future_risk", {}),
            )
            industrial_workflow = await get_industrial_workflow(gemini_result.waste_type)
            diy_guide = await get_diy_guide(
                gemini_result.waste_type, gemini_result.hazard_level
            )
        except Exception as exc:
            logger.warning("Workflow analysis failed (non-fatal): %s", exc)
            # Continue without workflow data — submission still saved

    # ── 5b. Ensure user exists in users table ──────────────────────────────
    user_check = db.table("users").select("id").eq("id", str(user_uuid)).execute()
    if not user_check.data:
        db.table("users").insert({
            "id": str(user_uuid),
            "email": f"user_{str(user_uuid)[:8]}@binwise.ai",
            "karma_points": 0
        }).execute()

    # ── 5c. Persist to Supabase ───────────────────────────────────────────────
    now = datetime.now(timezone.utc)
    submission_id = uuid.uuid4()

    submission_row = {
        "id": str(submission_id),
        "user_id": str(user_uuid),
        "image_url": image_url,
        "perceptual_hash": phash,
        "waste_type": gemini_result.waste_type if sub_status == "verified" else None,
        "hazard_level": gemini_result.hazard_level if sub_status == "verified" else None,
        "current_burden": impact.current_burden if impact else None,
        "future_risk": impact.future_risk if impact else None,
        "gemini_confidence": float(gemini_result.confidence),
        "status": sub_status,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    db.table("waste_submissions").insert(submission_row).execute()

    # ── 5c. Create journey + DIY project records (only for verified) ──────────
    if sub_status == "verified":
        final_status = determine_final_status(
            gemini_result.waste_type, gemini_result.hazard_level
        )
        transit_days = _get_transit_days_for_hazard(gemini_result.hazard_level)

        journey_row = {
            "submission_id": str(submission_id),
            "transit_start_time": now.isoformat(),
            "estimated_completion_time": (
                now + timedelta(days=transit_days)
            ).isoformat(),
            "final_status": None,   # set when journey ends
            "diy_status": None,     # set by diy_service
        }
        db.table("waste_journeys").insert(journey_row).execute()

        diy_row = {
            "submission_id": str(submission_id),
            "user_id": str(user_uuid),
            "steps_json": diy_guide,
            "status": "pending",
        }
        db.table("diy_projects").insert(diy_row).execute()

    # ── 6. Build and return response ──────────────────────────────────────────
    message = (
        "Image verified and analysed successfully."
        if sub_status == "verified"
        else (
            "Image analysis confidence is low. Please provide a text description "
            "using PATCH /waste/{id}/text-input to help classify this item."
        )
    )

    logger.info(
        "Waste submitted: id=%s status=%s confidence=%.3f",
        submission_id, sub_status, gemini_result.confidence,
    )

    return WasteSubmitResponse(
        submission_id=submission_id,
        status=sub_status,
        waste_type=gemini_result.waste_type,
        hazard_level=gemini_result.hazard_level,
        gemini_confidence=gemini_result.confidence,
        is_stock_photo=gemini_result.is_stock_photo,
        perceptual_hash=phash,
        image_url=image_url,
        environmental_impact=impact,
        industrial_workflow=industrial_workflow,
        diy_guide=diy_guide,
        message=message,
        created_at=now,
    )


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /waste/{submission_id}/text-input
# ─────────────────────────────────────────────────────────────────────────────

@router.patch(
    "/{submission_id}/text-input",
    response_model=TextInputResponse,
    summary="Provide text description for low-confidence submission",
    description=(
        "Called when submission status is `pending_text_input`. "
        "The user provides a manual description which is saved and status "
        "is updated to `verified`."
    ),
)
async def provide_text_input(
    submission_id: str,
    body: TextInputRequest,
    db=Depends(get_db),
) -> TextInputResponse:
    """
    Fallback text input flow for low-confidence Gemini results.

    Validates the submission is in `pending_text_input` state, then
    saves the user's description and transitions to `verified`.
    """
    # Validate UUID
    try:
        sub_uuid = uuid.UUID(submission_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid submission_id format.",
        )

    # Fetch current submission
    result = (
        db.table("waste_submissions")
        .select("id, status, waste_type, hazard_level, user_id")
        .eq("id", submission_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {submission_id} not found.",
        )

    sub = result.data
    if sub["status"] != "pending_text_input":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Submission status is '{sub['status']}'. Text input only accepted for 'pending_text_input' submissions.",
        )

    now = datetime.now(timezone.utc)

    # Save text input and mark verified
    db.table("waste_submissions").update({
        "user_text_input": body.description,
        "status": "verified",
        "updated_at": now.isoformat(),
    }).eq("id", submission_id).execute()

    # Create journey + DIY records if they don't exist yet
    existing_journey = (
        db.table("waste_journeys")
        .select("id")
        .eq("submission_id", submission_id)
        .execute()
    )
    if not existing_journey.data:
        hazard_level = sub.get("hazard_level") or 2
        transit_days = _get_transit_days_for_hazard(hazard_level)

        db.table("waste_journeys").insert({
            "submission_id": submission_id,
            "transit_start_time": now.isoformat(),
            "estimated_completion_time": (now + timedelta(days=transit_days)).isoformat(),
        }).execute()

        db.table("diy_projects").insert({
            "submission_id": submission_id,
            "user_id": sub["user_id"],
            "status": "pending",
        }).execute()

    logger.info("Text input accepted for submission=%s", submission_id)

    return TextInputResponse(
        submission_id=sub_uuid,
        status="verified",
        message="Thank you! Your description has been saved and the submission is now verified.",
    )


# ── Internal helper (avoids circular import with journey_service) ─────────────
def _get_transit_days_for_hazard(hazard_level: int) -> int:
    _DAYS = {1: 7, 2: 10, 3: 14, 4: 21, 5: 30}
    return _DAYS.get(hazard_level, 14)
