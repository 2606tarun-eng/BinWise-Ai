"""
main.py — BinWise AI FastAPI Application Entrypoint

Run locally:
    cd backend
    pip install -r requirements.txt
    cp .env.example .env   # then fill in your keys
    uvicorn main:app --reload --port 8000

API Docs:
    http://localhost:8000/docs     (Swagger UI)
    http://localhost:8000/redoc    (ReDoc)
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from routers import waste, diy, journey, karma

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("binwise.main")

settings = get_settings()


# ─── Lifespan (startup / shutdown hooks) ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once on startup and once on shutdown.
    Use this to warm-up connections or validate config.
    """
    logger.info("🚀 BinWise AI backend starting up...")
    logger.info("Environment: %s", settings.app_env)
    logger.info("Gemini model: %s", settings.gemini_model)       # ← GEMINI INTEGRATION POINT
    logger.info("Supabase URL: %s", settings.supabase_url[:40] + "...")
    yield
    logger.info("🛑 BinWise AI backend shutting down.")


# ─── FastAPI Application ──────────────────────────────────────────────────────
app = FastAPI(
    title="BinWise AI — Smart Waste Management API",
    description="""
## 🌿 BinWise AI Backend

A REST API for intelligent waste classification, environmental impact analysis,
DIY upcycling guidance, and green karma rewards.

### Key Features
- **Image Verification**: Perceptual hash deduplication + Gemini Vision analysis
- **Environmental Impact**: Current burden & 50-year future risk assessment
- **DIY Upcycling**: AI-generated home project guides with proof verification
- **Waste Journey**: Real-time lifecycle tracking from collection to disposal
- **Green Karma**: Points awarded only after verified proof submission

### AI Provider
All AI analysis uses **Google Gemini Vision API**. To swap providers,
reimplement the functions marked with `← GEMINI INTEGRATION POINT` in the
service modules.
    """,
    version="1.0.0",
    contact={
        "name": "BinWise AI",
        "url": "https://binwise.ai",
    },
    license_info={
        "name": "MIT",
    },
    lifespan=lifespan,
)


# ─── CORS Middleware ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "type": type(exc).__name__,
        },
    )


# ─── Routers ──────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(waste.router,   prefix=API_PREFIX)
app.include_router(diy.router,     prefix=API_PREFIX)
app.include_router(journey.router, prefix=API_PREFIX)
app.include_router(karma.router,   prefix=API_PREFIX)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    """Returns service health status. Use for load balancer probes."""
    return {
        "status": "ok",
        "service": "BinWise AI Backend",
        "version": "1.0.0",
        "environment": settings.app_env,
    }


@app.get("/", tags=["System"], include_in_schema=False)
async def root():
    return {
        "message": "BinWise AI API is running. Visit /docs for Swagger UI.",
        "docs": "/docs",
        "health": "/health",
    }
