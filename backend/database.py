"""
database.py — Supabase client singleton + storage helpers.

Exposes:
  - `get_db()` → Supabase client (use in FastAPI Depends)
  - `upload_image()` → uploads bytes to Supabase Storage, returns public URL
"""
import io
from functools import lru_cache
from typing import Optional

from supabase import create_client, Client
from config import get_settings


@lru_cache
def get_db() -> Client:
    """
    Return a cached Supabase client using the SERVICE ROLE key.
    Service key bypasses Row Level Security — keep it server-side only.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def upload_image(
    image_bytes: bytes,
    file_name: str,
    content_type: str = "image/jpeg",
    folder: str = "submissions",
) -> str:
    """
    Upload raw image bytes to Supabase Storage.

    Returns the public URL of the uploaded file.

    Args:
        image_bytes:  Raw file bytes.
        file_name:    Target file name (e.g., "uuid.jpg").
        content_type: MIME type of the image.
        folder:       Sub-folder inside the storage bucket.
    """
    settings = get_settings()
    db = get_db()

    path = f"{folder}/{file_name}"

    db.storage.from_(settings.supabase_storage_bucket).upload(
        path=path,
        file=image_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    public_url: str = db.storage.from_(
        settings.supabase_storage_bucket
    ).get_public_url(path)

    return public_url


async def download_image(public_url: str) -> Optional[bytes]:
    """
    Download image bytes from a Supabase Storage public URL.
    Used by diy_service to re-fetch original images for comparison.
    """
    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.get(public_url, timeout=15.0)
        resp.raise_for_status()
        return resp.content
