"""
services/workflow_service.py — Module 2: Impact Analysis & Industrial/DIY Workflows

Responsibilities:
  1. Environmental impact analysis (current burden + future risk)
  2. Industrial recycling process workflow (step-by-step)
  3. DIY upcycling guide (step-by-step)

All three use Gemini with structured prompts.  ← GEMINI INTEGRATION POINT

Design note:
  - This module NEVER reads past submission history — each call is fully
    independent and context-free as specified in requirements.
  - To swap AI providers: reimplement the three `_call_gemini_*` helpers.
    All public functions return typed dicts/lists that callers depend on.
"""

import asyncio
import json
import logging
from typing import Any

from google import genai

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def _get_gemini_client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


async def _call_gemini_json(prompt: str) -> Any:
    """
    GEMINI INTEGRATION POINT — Generic text-only Gemini call expecting JSON output.
    Uses new google.genai SDK with multi-model fallback.
    """
    client = _get_gemini_client()
    models_to_try = [
        settings.gemini_model,
        "models/gemini-3.5-flash",
        "models/gemini-flash-lite-latest",
        "models/gemini-3.1-flash-lite",
    ]
    for model_name in models_to_try:
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda m=model_name: client.models.generate_content(
                    model=m,
                    contents=prompt,
                )
            )
            raw = _strip_markdown_json(response.text)
            return json.loads(raw)
        except Exception as exc:
            logger.warning("Workflow Gemini model %s failed: %s", model_name, exc)
            continue

    logger.warning("All Gemini models failed for workflow JSON. Using fallback response.")
    return {}




# ──────────────────────────────────────────────────────────────────────────────
# 1. Environmental Impact Analysis
# ──────────────────────────────────────────────────────────────────────────────

_IMPACT_PROMPT_TEMPLATE = """
You are an environmental scientist. Analyze the following waste item and respond
ONLY with a valid JSON object — no markdown, no explanation:

Waste Type: {waste_type}
Hazard Level: {hazard_level}/5

IMPORTANT: Base your analysis ONLY on the general properties of this waste type.
Do NOT reference any past data, history, statistics databases, or prior submissions.

Return this exact schema:
{{
  "current_burden": {{
    "soil_toxicity": "<string: description of soil impact>",
    "landfill_space": "<string: volume/weight this typically occupies in landfills>",
    "air_quality_impact": "<string: VOC or particulate emissions>",
    "water_contamination_risk": "<string: leachate or runoff risk>",
    "summary": "<string: 1-2 sentence overall current burden>"
  }},
  "future_risk": {{
    "decay_timeline_years": <integer: estimated years to break down naturally>,
    "microplastic_risk": "<string: risk of generating microplastics>",
    "long_term_toxicity": "<string: 50-year chemical persistence risk>",
    "ecosystem_impact": "<string: risk to soil/water ecosystems long-term>",
    "summary": "<string: 1-2 sentence 50-year outlook>"
  }}
}}
"""


async def get_environmental_impact(
    waste_type: str,
    hazard_level: int,
) -> dict[str, Any]:
    """
    GEMINI INTEGRATION POINT — Get environmental impact data for a waste type.

    Returns a dict with keys: `current_burden` and `future_risk`.
    This function NEVER uses past submission data — analysis is purely based
    on waste_type + hazard_level properties.
    """
    prompt = _IMPACT_PROMPT_TEMPLATE.format(
        waste_type=waste_type,
        hazard_level=hazard_level,
    )
    result = await _call_gemini_json(prompt)
    logger.info("Environmental impact generated for waste_type=%s", waste_type)
    return result


# ──────────────────────────────────────────────────────────────────────────────
# 2. Industrial Recycling Workflow
# ──────────────────────────────────────────────────────────────────────────────

_INDUSTRIAL_PROMPT_TEMPLATE = """
You are an industrial recycling process engineer. Describe the step-by-step
industrial process for recycling/repurposing the following waste type.

Waste Type: {waste_type}

Respond ONLY with a JSON array of strings — each string is one step:
[
  "Step 1: ...",
  "Step 2: ...",
  ...
]

Include 5–10 concrete, specific steps. No markdown, no extra text.
"""


async def get_industrial_workflow(waste_type: str) -> list[str]:
    """
    GEMINI INTEGRATION POINT — Get industrial recycling steps for a waste type.
    Returns a list of step strings.
    """
    prompt = _INDUSTRIAL_PROMPT_TEMPLATE.format(waste_type=waste_type)
    result = await _call_gemini_json(prompt)

    if not isinstance(result, list):
        raise ValueError(f"Expected list of steps, got: {type(result)}")

    logger.info("Industrial workflow generated: %d steps", len(result))
    return [str(step) for step in result]


# ──────────────────────────────────────────────────────────────────────────────
# 3. DIY Upcycling Guide
# ──────────────────────────────────────────────────────────────────────────────

_DIY_PROMPT_TEMPLATE = """
You are a creative sustainability expert and DIY upcycling instructor.
Create a practical, home-friendly DIY upcycling guide for this waste item.

Waste Type: {waste_type}
Hazard Level: {hazard_level}/5 (higher = more safety precautions needed)

Respond ONLY with a JSON array of strings — each string is one actionable step:
[
  "Step 1: ...",
  "Step 2: ...",
  ...
]

Requirements:
- Include 5–8 steps.
- If hazard level >= 4, step 1 MUST be a safety warning about protective equipment.
- Steps should be simple enough for a non-expert home user.
- No markdown, no extra text.
"""


async def get_diy_guide(waste_type: str, hazard_level: int) -> list[str]:
    """
    GEMINI INTEGRATION POINT — Get DIY home upcycling steps for a waste type.
    Returns a list of step strings.
    """
    prompt = _DIY_PROMPT_TEMPLATE.format(
        waste_type=waste_type,
        hazard_level=hazard_level,
    )
    result = await _call_gemini_json(prompt)

    if not isinstance(result, list):
        raise ValueError(f"Expected list of steps, got: {type(result)}")

    logger.info("DIY guide generated: %d steps", len(result))
    return [str(step) for step in result]


# ──────────────────────────────────────────────────────────────────────────────
# 4. Determine Final Journey Status
# ──────────────────────────────────────────────────────────────────────────────

def determine_final_status(waste_type: str, hazard_level: int) -> str:
    """
    Determine whether a waste item should be marked 'Recycled' or 'Disposed'.

    Logic:
      - Hazard level 4–5 OR known non-recyclable types → 'Disposed'
      - Otherwise → 'Recycled'

    This is deterministic (no Gemini call) for speed and reliability.
    """
    non_recyclable_types = {
        "hazardous chemical",
        "asbestos",
        "radioactive",
        "biohazard",
        "contaminated soil",
    }

    if hazard_level >= 4:
        return "Disposed"

    if any(nt in waste_type.lower() for nt in non_recyclable_types):
        return "Disposed"

    return "Recycled"
