"""
routers/diy.py — DIY proof & skip endpoints

Endpoints:
  POST /api/v1/diy/{submission_id}/proof  — Upload DIY proof image
  POST /api/v1/diy/{submission_id}/skip   — Skip DIY step
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from database import get_db, upload_image
from schemas.diy import DIYProofUploadResponse, DIYSkipResponse
from services.diy_service import verify_diy_proof, skip_diy

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diy", tags=["DIY Projects"])

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


# ─────────────────────────────────────────────────────────────────────────────
# POST /diy/{submission_id}/proof
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/{submission_id}/proof",
    response_model=DIYProofUploadResponse,
    summary="Upload DIY upcycling proof image",
    description=(
        "User uploads a photo of their completed DIY upcycling project. "
        "System verifies with Gemini Vision + pHash deduplication. "
        "If verified, `waste_journeys.diy_status` is set to `completed` "
        "and karma is ready to be awarded."
    ),
)
async def upload_diy_proof(
    submission_id: str,
    proof_image: UploadFile = File(..., description="Photo of completed DIY project"),
    db=Depends(get_db),
) -> DIYProofUploadResponse:
    """
    DIY proof upload pipeline:
      1. Validate image
      2. Run phash dedup + Gemini verification (via diy_service)
      3. Upload verified proof image to Supabase Storage
      4. Return result
    """
    # Validate UUID
    try:
        sub_uuid = uuid.UUID(submission_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid submission_id format. Must be a valid UUID.",
        )

    # Validate image
    if proof_image.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {proof_image.content_type}.",
        )

    proof_bytes = await proof_image.read()
    if len(proof_bytes) > _MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Proof image exceeds 10 MB limit.",
        )

    # Run verification
    try:
        result = await verify_diy_proof(
            submission_id=sub_uuid,
            proof_bytes=proof_bytes,
            db=db,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    # Upload proof image to storage (only if verified)
    proof_url: str | None = None
    if result["status"] == "verified":
        file_ext = proof_image.filename.rsplit(".", 1)[-1] if proof_image.filename else "jpg"
        file_name = f"proof_{uuid.uuid4()}.{file_ext}"
        proof_url = await upload_image(
            image_bytes=proof_bytes,
            file_name=file_name,
            content_type=proof_image.content_type or "image/jpeg",
            folder="diy-proofs",
        )
        # Update diy_projects with proof URL
        db.table("diy_projects").update({
            "proof_image_url": proof_url,
        }).eq("id", str(result["diy_project_id"])).execute()

    logger.info(
        "DIY proof upload: submission=%s status=%s",
        submission_id, result["status"],
    )

    return DIYProofUploadResponse(
        diy_project_id=result["diy_project_id"],
        submission_id=sub_uuid,
        status=result["status"],
        proof_image_url=proof_url,
        proof_hash=result.get("proof_hash"),
        message=result["message"],
        updated_at=result["updated_at"],
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /diy/{submission_id}/skip
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/{submission_id}/skip",
    response_model=DIYSkipResponse,
    summary="Skip the DIY upcycling step",
    description=(
        "User opts out of the DIY step. "
        "`waste_journeys.diy_status` is set to `skipped`. "
        "The waste journey continues to facility disposal/recycling."
    ),
)
async def skip_diy_step(
    submission_id: str,
    db=Depends(get_db),
) -> DIYSkipResponse:
    """Mark DIY project as skipped for the given submission."""
    try:
        sub_uuid = uuid.UUID(submission_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid submission_id format.",
        )

    try:
        result = await skip_diy(submission_id=sub_uuid, db=db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    logger.info("DIY skipped for submission=%s", submission_id)

    return DIYSkipResponse(
        diy_project_id=result["diy_project_id"],
        submission_id=sub_uuid,
        status="skipped",
        message=result["message"],
        updated_at=result["updated_at"],
    )
