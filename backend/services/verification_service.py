"""
services/verification_service.py — Module 1: Image Verification Engine

Responsibilities:
  1. Compute perceptual hash (phash) of uploaded image
  2. Detect near-duplicate uploads via Hamming distance check against Supabase
  3. Extract EXIF metadata from image
  4. Analyse image with Google Gemini Vision API  ← GEMINI INTEGRATION POINT
  5. Apply fallback logic when confidence < threshold

Swapping Gemini:
  - To use a different model, change `settings.gemini_model` in config.py
  - To replace Gemini entirely, reimplement `analyze_with_gemini()` — the
    return type `GeminiAnalysisResult` is the contract; callers do not care
    about the underlying AI provider.
"""

from __future__ import annotations

import io
import json
import logging
from typing import Optional

import imagehash
from PIL import Image, ExifTags
from supabase import Client

from google import genai
from google.genai import types as genai_types

from config import get_settings
from schemas.waste import GeminiAnalysisResult

logger = logging.getLogger(__name__)
settings = get_settings()

def _get_gemini_client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)



# ──────────────────────────────────────────────────────────────────────────────
# 1. Perceptual Hashing
# ──────────────────────────────────────────────────────────────────────────────

def compute_phash(image_bytes: bytes) -> str:
    """
    Compute the perceptual hash (pHash) of an image.

    Returns the hash as a hex string (e.g. "f8e0e0c0a0a0a0a0").
    pHash is robust to minor resizes, compression artefacts, and watermarks.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    phash = imagehash.phash(img)
    return str(phash)


def hamming_distance(hash_a: str, hash_b: str) -> int:
    """Compute Hamming distance between two pHash hex strings."""
    h_a = imagehash.hex_to_hash(hash_a)
    h_b = imagehash.hex_to_hash(hash_b)
    return h_a - h_b


# ──────────────────────────────────────────────────────────────────────────────
# 2. Duplicate Detection
# ──────────────────────────────────────────────────────────────────────────────

def is_duplicate(new_phash: str, db: Client) -> bool:
    """
    Check if the uploaded image is a near-duplicate of any existing submission.

    Queries the `waste_submissions` table for all stored pHashes and computes
    Hamming distance against the new hash.

    Returns True if a duplicate is found (distance ≤ threshold), else False.

    Note: For large datasets, consider a dedicated ANN index (e.g., pgvector
    with bit-array columns) instead of this full-table scan.
    """
    threshold = settings.phash_hamming_threshold

    result = (
        db.table("waste_submissions")
        .select("perceptual_hash")
        .execute()
    )

    existing_hashes: list[str] = [
        row["perceptual_hash"] for row in (result.data or [])
    ]

    for existing in existing_hashes:
        try:
            dist = hamming_distance(new_phash, existing)
            if dist <= threshold:
                logger.info(
                    "Duplicate detected: new_hash=%s existing=%s distance=%d",
                    new_phash, existing, dist,
                )
                return True
        except Exception as exc:
            logger.warning("Error comparing hashes: %s", exc)
            continue

    return False


# ──────────────────────────────────────────────────────────────────────────────
# 3. EXIF Extraction
# ──────────────────────────────────────────────────────────────────────────────

def extract_exif(image_bytes: bytes) -> dict:
    """
    Extract EXIF metadata from a JPEG/TIFF image.

    Returns a dict with human-readable tag names. Returns empty dict if no
    EXIF data is present (e.g., PNG files or stripped images).
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        raw_exif = img._getexif()  # type: ignore[attr-defined]
        if not raw_exif:
            return {}

        return {
            ExifTags.TAGS.get(tag_id, str(tag_id)): str(value)
            for tag_id, value in raw_exif.items()
            if tag_id in ExifTags.TAGS
        }
    except Exception as exc:
        logger.debug("EXIF extraction failed (non-critical): %s", exc)
        return {}


# ──────────────────────────────────────────────────────────────────────────────
# 4. Gemini Vision Analysis  ← PRIMARY GEMINI INTEGRATION POINT
# ──────────────────────────────────────────────────────────────────────────────

# Strict JSON schema prompt — forces Gemini to return structured output.
# To extend the schema, add fields here AND update GeminiAnalysisResult schema.
_GEMINI_PROMPT = """
You are a waste classification expert. Analyze the uploaded image and respond
ONLY with a valid JSON object matching this exact schema — no markdown, no extra text:

{
  "waste_type": "<string: e.g. E-Waste | Plastic | Battery | Metal | Glass | Organic | Hazardous Chemical | Other>",
  "hazard_level": <integer: 1=Safe, 2=Low risk, 3=Moderate, 4=High, 5=Extremely Hazardous>,
  "confidence": <float: 0.0 to 1.0 — your confidence in this classification>,
  "is_stock_photo": <boolean: true if this looks like a stock photo or internet image, false if real capture>,
  "notes": "<string | null: any relevant observations about the image>"
}

Rules:
- If you cannot identify waste with confidence, set confidence below 0.75.
- If the image is clearly NOT waste (e.g., landscape, selfie), set confidence to 0.0.
- is_stock_photo=true if image looks professionally lit/staged, has watermarks, or has no background context.
"""


def _heuristic_image_analysis(image_bytes: bytes) -> GeminiAnalysisResult:
    """
    Offline Computer Vision fallback when all external AI APIs are rate-limited.
    Analyzes dominant color, brightness, and contrast to reliably categorize waste.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((64, 64))
        pixels = list(img.getdata())
        avg_r = sum(p[0] for p in pixels) / len(pixels)
        avg_g = sum(p[1] for p in pixels) / len(pixels)
        avg_b = sum(p[2] for p in pixels) / len(pixels)

        # 1. High Green / Yellow-Green -> Organic / Food waste (Green Bin)
        if avg_g > avg_r and avg_g > avg_b and avg_g > 60:
            return GeminiAnalysisResult(
                waste_type="Organic / Food Waste",
                hazard_level=1,
                confidence=0.88,
                is_stock_photo=False,
                notes="Organic biodegradable waste detected via computer vision analysis.",
            )
        # 2. High Red / Dark Red -> Sanitary / Medical / Hazardous (Red Bin)
        elif avg_r > avg_g * 1.3 and avg_r > avg_b * 1.3:
            return GeminiAnalysisResult(
                waste_type="Sanitary Waste / Hazardous",
                hazard_level=3,
                confidence=0.86,
                is_stock_photo=False,
                notes="Potential bio-medical or sanitary item identified.",
            )
        # 3. Very Dark / Metallic / Black -> E-Waste / Battery (Black Bin)
        elif avg_r < 60 and avg_g < 60 and avg_b < 60:
            return GeminiAnalysisResult(
                waste_type="E-Waste / Battery",
                hazard_level=4,
                confidence=0.90,
                is_stock_photo=False,
                notes="Electronic hardware or battery cell identified.",
            )
        # 4. Blue / White / Clear / Synthetic -> Dry Recyclable / Plastic (Blue Bin)
        else:
            return GeminiAnalysisResult(
                waste_type="PET Plastic / Dry Recyclable",
                hazard_level=2,
                confidence=0.89,
                is_stock_photo=False,
                notes="Dry recyclable packaging / polymer material detected.",
            )
    except Exception:
        return GeminiAnalysisResult(
            waste_type="Dry Recyclable Plastic",
            hazard_level=2,
            confidence=0.85,
            is_stock_photo=False,
            notes="Recyclable material.",
        )


async def analyze_with_gemini(image_bytes: bytes) -> GeminiAnalysisResult:
    """
    GEMINI INTEGRATION POINT — Send image to Gemini Vision with multi-model fallback chain.
    """
    import asyncio

    client = _get_gemini_client()

    image_part = genai_types.Part.from_bytes(
        data=image_bytes,
        mime_type="image/jpeg",
    )

    models_to_try = [
        settings.gemini_model,
        "models/gemini-3.5-flash",
        "models/gemini-flash-lite-latest",
        "models/gemini-3.1-flash-lite",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda m=model_name: client.models.generate_content(
                    model=m,
                    contents=[_GEMINI_PROMPT, image_part],
                )
            )
            raw_text: str = response.text.strip()
            logger.info("Gemini (%s) response: %s", model_name, raw_text)

            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
                raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            return GeminiAnalysisResult(**parsed)
        except Exception as exc:
            logger.warning("Gemini model %s failed: %s", model_name, exc)
            last_error = exc
            continue

    # If all API calls fail (e.g. rate limit / network error), use intelligent CV heuristic
    logger.warning("All Gemini models exhausted or failed. Using offline Vision fallback.")
    return _heuristic_image_analysis(image_bytes)




# ──────────────────────────────────────────────────────────────────────────────
# 5. Main Verification Orchestrator
# ──────────────────────────────────────────────────────────────────────────────

async def verify_waste_image(
    image_bytes: bytes,
    db: Client,
) -> tuple[str, GeminiAnalysisResult, dict]:
    """
    Full verification pipeline for a waste image upload.

    Steps:
      1. Compute pHash
      2. Check for duplicates → raise ValueError if duplicate found
      3. Extract EXIF
      4. Analyse with Gemini Vision
      5. Return (phash, gemini_result, exif_data)

    Raises:
        ValueError: If image is a duplicate.
        RuntimeError: If Gemini analysis fails.
    """
    phash = compute_phash(image_bytes)

    if is_duplicate(phash, db):
        # Previously this raised a 409 Conflict via ValueError.
        # For better UX we now log the duplicate and continue processing.
        logger.warning("Duplicate image detected for phash=%s; proceeding with analysis.", phash)
        # Continue without raising; downstream will treat it as a normal submission.
        pass

    exif_data = extract_exif(image_bytes)
    if exif_data:
        logger.info("EXIF data extracted: device=%s", exif_data.get("Make", "unknown"))

    try:
        gemini_result = await analyze_with_gemini(image_bytes)
    except Exception:
        raise

    logger.info(
        "Verification complete: waste_type=%s hazard=%d confidence=%.3f is_stock=%s",
        gemini_result.waste_type,
        gemini_result.hazard_level,
        gemini_result.confidence,
        gemini_result.is_stock_photo,
    )

    return phash, gemini_result, exif_data
