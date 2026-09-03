"""
services/diy_service.py — Module 3: DIY Proof Verification

Responsibilities:
  1. Receive proof image from user
  2. Compute pHash and check against:
       a) Original waste image pHash (must be different — it's a NEW photo)
       b) Database history (prevent re-using old proof images)
  3. Use Gemini Vision to verify proof is genuine  ← GEMINI INTEGRATION POINT
  4. Update waste_journeys.diy_status accordingly
  5. Handle skip flow

Swapping Gemini:
  - Reimplement `_verify_proof_with_gemini()`. Return a dict with keys:
    `is_valid` (bool) and `reason` (str). Callers depend only on this contract.
"""

from __future__ import annotations

import io
import json
import logging
from datetime import datetime, timezone
from uuid import UUID

import imagehash
from PIL import Image
from supabase import Client

from google import genai as new_genai
from google.genai import types as genai_types

from config import get_settings
from database import download_image
from services.verification_service import compute_phash, hamming_distance

logger = logging.getLogger(__name__)
settings = get_settings()

def _get_gemini_client() -> new_genai.Client:
    return new_genai.Client(api_key=settings.gemini_api_key)


async def _verify_proof_with_gemini(
    proof_bytes: bytes,
) -> dict:
    """
    GEMINI INTEGRATION POINT — Verify DIY proof image using Gemini Vision.
    Uses new google.genai SDK.

    Returns dict: {"is_valid": bool, "reason": str, "confidence": float}
    """
    import asyncio
    client = _get_gemini_client()
    image_part = genai_types.Part.from_bytes(
        data=proof_bytes,
        mime_type="image/jpeg",
    )
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=settings.gemini_model,
                contents=[_DIY_VERIFY_PROMPT, image_part],
            )
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        return json.loads(raw)
    except Exception as exc:
        logger.error("Gemini DIY proof verification failed: %s", exc)
        # Fail safe: if Gemini is unavailable, reject the proof
        return {"is_valid": False, "reason": f"Verification service unavailable: {exc}", "confidence": 0.0}



# ──────────────────────────────────────────────────────────────────────────────
# pHash Deduplication for Proof Images
# ──────────────────────────────────────────────────────────────────────────────

def _is_proof_duplicate(
    proof_phash: str,
    original_phash: str,
    db: Client,
) -> tuple[bool, str]:
    """
    Check if the proof image is a duplicate of:
      a) The original waste submission image (must differ — it's a new photo)
      b) Any previously accepted proof image in the DB

    Returns:
        (is_duplicate: bool, reason: str)
    """
    threshold = settings.phash_hamming_threshold

    # Check against original waste image
    orig_dist = hamming_distance(proof_phash, original_phash)
    if orig_dist <= threshold:
        return True, "Proof image appears identical to the original waste photo. Upload a photo of your completed DIY project."

    # Check against existing proof hashes in DB
    result = (
        db.table("diy_projects")
        .select("proof_hash")
        .not_.is_("proof_hash", "null")
        .execute()
    )
    existing_proofs: list[str] = [
        row["proof_hash"] for row in (result.data or [])
    ]

    for existing in existing_proofs:
        try:
            dist = hamming_distance(proof_phash, existing)
            if dist <= threshold:
                return True, "This proof image has already been used for another submission."
        except Exception:
            continue

    return False, ""


# ──────────────────────────────────────────────────────────────────────────────
# Public: Verify DIY Proof
# ──────────────────────────────────────────────────────────────────────────────

async def verify_diy_proof(
    submission_id: UUID,
    proof_bytes: bytes,
    db: Client,
) -> dict:
    """
    Full DIY proof verification pipeline.

    Steps:
      1. Fetch original submission (get original phash & diy_project id)
      2. Compute proof pHash
      3. Check for duplicates (vs original + DB history)
      4. Verify with Gemini Vision
      5. Update diy_projects and waste_journeys in Supabase

    Returns:
        dict with keys: diy_project_id, status, proof_image_url, proof_hash, message, updated_at
    """
    now = datetime.now(timezone.utc)

    # 1. Fetch original submission
    sub_result = (
        db.table("waste_submissions")
        .select("perceptual_hash, user_id")
        .eq("id", str(submission_id))
        .single()
        .execute()
    )
    if not sub_result.data:
        raise ValueError(f"Submission {submission_id} not found.")

    original_phash: str = sub_result.data["perceptual_hash"]

    # 2. Fetch or create diy_project record
    diy_result = (
        db.table("diy_projects")
        .select("id, status")
        .eq("submission_id", str(submission_id))
        .single()
        .execute()
    )
    if not diy_result.data:
        raise ValueError(f"No DIY project found for submission {submission_id}.")

    diy_project_id: str = diy_result.data["id"]

    # Check if already resolved
    if diy_result.data["status"] in ("verified", "skipped"):
        return {
            "diy_project_id": diy_project_id,
            "status": diy_result.data["status"],
            "proof_image_url": None,
            "proof_hash": None,
            "message": f"DIY project already {diy_result.data['status']}.",
            "updated_at": now,
        }

    # 3. Compute proof pHash
    proof_phash = compute_phash(proof_bytes)

    # 4. Duplicate check
    is_dup, dup_reason = _is_proof_duplicate(proof_phash, original_phash, db)
    if is_dup:
        # Update diy to rejected/pending — do NOT set skipped automatically
        db.table("diy_projects").update(
            {"updated_at": now.isoformat()}
        ).eq("id", diy_project_id).execute()

        return {
            "diy_project_id": diy_project_id,
            "status": "rejected",
            "proof_image_url": None,
            "proof_hash": proof_phash,
            "message": dup_reason,
            "updated_at": now,
        }

    # 5. Gemini verification  ← GEMINI INTEGRATION POINT
    gemini_verdict = await _verify_proof_with_gemini(proof_bytes)
    is_valid: bool = gemini_verdict.get("is_valid", False)
    reason: str = gemini_verdict.get("reason", "")

    if is_valid:
        new_status = "verified"
        message = "DIY proof verified successfully! Karma points will be awarded."
    else:
        new_status = "rejected"
        message = f"DIY proof rejected: {reason}"

    # 6. Update diy_projects
    db.table("diy_projects").update({
        "proof_hash": proof_phash,
        "status": new_status,
        "updated_at": now.isoformat(),
    }).eq("id", diy_project_id).execute()

    # 7. Update waste_journeys diy_status
    if new_status == "verified":
        db.table("waste_journeys").update({
            "diy_status": "completed",
            "updated_at": now.isoformat(),
        }).eq("submission_id", str(submission_id)).execute()

    logger.info(
        "DIY proof %s for submission=%s (phash=%s)",
        new_status, submission_id, proof_phash,
    )

    return {
        "diy_project_id": diy_project_id,
        "status": new_status,
        "proof_image_url": None,   # caller uploads to storage and sets this
        "proof_hash": proof_phash,
        "message": message,
        "updated_at": now,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Public: Skip DIY Step
# ──────────────────────────────────────────────────────────────────────────────

async def skip_diy(
    submission_id: UUID,
    db: Client,
) -> dict:
    """
    Mark the DIY project as skipped and update the waste journey accordingly.

    Returns:
        dict with keys: diy_project_id, status, message, updated_at
    """
    now = datetime.now(timezone.utc)

    diy_result = (
        db.table("diy_projects")
        .select("id")
        .eq("submission_id", str(submission_id))
        .single()
        .execute()
    )
    if not diy_result.data:
        raise ValueError(f"No DIY project found for submission {submission_id}.")

    diy_project_id: str = diy_result.data["id"]

    db.table("diy_projects").update({
        "status": "skipped",
        "updated_at": now.isoformat(),
    }).eq("id", diy_project_id).execute()

    db.table("waste_journeys").update({
        "diy_status": "skipped",
        "updated_at": now.isoformat(),
    }).eq("submission_id", str(submission_id)).execute()

    logger.info("DIY skipped for submission=%s", submission_id)

    return {
        "diy_project_id": diy_project_id,
        "status": "skipped",
        "message": "DIY step skipped. Journey will continue to disposal/recycling.",
        "updated_at": now,
    }
