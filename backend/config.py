"""
config.py — Application configuration via Pydantic Settings.

All values are read from environment variables (or .env file).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────────────────────
    supabase_url: str
    supabase_service_key: str
    supabase_storage_bucket: str = "waste-images"

    # ── Google Gemini ─────────────────────────────────────────────────────────
    # GEMINI INTEGRATION POINT: swap API key / model name here
    gemini_api_key: str = ""
    gemini_model: str = "models/gemini-2.0-flash"  # active free model for vision classification

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    secret_key: str = "change-me"
    allowed_origins: str = "http://localhost:3000"

    # ── Verification thresholds ───────────────────────────────────────────────
    gemini_confidence_threshold: float = 0.75       # below this → pending_text_input
    phash_hamming_threshold: int = 5                # max hamming distance for duplicate

    # ── Karma formula ─────────────────────────────────────────────────────────
    karma_base_points: int = 50
    # Hazard multipliers indexed by level 1-5
    karma_hazard_multipliers: dict[int, float] = {
        1: 1.0,
        2: 1.4,
        3: 1.8,
        4: 2.4,
        5: 3.0,
    }

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings instance (read once on first call)."""
    return Settings()
